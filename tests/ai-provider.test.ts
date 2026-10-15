import test from "node:test";
import assert from "node:assert/strict";
import { base } from "./fixtures/review";
import {
  reviewWithGemini,
  discoverGeminiModel,
  GeminiApiError,
  googleResponseSchema,
} from "../lib/ai/gemini";
import { reviewConfiguration, geminiKey } from "../lib/ai/config";
import { reviewResume } from "../lib/ai/review";
import { reviewFailure } from "../lib/openai/errors";

const file = {
  buffer: Buffer.from(
    "TEST FIXTURE student resume. Helped at school events. Organized a school club activity and prepared supplies.",
  ),
  name: "student-resume.txt",
  mime: "text/plain",
  format: "text" as const,
};
const context = {
  grade: "11",
  kind: "job",
  title: "Fictional student assistant",
  description:
    "TEST FIXTURE student role requiring teamwork and communication.",
};

test("Gemini sends inline content to Google's endpoint and produces validated dashboard feedback", async () => {
  const requests: { url: string; body: Record<string, unknown> }[] = [];
  const fixture = {
    ...base,
    bulletRewrites: [
      {
        original: "Helped at school events.",
        suggested: "Supported activities at school events.",
        why: "Clear action without invented achievements.",
      },
    ],
  };
  const fetcher = async (input: string | URL, init: RequestInit = {}) => {
    const url = String(input);
    assert.equal(new URL(url).hostname, "generativelanguage.googleapis.com");
    assert.equal(
      new Headers(init.headers).get("x-goog-api-key"),
      "test-fixture-key",
    );
    assert.ok(!url.includes("test-fixture-key"));
    requests.push({ url, body: JSON.parse(String(init.body)) });
    return new Response(
      JSON.stringify({
        candidates: [
          {
            finishReason: "STOP",
            content: { parts: [{ text: JSON.stringify(fixture) }] },
          },
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  };
  const result = await reviewWithGemini(file, context, {
    fetcher,
    key: "test-fixture-key",
    model: "gemini-2.5-flash",
  });
  assert.equal(result.overallScore, 80);
  assert.equal(result.bulletRewrites.length, 1);
  assert.match(JSON.stringify(requests[0].body), /UNTRUSTED RESUME TEXT/);
  assert.doesNotMatch(JSON.stringify(requests[0]), /openai\.com|file_id/);
  await reviewWithGemini(
    {
      ...file,
      format: "pdf",
      mime: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\nTEST FIXTURE\n%%EOF"),
    },
    context,
    { fetcher, key: "test-fixture-key", model: "gemini-2.5-flash" },
  );
  assert.match(JSON.stringify(requests[1].body), /inlineData/);
  assert.match(JSON.stringify(requests[1].body), /application\/pdf/);
  assert.equal(googleResponseSchema().type, "OBJECT");
  assert.doesNotMatch(
    JSON.stringify(googleResponseSchema()),
    /additionalProperties|\$schema/,
  );
});

test("Gemini discovers a supported stable Flash model and avoids automatic Pro or preview selection", async (t) => {
  const previous = process.env.GEMINI_MODEL;
  delete process.env.GEMINI_MODEL;
  t.after(() => {
    if (previous === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = previous;
  });
  const fetcher = async () =>
    new Response(
      JSON.stringify({
        models: [
          {
            name: "models/gemini-3-pro",
            supportedGenerationMethods: ["generateContent"],
          },
          {
            name: "models/gemini-3-flash-preview",
            supportedGenerationMethods: ["generateContent"],
          },
          {
            name: "models/gemini-2.5-flash",
            supportedGenerationMethods: ["generateContent"],
          },
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  assert.equal(
    await discoverGeminiModel("test-fixture-key", fetcher),
    "gemini-2.5-flash",
  );
});

test("Google quota errors are safe and incomplete replies do not become scores", async () => {
  const secret = "TEST PRIVATE PROVIDER ERROR BODY";
  const failed = async () =>
    new Response(
      JSON.stringify({
        error: { status: "RESOURCE_EXHAUSTED", message: secret },
      }),
      { status: 429, headers: { "content-type": "application/json" } },
    );
  try {
    await reviewWithGemini(file, context, {
      key: "test-key",
      model: "gemini-2.5-flash",
      fetcher: failed,
    });
    assert.fail("Expected quota error");
  } catch (error) {
    assert.ok(error instanceof GeminiApiError);
    const safe = reviewFailure(error);
    assert.equal(safe.code, "GEMINI_QUOTA_EXCEEDED");
    assert.ok(!JSON.stringify(safe).includes(secret));
  }
  await assert.rejects(
    () =>
      reviewWithGemini(file, context, {
        key: "test-key",
        model: "gemini-2.5-flash",
        fetcher: async () =>
          new Response(
            JSON.stringify({
              candidates: [
                {
                  finishReason: "MAX_TOKENS",
                  content: { parts: [{ text: '{"overallScore":80' }] },
                },
              ],
            }),
            { headers: { "content-type": "application/json" } },
          ),
      }),
    /incomplete/,
  );
});

test("a Google key in the old setting selects Gemini but cannot bypass student eligibility controls", async (t) => {
  const names = [
    "AI_REVIEW_PROVIDER",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "OPENAI_API_KEY",
  ];
  const previous = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  for (const name of names) delete process.env[name];
  process.env.OPENAI_API_KEY = "AIza-test-fixture-not-a-real-key";
  t.after(() => {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  assert.equal(geminiKey(), "AIza-test-fixture-not-a-real-key");
  const configuration = reviewConfiguration();
  assert.equal(configuration.provider, "gemini");
  assert.equal(configuration.available, false);
  assert.equal(configuration.code, "GEMINI_STUDENT_ELIGIBILITY_UNCONFIRMED");
  await assert.rejects(
    () => reviewResume(file, context),
    /GEMINI_STUDENT_ELIGIBILITY_UNCONFIRMED/,
  );
});
