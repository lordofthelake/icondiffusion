import { runImagePipeline } from "$/pipeline";
import type { NextApiRequest, NextApiResponse } from "next";

type CheckResponse =
  | { message: "" | "running" | "error"; modelOutputs: null }
  | { message: "success"; modelOutputs: Buffer[] };

async function queryCheck(callID: string): Promise<CheckResponse> {
  const response = await fetch("https://api.banana.dev/check/v4/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey: process.env.BANANA_API_KEY,
      modelKey: process.env.BANANA_MODEL_KEY,
      longPoll: false,
      callID,
    }),
  });

  const json = await response.json();
  console.log("GET /api/generation/check", { callID, response: json });

  return {
    message: json.message,
    modelOutputs: json.modelOutputs?.[0]?.map((base64Img: string) =>
      Buffer.from(base64Img, "base64")
    ),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { callID } = req.query;
  const { message, modelOutputs } = await queryCheck(callID as string);

  if (modelOutputs) {
    const paths = await Promise.all(
      modelOutputs.map((img) => runImagePipeline(img))
    );
    res.status(200).json({ status: "success", paths });
  } else if (message === "error") {
    res.status(500).json({ status: "error" });
  } else if (message === "running") {
    res.status(200).json({ status: "running" });
  }

  res.status(200).json({ status: "queued" });
}

export const config = {
  api: {
    responseLimit: false,
  },
};
