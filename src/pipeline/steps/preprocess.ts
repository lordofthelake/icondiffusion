import sharp from "sharp";

export async function preprocess(buf: Buffer): Promise<Buffer> {
  const img = sharp(buf);

  const trimmed = img.trim();
  const rightSized = trimmed.resize({
    width: 512,
    height: 512,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  return rightSized.toBuffer();
}
