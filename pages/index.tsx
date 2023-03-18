import {
  Center,
  Container,
  Loader,
  Stack,
  TextInput,
  Image,
  Flex,
  Slider,
  ActionIcon,
} from "@mantine/core";
import { useCallback, useState } from "react";
import { IconArrowRight, IconX } from "@tabler/icons-react";
import { GeneratedImage } from "$/components/GeneratedImage";

type ImageSources = [string | null, string | null, string | null];

const NO_SOURCES: ImageSources = [null, null, null];

export default function Page() {
  const [apiState, setApiState] = useState<"idle" | "loading" | "completed">(
    "idle"
  );
  const [prompt, setPrompt] = useState("");
  const [imageSize, setImageSize] = useState(256);
  const [imageSources, setImageSources] = useState<ImageSources>(NO_SOURCES);

  const updatePrompt = useCallback((value: string) => {
    if (value === "") {
      setApiState("idle");
      setImageSources(NO_SOURCES);
    }

    setPrompt(value);
  }, []);

  const onPromptChange = useCallback((e) => {
    updatePrompt(e.target.value);
  }, []);

  const onResetPrompt = useCallback(() => {
    updatePrompt("");
  }, []);

  const onSubmitPrompt = useCallback(
    (e) => {
      e.preventDefault();

      setApiState("loading");

      const apiUrl = new URL("/api/generate", location.href);
      apiUrl.searchParams.append("prompt", prompt);

      fetch(apiUrl)
        .then((res) => res.json())
        .then((json) => {
          setApiState("completed");
          setImageSources(json.images);
        });
    },
    [prompt]
  );

  const promptIndicator = {
    idle: (
      <ActionIcon
        size="xl"
        radius="xl"
        variant="light"
        onClick={onSubmitPrompt}
        disabled={!prompt}
      >
        <IconArrowRight size="1.5rem" />
      </ActionIcon>
    ),

    loading: <Loader size="lg" />,

    completed: (
      <ActionIcon size="xl" radius="xl" variant="light" onClick={onResetPrompt}>
        <IconX size="1.5rem" />
      </ActionIcon>
    ),
  };

  return (
    <Container size="md" pt="xl">
      <Stack spacing="xl">
        <Center inline>
          <Image src="/logo.svg" width={300} />
        </Center>
        <form onSubmit={onSubmitPrompt}>
          <TextInput
            value={prompt}
            onChange={onPromptChange}
            size="xl"
            placeholder="Your prompt"
            radius="xl"
            rightSection={promptIndicator[apiState]}
            onSubmit={onSubmitPrompt}
          />
        </form>
        <Slider
          max={512}
          min={16}
          value={imageSize}
          onChange={setImageSize}
          marks={[
            { value: 16, label: "16px" },
            { value: 24, label: "24px" },
            { value: 32, label: "32px" },
            { value: 64, label: "64px" },
            { value: 128, label: "128px" },
            { value: 256, label: "256px" },
            { value: 512, label: "512px" },
          ]}
        />
        {apiState !== "idle" ? (
          <Flex
            gap="sm"
            wrap="wrap"
            justify="center"
            sx={(theme) => ({
              paddingTop: theme.spacing.xl,
            })}
          >
            {imageSources.map((src, i) => (
              <GeneratedImage
                size={imageSize}
                src={src}
                key={i}
                prompt={prompt}
              />
            ))}
          </Flex>
        ) : null}
      </Stack>
    </Container>
  );
}
