import test from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { validateResume, boundedForm } from "../lib/openai/files";
import { normalizeReview, reviewSchema } from "../lib/openai/schema";
import { authorized } from "../lib/security/requests";
const base = {
  overallScore: 100,
  summary: "TEST FIXTURE feedback only",
  scores: {
    formatting: 8,
    content: 8,
    experience: 8,
    skills: 8,
    ats: 8,
    professionalism: 8,
    jobRelevance: 8,
  },
  strongestSections: [],
  strengths: ["Clear school experience"],
  weaknesses: [],
  improvements: [],
  missingSections: [],
  grammarIssues: [],
  bulletRewrites: [
    {
      original: "Helped at school events.",
      suggested: "Helped 100 people at school events.",
      why: "Invented quantity must be rejected.",
    },
  ],
  atsFeedback: {
    summary: "Text can be read.",
    concerns: [],
    limitations: "Not a real ATS simulation.",
  },
  jobMatch: {
    score: 80,
    summary: "Test only.",
    relevantStrengths: [],
    emphasizedSkills: [],
    highlightExperience: [],
    potentialGaps: [],
    topChanges: [],
  },
  topActions: ["Proofread.", "Tailor the skills.", "Check the posting."],
};
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
      new File([new Uint8Array(6 * 1024 * 1024 + 1)], "resume.pdf", {
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
test("provider failures still delete temporary files, and successful reviews use store:false", async () => {
  const { reviewResume } = await import("../lib/openai/review");
  const calls: string[] = [];
  let mode = "failure";
  const fake = {
    files: {
      create: async (params: { expires_after: { seconds: number } }) => {
        assert.equal(params.expires_after.seconds, 3600);
        calls.push("upload");
        return { id: "file-test-fixture" };
      },
    },
    responses: {
      create: async (params: { store: boolean; instructions: string }) => {
        assert.equal(params.store, false);
        assert.match(params.instructions, /UNTRUSTED DATA/);
        if (mode === "failure") throw new Error("Test provider failure");
        return { output_text: JSON.stringify(base) };
      },
    },
  };
  const provider = {
    client: fake as unknown as ReturnType<
      typeof import("../lib/openai/client").openaiClient
    >,
    queue: async () => {
      calls.push("queue");
    },
    remove: async () => {
      calls.push("delete");
      return true;
    },
  };
  const file = {
    buffer: Buffer.from("%PDF-1.4\n%%EOF"),
    name: "student-resume.pdf",
    mime: "application/pdf",
    format: "pdf" as const,
  };
  const context = {
    grade: "11",
    kind: "job",
    title: "Test student assistant",
    description: "A fictional test description for a student role.",
  };
  await assert.rejects(() => reviewResume(file, context, provider));
  assert.deepEqual(calls, ["upload", "queue", "delete"]);
  mode = "success";
  const review = await reviewResume(file, context, provider);
  assert.equal(review.overallScore, 80);
  assert.equal(calls.at(-1), "delete");
});
