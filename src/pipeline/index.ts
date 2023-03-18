import { encode } from "./steps/encode";
import { rightSize } from "./steps/rightSize";
import { trim } from "./steps/trim";
import { vectorize } from "./steps/vectorize";

export async function runImagePipeline(buf: Buffer): Promise<string> {
  const trimmed = await trim(buf);
  const rightSized = await rightSize(trimmed);
  const svg = await vectorize(rightSized);
  const encoded = encode(svg);

  return encoded;
}
