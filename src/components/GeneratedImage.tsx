import { FC, useCallback, useState } from "react";
import { Button, Flex, Image, Loader, Overlay, Stack } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { downloadURI } from "$/util/downloadURI";

type GeneratedImageProps = {
  size: number;
  prompt: string;
  src?: string;
};

const PADDING = 4;
const BORDER = 1;

export const GeneratedImage: FC<GeneratedImageProps> = ({
  size,
  src,
  prompt,
}) => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const isImageLoaded = src != null;
  const boxSize = Math.max(size, 256) + (PADDING + BORDER) * 2;

  const onImageHoverIn = useCallback(() => {
    setOverlayVisible(true);
  }, []);

  const onImageHoverOut = useCallback(() => {
    setOverlayVisible(false);
  }, []);

  const onDownloadImage = useCallback(() => {
    const sanitizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadURI(src, `${sanitizedPrompt}-${size}.svg`);
  }, [src, prompt, size]);

  return (
    <Flex
      sx={(theme) => ({
        width: boxSize,
        height: boxSize,
        position: "relative",
        borderColor: theme.colors.gray[2],
        borderWidth: BORDER,
        borderStyle: "solid",
        borderRadius: `calc(${theme.radius.md} + ${PADDING}px)`,
        padding: PADDING,
      })}
      justify="center"
      align="center"
      onMouseEnter={onImageHoverIn}
      onMouseLeave={onImageHoverOut}
    >
      <Image
        radius="md"
        height={size}
        width={size}
        src={src}
        withPlaceholder={!isImageLoaded}
        placeholder={<Loader size="lg" />}
        alt={prompt}
      />
      {isImageLoaded && isOverlayVisible ? (
        <Overlay blur={15} center opacity={0.1} radius="md">
          <Stack spacing={"sm"}>
            <Button
              leftIcon={<IconDownload size="1rem" />}
              onClick={onDownloadImage}
            >
              Download
            </Button>
          </Stack>
        </Overlay>
      ) : null}
    </Flex>
  );
};
