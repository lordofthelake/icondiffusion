import type { NextApiRequest, NextApiResponse } from "next";

type StartResponse =
  | { message: "" | "running"; callID: string }
  | { message: "error" };

async function queryStart(modelInputs): Promise<StartResponse> {
  const response = await fetch("https://api.banana.dev/start/v4/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey: process.env.BANANA_API_KEY,
      modelKey: process.env.BANANA_MODEL_KEY,
      modelInputs,
      startOnly: true,
    }),
  });
  const result = await response.json();
  console.log("POST /api/generation/start", { ...modelInputs, result });

  const { callID, message } = result;
  return { callID, message };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt as string;
  const result = await queryStart({ prompt });

  if (result.message === "error") {
    res.status(500).json({ status: "error" });
  } else {
    res
      .status(201)
      .json({ status: result.message || "queued", callID: result.callID });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
