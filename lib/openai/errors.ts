import "server-only";
export class ReviewResponseError extends Error {
  constructor(public readonly reason: "incomplete" | "refused" | "invalid") {
    super(`Review response ${reason}`);
  }
}
export function reviewFailure(error: unknown) {
  const value = error && typeof error === "object" ? error : {};
  const status = "status" in value ? Number(value.status) : undefined;
  const providerCode = "code" in value ? String(value.code) : "";
  const name = error instanceof Error ? error.name : "";
  let code = "AI_REVIEW_FAILED";
  let message =
    "The reviewer could not complete this request. Please try again later.";
  if (providerCode.startsWith("gemini_")) {
    const codes: Record<string, [string, string]> = {
      gemini_invalid_key: [
        "GEMINI_AUTHENTICATION_FAILED",
        "The website’s Google AI key needs to be updated by the site owner.",
      ],
      gemini_access_denied: [
        "GEMINI_ACCESS_DENIED",
        "Google AI denied access. The site owner needs to check the API key, enabled API, and project permissions.",
      ],
      gemini_quota_exceeded: [
        "GEMINI_QUOTA_EXCEEDED",
        "The Google AI reviewer’s current quota has been reached. Try after it resets; the site owner can check the project’s model limits.",
      ],
      gemini_model_unavailable: [
        "GEMINI_MODEL_UNAVAILABLE",
        "No supported Google Flash model is available for this project. The site owner needs to check model availability.",
      ],
      gemini_request_rejected: [
        "GEMINI_REQUEST_REJECTED",
        "Google AI could not read this request. Try pasting resume text; the site owner can check the model configuration.",
      ],
    };
    const selected = codes[providerCode] || [
      "GEMINI_UNAVAILABLE",
      "Google AI is temporarily unavailable. Please try again later.",
    ];
    return {
      code: selected[0],
      message: selected[1],
      providerStatus: Number.isFinite(status) ? status : undefined,
    };
  }
  if (
    providerCode === "insufficient_quota" ||
    providerCode === "billing_hard_limit_reached"
  ) {
    code = "AI_BILLING_REQUIRED";
    message =
      "The reviewer is unavailable because the website’s AI account has no available API credit. The site owner needs to check API billing.";
  } else if (status === 401 || providerCode === "invalid_api_key") {
    code = "AI_AUTHENTICATION_FAILED";
    message =
      "The website’s AI connection needs to be updated by the site owner. You can use the resume guide in the meantime.";
  } else if (
    status === 403 ||
    status === 404 ||
    providerCode === "model_not_found"
  ) {
    code = "AI_MODEL_UNAVAILABLE";
    message =
      "The website’s AI account cannot access the selected model. The site owner needs to check the model and project permissions.";
  } else if (status === 429) {
    code = "AI_PROVIDER_BUSY";
    message =
      "The AI service is handling too many requests. Wait a minute and try again.";
  } else if (/Timeout|Abort/.test(name)) {
    code = "AI_TIMEOUT";
    message =
      "The AI service took too long. Try again with a short, readable resume.";
  } else if (error instanceof ReviewResponseError) {
    code = `AI_RESPONSE_${error.reason.toUpperCase()}`;
    message =
      error.reason === "refused"
        ? "The AI service could not review this document. Upload a resume without sensitive personal details, or paste its text instead."
        : "The AI service returned an incomplete review. Please try again with a shorter resume or paste its text instead.";
  } else if (status === 400 || status === 422) {
    code = "AI_REQUEST_REJECTED";
    message =
      "The AI service could not read this request. Try pasting your resume text. If that also fails, the site owner needs to check the AI configuration.";
  } else if (name === "ZodError" || name === "SyntaxError") {
    code = "AI_RESPONSE_INVALID";
    message =
      "The AI response could not be read. Please try again; no score was generated.";
  } else if (/Connection/.test(name)) {
    code = "AI_CONNECTION_FAILED";
    message =
      "The website could not connect to the AI service. Please try again later.";
  } else if ("code" in value && /^(SQLITE|LIBSQL|HRANA)/.test(providerCode)) {
    code = "REVIEW_STORAGE_UNAVAILABLE";
    message =
      "The reviewer’s usage service is unavailable. Please try again later.";
  }
  // Do not expose exception messages or provider bodies, which may contain
  // personal information, document contents, or credentials.
  return {
    code,
    message,
    providerStatus: Number.isFinite(status) ? status : undefined,
  };
}
