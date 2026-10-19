import { EnvHttpProxyAgent, fetch as proxyFetch } from "undici";
const dispatcher = new EnvHttpProxyAgent();
export async function serverFetch(
  input: string | URL,
  init: RequestInit = {},
): Promise<Response> {
  return proxyFetch(input.toString(), { ...init, dispatcher } as Parameters<
    typeof proxyFetch
  >[1]) as unknown as Response;
}
export async function boundedBytes(response: Response, maxBytes = 2_000_000) {
  if (!response.body) throw new Error("Empty response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new Error("Response too large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks);
}
export async function boundedText(response: Response, maxBytes = 2_000_000) {
  return (await boundedBytes(response, maxBytes)).toString("utf8");
}
