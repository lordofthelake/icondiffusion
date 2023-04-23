import { encode } from "./steps/encode";
import { preprocess } from "./steps/preprocess";
import { vectorize } from "./steps/vectorize";

export async function runImagePipeline(buf: Buffer): Promise<string> {
  const preprocessed = await preprocess(buf);
  const svg = await vectorize(preprocessed);
  const encoded = encode(svg);

  return encoded;
}
