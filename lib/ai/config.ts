import "server-only";
export type ReviewProvider = "openai" | "gemini";

// This site is directed at students in Grades 9–12. The Gemini Developer API
// terms have restricted services directed at or likely accessed by under-18s.
// Do not enable student use until the current terms or an applicable Google
// agreement have been verified. A guardian checkbox is not an exception.
export const geminiStudentAudienceConfirmed = false;

export function geminiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    (process.env.OPENAI_API_KEY?.trim().startsWith("AIza")
      ? process.env.OPENAI_API_KEY.trim()
      : "")
  );
}
export function selectedProvider(): ReviewProvider {
  const selected = process.env.AI_REVIEW_PROVIDER?.trim().toLowerCase();
  if (selected === "gemini" || selected === "openai") return selected;
  return geminiKey() ? "gemini" : "openai";
}
export function reviewConfiguration() {
  const provider = selectedProvider();
  const base = {
    provider,
    providerName: provider === "gemini" ? "Google Gemini" : "OpenAI",
  };
  if (provider === "gemini" && !geminiStudentAudienceConfirmed)
    return {
      ...base,
      available: false,
      code: "GEMINI_STUDENT_ELIGIBILITY_UNCONFIRMED",
    };
  const key =
    provider === "gemini" ? geminiKey() : process.env.OPENAI_API_KEY?.trim();
  if (!key) return { ...base, available: false, code: "AI_NOT_CONFIGURED" };
  if (provider === "openai" && key.startsWith("AIza"))
    return { ...base, available: false, code: "AI_PROVIDER_KEY_MISMATCH" };
  if (!process.env.PRIVACY_CONTACT_EMAIL?.trim())
    return {
      ...base,
      available: false,
      code: "REVIEW_PRIVACY_CONTACT_MISSING",
    };
  if ((process.env.RATE_LIMIT_SECRET?.length || 0) < 32)
    return { ...base, available: false, code: "REVIEW_USAGE_NOT_CONFIGURED" };
  return { ...base, available: true, code: null };
}
export function reviewAvailable() {
  return reviewConfiguration().available;
}
