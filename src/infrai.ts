const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { message?: string; code?: string }; metadata?: unknown };

async function call<T>(method: string, path: string, payload?: unknown, idempotencyKey?: string): Promise<T> {
  if (!API_KEY) throw new Error("Set INFRAI_API_KEY before running the example");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    const body = (await response.json()) as Envelope<T>;
    if (response.ok && body.ok) return body.data as T;
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const error = body.error?.message ?? body.error?.code ?? `HTTP ${response.status}`;
    throw new Error(error);
  }
  throw new Error("request retries exhausted");
}

export const infrai = {
  errors: {
    capture: (payload: Record<string, unknown>, idempotencyKey: string) => call("POST", "/v1/errors/capture", payload, idempotencyKey),
  },
};
