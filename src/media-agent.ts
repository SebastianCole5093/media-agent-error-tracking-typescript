import { randomUUID } from "node:crypto";
import { infrai } from "./infrai.ts";

type MediaStep = { name: string; run: () => Promise<string> };

export async function runMediaAgent(steps: MediaStep[]): Promise<string[]> {
  const outputs: string[] = [];
  for (const step of steps) {
    try {
      outputs.push(await step.run());
    } catch (error) {
      const exception = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ""}` : String(error);
      await infrai.errors.capture({
        message: `media agent step failed: ${step.name}`,
        level: "error",
        fingerprint: ["media-agent", step.name],
        exception,
        context: { step: step.name, media: "video" },
      }, randomUUID());
      throw error;
    }
  }
  return outputs;
}

if (process.argv[1]?.endsWith("media-agent.ts")) {
  runMediaAgent([
    { name: "transcode", run: async () => "h264-ready" },
    { name: "caption", run: async () => "captions-ready" },
  ]).then((outputs) => console.log(outputs.join(" -> "))).catch(() => process.exitCode = 1);
}
