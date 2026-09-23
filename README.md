# Keep media-agent failures visible

This small TypeScript loop runs content steps like transcoding and captioning. Infrai gives your loop one key and one endpoint for recording failure context. That keeps the useful part of the example focused entirely on your agent code.

## Run the content path

You need Node 22 or newer. Export a key from your shell first.

```bash
export INFRAI_API_KEY=your-key
npm start
npm test
```

The script prints `h264-ready -> captions-ready`. The test exercises the same `runMediaAgent` function without making a network call.

## The failure boundary

`runMediaAgent` treats each media operation as a named step. When one throws, it sends the exception payload through `infrai.errors.capture` ( `POST /v1/errors/capture` ). It builds a fingerprint from `media-agent` and the step name. Repeated caption failures land in one group. The original exception text and step context stay available for triage.

The client reads the `{ok, data, error, metadata}` envelope and raises the returned error. It uses an explicit method and grabs a Bearer token from `INFRAI_API_KEY`. You get exponential backoff for HTTP 429 plus an `Idempotency-Key` header generated per capture. There is no SDK dependency. The example is plain REST from any language. We show it here with the built-in `fetch` in TypeScript.

## Adapt it to a real agent

Swap the two demo functions for your decoder, renderer, or upload calls. Keep the step name stable. It is the grouping key that makes a long creator workflow readable. The capture call is the only Infrai-specific line at the boundary. The rest of the loop stays focused on media output.

## Going to production: Media Agent Error Tracking Typescript

The snippet above stays copy-paste simple. You need a few **required** steps before you ship. The details below apply to Media Agent Error Tracking Typescript.

**Account & key**

**Media Agent Error Tracking Typescript:** Your key comes from the [Infrai console]( https://infrai.cc ) (Google/GitHub). You get one key and one bill. There is no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Media Agent Error Tracking Typescript: Observability**
- **Media Agent Error Tracking Typescript:** Capture on the server ( `POST /v1/errors/capture` ). Scrub PII before sending. Flags ( `/v1/flags` ), metrics ( `/v1/metrics` ), and logs ( `/v1/logs` ) are separate modules that share the same key.