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

/**
 * This function takes in a string prompt as an argument and returns an augmented version of the prompt.
 *
 * If the environment variable `RAW_PROMPT` is defined, the function returns the original prompt as is.
 * If `RAW_PROMPT` is not defined, the function returns a new string which includes the original prompt augmented with various keywords to improve the output quality.
 *
 * @param {string} prompt - The original prompt string
 * @returns {string} - The augmented prompt.
 */
export function augmentPrompt(prompt: string): string {
  if (process.env.RAW_PROMPT) return prompt;
  else
    return `icon of ${prompt}, white background, centered`;
}
