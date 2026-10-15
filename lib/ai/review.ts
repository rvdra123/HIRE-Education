import "server-only";
import { reviewConfiguration } from "./config";
import {
  reviewWithGemini,
  type ResumeInput,
  type ReviewContext,
} from "./gemini";
import { reviewResume as reviewWithOpenAI } from "@/lib/openai/review";
export async function reviewResume(file: ResumeInput, context: ReviewContext) {
  const config = reviewConfiguration();
  if (!config.available)
    throw new Error(config.code || "Review is unavailable");
  return config.provider === "gemini"
    ? reviewWithGemini(file, context)
    : reviewWithOpenAI(file, context);
}
