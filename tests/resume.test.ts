import test from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { validateResume, boundedForm } from "../lib/openai/files";
import { normalizeReview, reviewSchema } from "../lib/openai/schema";
import { authorized } from "../lib/security/requests";
import { base } from "./fixtures/review";

test("structured review rejects invalid data and drops invented numeric achievements", () => {
  assert.equal(reviewSchema.safeParse({ bad: "output" }).success, false);
  const parsed = normalizeReview(base);
  assert.equal(parsed.overallScore, 80);
  assert.equal(parsed.bulletRewrites.length, 0);
});
test("resume validation checks extension, MIME, file signature, encryption, size and DOCX contents", async () => {
  await assert.rejects(() =>
    validateResume(
      new File(["bad"], "resume.exe", { type: "application/pdf" }),
    ),
  );
  await assert.rejects(() =>
    validateResume(
      new File(["not a PDF"], "resume.pdf", { type: "application/pdf" }),
    ),
  );
  await assert.rejects(() =>
    validateResume(
      new File(["%PDF-1.4\n/Encrypt\n%%EOF"], "resume.pdf", {
        type: "application/pdf",
      }),
    ),
  );
  await assert.rejects(() =>
    validateResume(
      new File([new Uint8Array(4 * 1024 * 1024 + 1)], "resume.pdf", {
        type: "application/pdf",
      }),
    ),
  );
  const pdf = await validateResume(
    new File(["%PDF-1.4\nTEST FIXTURE\n%%EOF"], "resume.pdf", {
      type: "application/pdf",
    }),
  );
  assert.equal(pdf.format, "pdf");
  const archive = zipSync({
    "[Content_Types].xml": strToU8("<Types/>"),
    "word/document.xml": strToU8(
      '<w:document xmlns:w="test"><w:body><w:p><w:r><w:t>TEST FIXTURE student resume: helped with a school club and prepared materials for a class project. This is not a real student.</w:t></w:r></w:p></w:body></w:document>',
    ),
  });
  const docx = await validateResume(
    new File([archive], "resume.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
  );
  assert.match(docx.buffer.toString(), /school club/);
  assert.equal(docx.name, "student-resume.txt");
  await assert.rejects(() =>
    boundedForm(
      new Request("https://example.org", {
        method: "POST",
        body: "not a form",
      }),
    ),
  );
});
test("maintenance endpoints require a sufficiently long secret and exact bearer authorization", () => {
  assert.equal(
    authorized(new Request("https://example.org"), undefined),
    false,
  );
  assert.equal(
    authorized(
      new Request("https://example.org", {
        headers: { authorization: "Bearer short" },
      }),
      "short",
    ),
    false,
  );
  const secret = "a".repeat(40);
  assert.equal(
    authorized(
      new Request("https://example.org", {
        headers: { authorization: `Bearer ${secret}` },
      }),
      secret,
    ),
    true,
  );
});
test("the official SDK sends inline PDF and plain-text reviews without creating provider files", async () => {
  const { default: OpenAI } = await import("openai");
  const { reviewResume } = await import("../lib/openai/review");
  const requests: Record<string, unknown>[] = [];
  const client = new OpenAI({
    apiKey: "test-fixture-key-not-a-credential",
    maxRetries: 0,
    fetch: async (_url, init) => {
      requests.push(JSON.parse(String(init?.body)));
      return new Response(
        JSON.stringify({
          id: "resp-test",
          object: "response",
          status: "completed",
          output: [
            {
              id: "msg-test",
              type: "message",
              role: "assistant",
              status: "completed",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify(base),
                  annotations: [],
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  });
  const context = {
    grade: "11",
    kind: "job",
    title: "Test student assistant",
    description: "A fictional test description for a student role.",
  };
  const file = {
    buffer: Buffer.from("%PDF-1.4\nTEST FIXTURE\n%%EOF"),
    name: "student-resume.pdf",
    mime: "application/pdf",
    format: "pdf" as const,
  };
  const result = await reviewResume(file, context, { client });
  assert.equal(result.overallScore, 80);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].store, false);
  const serialized = JSON.stringify(requests[0]);
  assert.match(serialized, /data:application\/pdf;base64,/);
  assert.doesNotMatch(serialized, /file_id/);
  assert.match(serialized, /UNTRUSTED DATA/);
  await reviewResume(
    {
      ...file,
      buffer: Buffer.from(
        "TEST FIXTURE: Helped at school events. Organized supplies and assisted with a class project.",
      ),
      mime: "text/plain",
      format: "text",
    },
    context,
    { client },
  );
  const second = JSON.stringify(requests[1]);
  assert.match(second, /UNTRUSTED RESUME TEXT/);
  assert.doesNotMatch(second, /input_file/);
});
test("billing, credentials, incomplete responses, and malformed output produce safe support codes", async () => {
  const { reviewFailure, ReviewResponseError } =
    await import("../lib/openai/errors");
  const { reviewResume } = await import("../lib/openai/review");
  const { default: OpenAI } = await import("openai");
  const sensitive = "DO NOT REPEAT TEST PRIVATE DOCUMENT TEXT";
  for (const [status, code, expected] of [
    [429, "insufficient_quota", "AI_BILLING_REQUIRED"],
    [401, "invalid_api_key", "AI_AUTHENTICATION_FAILED"],
    [404, "model_not_found", "AI_MODEL_UNAVAILABLE"],
    [429, "rate_limit_exceeded", "AI_PROVIDER_BUSY"],
  ] as const) {
    const client = new OpenAI({
      apiKey: "test-fixture-key",
      maxRetries: 0,
      fetch: async () =>
        new Response(
          JSON.stringify({ error: { message: sensitive, type: "test", code } }),
          { status, headers: { "content-type": "application/json" } },
        ),
    });
    try {
      await reviewResume(
        {
          buffer: Buffer.from("TEST FIXTURE"),
          name: "student-resume.txt",
          mime: "text/plain",
          format: "text",
        },
        {
          grade: "11",
          kind: "job",
          title: "Test",
          description: "Test description",
        },
        { client },
      );
      assert.fail("Expected a provider error");
    } catch (error) {
      const failure = reviewFailure(error);
      assert.equal(failure.code, expected);
      assert.ok(!JSON.stringify(failure).includes(sensitive));
    }
  }
  assert.equal(
    reviewFailure(new ReviewResponseError("incomplete")).code,
    "AI_RESPONSE_INCOMPLETE",
  );
  assert.equal(
    reviewFailure(new SyntaxError(sensitive)).code,
    "AI_RESPONSE_INVALID",
  );
  assert.equal(reviewFailure(new Error(sensitive)).code, "AI_REVIEW_FAILED");
});

test("a Google key in the OpenAI setting disables review before a document can be sent to the wrong provider", async (t) => {
  const values = {
    AI_REVIEW_PROVIDER: "openai",
    OPENAI_API_KEY: "AIza-test-fixture-not-a-real-key",
    PRIVACY_CONTACT_EMAIL: "privacy@example.org",
    RATE_LIMIT_SECRET: "test-fixture-secret-at-least-thirty-two-characters",
  };
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, values);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const { reviewConfiguration } = await import("../lib/openai/config");
  const { openaiClient } = await import("../lib/openai/client");
  assert.deepEqual(reviewConfiguration(), {
    provider: "openai",
    providerName: "OpenAI",
    available: false,
    code: "AI_PROVIDER_KEY_MISMATCH",
  });
  assert.throws(() => openaiClient(), /credential mismatch/);
});
