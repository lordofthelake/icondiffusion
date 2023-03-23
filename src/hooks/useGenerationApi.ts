import { useRef } from "react";
import useSWR from "swr";

type GenerationStatus =
  | { status: "idle" }
  | { status: "queued" }
  | { status: "running" }
  | { status: "success"; paths: string[] }
  | { status: "error" };

export function useGenerationApi(prompt: string): GenerationStatus {
  const callID = useRef<string | null>(null);

  const startCall = useSWR(
    !prompt
      ? null
      : { url: "/api/generation/start", method: "POST", args: { prompt } }
  );

  if (startCall.data?.callID) {
    callID.current = startCall.data?.callID;
  }

  const checkCall = useSWR(
    () =>
      callID.current && {
        url: "/api/generation/check",
        args: { callID: callID.current },
      },
    { refreshInterval: 5000, isPaused: () => callID.current == null }
  );

  if (checkCall?.data?.paths) {
    callID.current = null;
    return { status: "success", paths: checkCall.data?.paths };
  }

  if (checkCall?.data?.status) {
    return { status: checkCall?.data?.status };
  }

  if (startCall.error || checkCall?.error) return { status: "error" };

  return prompt ? { status: "queued" } : { status: "idle" };
}
