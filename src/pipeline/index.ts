import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";

import { encode } from "./steps/encode";
import { preprocess } from "./steps/preprocess";
import { vectorize } from "./steps/vectorize";

const saveOutputs = !!process.env.SAVE_OUTPUTS;
const samplesDir = path.join(process.cwd(), "data/samples");

export async function runImagePipeline(buf: Buffer): Promise<string> {
  const preprocessed = await preprocess(buf);

  if (saveOutputs) {
    const uuid = randomUUID();
    const pipelineDir = path.join(samplesDir, uuid);

    await mkdir(pipelineDir, { recursive: true });
    await writeFile(`${pipelineDir}/raw.png`, buf);
    await writeFile(`${pipelineDir}/processed.png`, preprocessed);
  }

  const svg = await vectorize(preprocessed);
  const encoded = encode(svg);

  return encoded;
}

export function augmentPrompt(prompt: string): string {
  if (process.env.RAW_PROMPT) return prompt;
  else
    return `illustration of ${prompt}, realistic, low poly, 3d render, illustrator, beautiful, high quality, flat illustration, svg, eps, vector illustration, high definition, centered, asim style`;
}
