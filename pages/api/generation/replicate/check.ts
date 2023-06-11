import { runImagePipeline } from "$/pipeline";
import type { NextApiRequest, NextApiResponse } from "next";

type CheckResponse =
  | { message: "" | "running" | "error"; modelOutputs: null }
  | { message: "success"; modelOutputs: Buffer[] };

async function queryCheck(callID: string): Promise<CheckResponse> {
  const response = await fetch(
    `https://api.replicate.com/v1/predictions/${callID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    }
  );

  const json = await response.json();
  console.log("GET /api/generation/check", { callID, response: json });

  switch (json.status) {
    case "starting": {
      return { message: "", modelOutputs: null } as const;
    }

    case "processing": {
      return { message: "running", modelOutputs: null } as const;
    }

    case "succeeded": {
      const images = await Promise.all(
        (json.output as string[]).map((url) =>
          fetch(url)
            .then((res) => res.arrayBuffer())
            .then((arrayBuf) => Buffer.from(arrayBuf))
        )
      );

      return { message: "success", modelOutputs: images } as const;
    }

    case "failed": {
      return { message: "error", modelOutputs: null } as const;
    }

    default:
      throw new Error(`Unhandled status: ${json.status}`);
  }
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
  } else {
    res.status(200).json({ status: "queued" });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
