import "server-only";
import OpenAI from "openai";
import { serverFetch } from "@/lib/security/fetch";
export function openaiClient() {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("AI review is not configured");
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 0,
    fetch: ((url, init) =>
      serverFetch(
        typeof url === "string" ? url : url instanceof URL ? url : url.url,
        init,
      )) as typeof fetch,
  });
}
