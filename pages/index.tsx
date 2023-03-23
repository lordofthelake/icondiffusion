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
import { useGenerationApi } from "$/hooks/useGenerationApi";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  const api = useGenerationApi(submittedPrompt);
  const [imageSize, setImageSize] = useState(256);

  const onPromptChange = useCallback((e) => {
    setPrompt(e.target.value);
  }, []);

  const onResetPrompt = useCallback(() => {
    setPrompt("");
    setSubmittedPrompt("");
  }, []);

  const onSubmitPrompt = useCallback(
    (e) => {
      e.preventDefault();
      setSubmittedPrompt(prompt);
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

    running: <Loader size="lg" />,
    queued: <Loader size="lg" />,

    success: (
      <ActionIcon size="xl" radius="xl" variant="light" onClick={onResetPrompt}>
        <IconX size="1.5rem" />
      </ActionIcon>
    ),
  };

  return (
    <Container size="md" pt="xl">
      <Stack spacing="xl">
        <Center inline>
          <Image src="/logo.svg" width={300} alt="Icon Diffusion" />
        </Center>
        <form onSubmit={onSubmitPrompt}>
          <TextInput
            value={prompt}
            onChange={onPromptChange}
            size="xl"
            placeholder="Your prompt"
            radius="xl"
            rightSection={promptIndicator[api.status]}
            onSubmit={onSubmitPrompt}
          />
        </form>
        <Slider
          max={512}
          min={16}
          step={8}
          value={imageSize}
          onChange={setImageSize}
          marks={[
            { value: 16, label: "16px" },
            { value: 32, label: "32px" },
            { value: 64, label: "64px" },
            { value: 128, label: "128px" },
            { value: 256, label: "256px" },
            { value: 512, label: "512px" },
          ]}
        />
        {api.status === "success" ? (
          <Flex
            gap="sm"
            wrap="wrap"
            justify="center"
            sx={(theme) => ({
              paddingTop: theme.spacing.xl,
            })}
          >
            {api.paths.map((src, i) => (
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
