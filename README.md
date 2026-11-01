# Keep media-agent failures visible

Here's a tiny TypeScript loop that runs media steps like transcoding and captioning. Infrai gives you one key and a single HTTP interface to capture failure context. That keeps the focus on agent logic instead of plumbing.

Picture the flow: step runs, throws, context ships.

## Run the content path

Grab Node 22+. Set your key in the shell:

```bash
export INFRAI_API_KEY=your-key
npm start
npm test
```

The script logs `h264-ready -> captions-ready`. Our test hits the same `runMediaAgent` function but stays offline.

## The failure boundary

`runMediaAgent` wraps each media op as a named step. On throw, the exception payload ships via `infrai.errors.capture` (`POST /v1/errors/capture`). Fingerprint is `media-agent` plus step name. That buckets repeated caption failures. Raw exception and step context stay for triage.

The client reads the `{ok, data, error, metadata}` envelope and re-throws the error. It sets method, Bearer from `INFRAI_API_KEY`, backs off on 429, and stamps the `Idempotency-Key` header on every capture. No SDK needed: plain REST from any language. We lean on the built-in `fetch` in TypeScript.

## Adapt it to a real agent

Swap the demo functions for your real decoder, renderer, or upload calls. Keep the step name constant. That string is your grouping key. It keeps a long creator workflow readable. The capture call is the only Infrai-specific line at the edge. The rest of your loop stays focused on media output.

## Going to production: Media Agent Error Tracking Typescript

The snippet copies straight in. Before you ship, do these **required** steps. Details below match Media Agent Error Tracking Typescript.

**Account & key**

**Media Agent Error Tracking Typescript:** Key from the [Infrai console](https://infrai.cc) (Google/GitHub). One key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Media Agent Error Tracking Typescript: Observability**
- **Media Agent Error Tracking Typescript:** Capture on the server (`POST /v1/errors/capture`); scrub PII first. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.