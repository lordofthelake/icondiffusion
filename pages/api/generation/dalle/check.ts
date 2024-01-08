import { NextApiRequest, NextApiResponse } from "next";
import { augmentPrompt, runImagePipeline } from "$/pipeline";

// Define the shape of the response we expect from OpenAI's API
type GenerateResponse = {
  created: number;
  data: { url: string; }[]; // Array of generated images with their URLs
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { callID } = req.query;
  const augmentedPrompt = augmentPrompt(callID as string);

  if (typeof augmentedPrompt !== 'string' || augmentedPrompt.trim() === '') {
    res.status(400).json({ error: 'Prompt must be a non-empty string' });
    return;
  }

  try {
    const stringifiedBody = JSON.stringify({
      model: "dall-e-2",
      prompt: augmentedPrompt,
      n: 1,
      size: "256x256"
    });

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: stringifiedBody
    });

    const data: GenerateResponse = await response.json();

    const imageUrls = data.data.map(item => item.url); // Extract URL from each data object

    const paths = await Promise.all(
      imageUrls.map((img) => runImagePipeline(Buffer.from(img)))
    );
    res.status(200).json({ message: 'success', paths });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
