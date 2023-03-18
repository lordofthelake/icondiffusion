import { runImagePipeline } from "$/pipeline";
import { readFile } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";

function getPlaceHolderImg(prompt: string) {
  return `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22512%22%20height%3D%22512%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%20preserveAspectRatio%3D%22none%22%3E%0A%20%20%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0A%20%20%20%20%20%20%20%20%20%20%23holder%20text%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20fill%3A%20%23000000%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-family%3A%20sans-serif%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-size%3A%2040px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-weight%3A%20400%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%3C%2Fstyle%3E%0A%20%20%20%20%20%20%3C%2Fdefs%3E%0A%20%20%20%20%20%20%3Cg%20id%3D%22holder%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%2396d808%22%3E%3C%2Frect%3E%0A%20%20%20%20%20%20%20%20%3Cg%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ctext%20text-anchor%3D%22middle%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20dy%3D%22.3em%22%3E${prompt}%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%3C%2Fsvg%3E`;
}

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/lordofthelake/icondiffusion-small",
    {
      headers: {
        Authorization: "Bearer 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",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.blob();
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt as string;

  if (prompt === "bowl") {
    const images = await Promise.all(
      [1, 2, 3].map(async (num) => {
        const imageData = await readFile(
          path.join(process.cwd(), "data", `bowl-${num}.png`)
        );

        return runImagePipeline(imageData);
      })
    );

    res.status(200).json({ images });
  } else {
    const blob = await query({ inputs: `icondiffusion, ${prompt}` });
    const arrayBuffer = await blob.arrayBuffer();
    const imageData = Buffer.from(arrayBuffer);
    const encoded = await runImagePipeline(imageData);
    res.status(200).json({ images: [encoded, encoded, encoded] });
    // const placeholder = getPlaceHolderImg(prompt);
    // setTimeout(() => {
    //   res.status(200).json({ images: [placeholder, placeholder, placeholder] });
    // }, 500);
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
