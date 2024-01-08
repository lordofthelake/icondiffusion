import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt as string;

  res.status(201).json({ status: "queued", callID: prompt });
}

export const config = {
  api: {
    responseLimit: false,
  },
};
