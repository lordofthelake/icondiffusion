import { runImagePipeline } from "$/pipeline";
import type { NextApiRequest, NextApiResponse } from "next";

type CheckResponse =
  | { message: "" | "running" | "error"; modelOutputs: null }
  | { message: "success"; modelOutputs: Buffer[] };

const MODEL = "pskl/icondiffusion";

async function queryCheck(callID: string): Promise<CheckResponse> {
  const requestStart = new Date();
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${MODEL}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: `${callID}`,
        options: {
          use_cache: false,
        },
      }),
    }
  );
  const elapsed = +new Date() - +requestStart;

  const { status } = response;
  let text = null;
  if (status !== 200) text = await response.text();

  console.log(`POST /models/${MODEL}`, { callID, status, text, elapsed });

  switch (status) {
    case 200: {
      return {
        message: "success",
        modelOutputs: [
          Buffer.from(await (await response.blob()).arrayBuffer()),
        ],
      };
    }

    case 503:
      return {
        message: "running",
        modelOutputs: null,
      };

    default:
      return { message: "error", modelOutputs: null };
  }
}

const mergeResponses = (responses: CheckResponse[]): CheckResponse => {
  if (responses.every((res) => res.message === "success"))
    return {
      message: "success",
      modelOutputs: responses.flatMap((res) => res.modelOutputs),
    };

  if (responses.some((res) => res.message === "error"))
    return { message: "error", modelOutputs: null };

  return { message: "running", modelOutputs: null };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { callID } = req.query;
  const { message, modelOutputs } = mergeResponses(
    await Promise.all([
      queryCheck(callID as string),
      queryCheck(callID as string),
      queryCheck(callID as string),
    ])
  );

  if (modelOutputs) {
    const pipelineStart = new Date();
    const paths = await Promise.all(
      modelOutputs.map((img) => runImagePipeline(img))
    );
    console.log("Pipeline ran ", +new Date() - +pipelineStart);
    res.status(200).json({ status: "success", paths });
  } else if (message === "error") {
    res.status(500).json({ status: "error" });
  } else if (message === "running") {
    res.status(200).json({ status: "running" });
  } else {
    res.status(200).json({ status: "queued" });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
