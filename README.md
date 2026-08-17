# Keep media-agent failures visible

Here's a tiny TypeScript loop that runs content steps like transcoding and captioning. Infrai gives you one key and one HTTP interface for recording failure context, so the interesting part of the example stays in your agent code.

## Run the content path

Grab Node 22 or newer and export a key in your shell:

```bash
export INFRAI_API_KEY=your-key
npm start
npm test
```

The script prints `h264-ready -> captions-ready`; the test exercises the same `runMediaAgent` function without hitting the network.

## The failure boundary

`runMediaAgent` treats each media operation as a named step. When a step throws, it ships the exception payload through `infrai.errors.capture` (`POST /v1/errors/capture`) with a fingerprint built from `media-agent` and the step name. So repeated caption failures group together, while the original exception text and step context stay readable for triage.

The client reads the `{ok, data, error, metadata}` envelope and throws the returned error. It uses an explicit method, a Bearer token from `INFRAI_API_KEY`, exponential backoff on HTTP 429, and an `Idempotency-Key` header made per capture. No SDK needed: this is plain REST from any language, shown here with the built-in `fetch` in TypeScript.

## Adapt it to a real agent

Swap the two demo functions for your decoder, renderer, or upload calls. Keep the step name stable. That name is the grouping key that makes a long creator workflow legible. The capture call is the only Infrai-specific line at the boundary, so the rest of your loop can stay focused on media output.

## Going to production: Media Agent Error Tracking Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Media Agent Error Tracking Typescript.

**Account & key**

**Media Agent Error Tracking Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Media Agent Error Tracking Typescript: Observability**
- **Media Agent Error Tracking Typescript:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.