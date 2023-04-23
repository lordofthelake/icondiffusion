import sharp from "sharp";

const BLACK_PIXEL = Buffer.from([0, 0, 0, 1]);

export async function preprocess(buf: Buffer): Promise<Buffer> {
  const img = sharp(buf).toFormat("png").toColorspace("b-w");
  const output = await img.toBuffer();

  const stats = await img.stats();
  console.log({ stats });

  if (output.subarray(0, 4).equals(BLACK_PIXEL)) {
    return img.negate({ alpha: false }).toBuffer();
  } else {
    return output;
  }
}
