export function reviewAvailable() {
  return Boolean(
    process.env.OPENAI_API_KEY &&
    process.env.PRIVACY_CONTACT_EMAIL &&
    (process.env.RATE_LIMIT_SECRET?.length || 0) >= 32,
  );
}
