import { useRef } from "react";
import useSWR from "swr";

type GenerationStatus =
  | { status: "idle" }
  | { status: "queued" }
  | { status: "running" }
  | { status: "success"; paths: string[] }
  | { status: "error" };

const GENERATION_BACKEND = process.env.GENERATION_BACKEND ?? "hf";

export function useGenerationApi(prompt: string): GenerationStatus {
  const callID = useRef<string | null>(null);

  const startCall = useSWR(
    !prompt
      ? null
      : {
          url: `/api/generation/${GENERATION_BACKEND}/start`,
          method: "POST",
          args: { prompt },
        }
  );

  if (startCall.data?.callID) {
    if (startCall.data?.callID != callID.current) {
      console.group(`Generation for prompt '${prompt}'`);
      console.time(`Generation ${callID.current}`);
    }
    callID.current = startCall.data?.callID;
  }

  const checkCall = useSWR(
    () =>
      callID.current && {
        url: `/api/generation/${GENERATION_BACKEND}/check`,
        args: { callID: callID.current },
      },
    { refreshInterval: 5000, isPaused: () => callID.current == null }
  );

  let generationCompleted = false;
  try {
    if (checkCall?.data?.paths) {
      callID.current = null;
      generationCompleted = true;
      return { status: "success", paths: checkCall.data?.paths };
    }

    if (checkCall?.data?.status) {
      return { status: checkCall?.data?.status };
    }

    if (startCall.error || checkCall?.error) {
      generationCompleted = true;
      return { status: "error" };
    }
  } finally {
    if (generationCompleted) {
      if (callID.current) console.timeEnd(`Generation ${callID.current}`);
      console.groupEnd();
    }
  }

  return prompt ? { status: "queued" } : { status: "idle" };
}
