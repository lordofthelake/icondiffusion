import type { NextApiRequest, NextApiResponse } from "next";

type StartResponse =
  | { message: "queued" | "running"; callID: string }
  | { message: "error" };

async function queryStart({ prompt, samples }): Promise<StartResponse> {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Pinned to a specific version of Stable Diffusion
      // See https://replicate.com/cloneofsimo/lora/versions/fce477182f407ffd66b94b08e761424cabd13b82b518754b83080bc75ad32466
      version:
        "fce477182f407ffd66b94b08e761424cabd13b82b518754b83080bc75ad32466",

      // This is the text prompt that will be submitted by a form on the frontend
      input: {
        prompt: `icon of ${prompt}, <1>`,
        num_outputs: samples,
        lora_urls:
          "https://icondiffusion.vercel.app/model/icondiffusion-20230611.01.safetensors",
      },
    }),
  });

  const responseJson = await response.json();

  if (response.status !== 201 || responseJson.status === "failed") {
    console.error(responseJson);
    return { message: "error" };
  }

  const { id: callID, status } = responseJson;

  switch (status) {
    case "starting": {
      return { callID, message: "queued" } as const;
    }

    case "processing": {
      return { callID, message: "running" } as const;
    }

    default:
      throw new Error(`Invalid status: '${status}'`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt as string;

  let result = { message: "error" } as StartResponse;
  try {
    result = await queryStart({ prompt, samples: 3 });
  } catch (error: unknown) {
    console.error(error);
  }

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
