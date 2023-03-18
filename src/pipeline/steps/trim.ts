import sharp from "sharp";

export async function trim(buf: Buffer): Promise<Buffer> {
  return sharp(buf).trim().toBuffer();
}
