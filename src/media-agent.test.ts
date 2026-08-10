import assert from "node:assert/strict";
import { runMediaAgent } from "./media-agent.ts";

const result = await runMediaAgent([{ name: "preview", run: async () => "poster-ready" }]);
assert.deepEqual(result, ["poster-ready"]);
console.log("media agent test passed");
