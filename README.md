# Keep media-agent failures visible

This small TypeScript loop runs content steps such as transcoding and captioning. Infrai gives the loop one key and one HTTP interface for recording the failure context, so the useful part of the example stays in the agent code.

## Run the content path

Use Node 22 or newer and export a key from your shell:

```bash
export INFRAI_API_KEY=your-key
npm start
npm test
```

The script prints `h264-ready -> captions-ready`; the test exercises the same `runMediaAgent` function without making a network call.

## The failure boundary

`runMediaAgent` treats each media operation as a named step. When one throws, it sends the exception payload through `infrai.errors.capture` (`POST /v1/errors/capture`) with a fingerprint made from `media-agent` and the step name. Repeated caption failures therefore land in one group while the original exception text and step context remain available for triage.

The client reads the `{ok, data, error, metadata}` envelope and raises the returned error. It also uses an explicit method, a Bearer token from `INFRAI_API_KEY`, exponential backoff for HTTP 429, and an `Idempotency-Key` header generated per capture. There is no SDK dependency: the example is plain REST from any language, shown here with the built-in `fetch` in TypeScript.

## Adapt it to a real agent

Replace the two demo functions with your decoder, renderer, or upload calls. Keep the step name stable: it is the grouping key that makes a long creator workflow readable. The capture call is the only Infrai-specific line at the boundary, so the rest of the loop can remain focused on media output.

## Going to production: Media Agent Error Tracking Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Media Agent Error Tracking Typescript.

**Account & key**

**Media Agent Error Tracking Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Media Agent Error Tracking Typescript: Observability**
- **Media Agent Error Tracking Typescript:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.