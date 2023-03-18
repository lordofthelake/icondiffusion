import sharp from "sharp";

export function rightSize(buf: Buffer): Promise<Buffer> {
  return sharp(buf)
    .resize({
      width: 512,
      height: 512,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
}
