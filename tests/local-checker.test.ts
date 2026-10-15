import test from "node:test";
import assert from "node:assert/strict";
import { checkResume } from "../lib/resume/checker";
import { reviewSchema } from "../lib/openai/schema";
import { studentResume, studentPosting } from "./fixtures/local-resume.mjs";

test("school experience produces transparent, internally consistent checklist results", () => {
  const review = checkResume({
    resume: studentResume,
    description: studentPosting,
  });
  assert.equal(review.method, "checklist-v1");
  assert.ok(reviewSchema.safeParse(review).success);
  assert.equal(review.bulletCount, 4);
  assert.equal(review.scores.formatting, 10);
  assert.equal(review.missingSections.length, 0);
  assert.ok(
    review.keywords.some(
      (item) => item.label === "Customer service" && item.matched,
    ),
  );
  assert.ok(
    review.keywords.some(
      (item) => item.label === "Cash handling" && !item.matched,
    ),
  );
  for (const [category, score] of Object.entries(review.scores)) {
    const checks = review.checks.filter((item) => item.category === category);
    assert.equal(
      score,
      Math.round(
        (checks.filter((item) => item.passed).length / checks.length) * 10,
      ),
    );
  }
  assert.equal(review.topActions.length, 3);
  assert.equal(new Set(review.topActions).size, 3);
  assert.match(review.summary, /not your ability or hiring chances/);
});

test("keyword matching accepts supported phrases and does not reward repeated keywords", () => {
  const base = checkResume({
    resume: studentResume,
    description: studentPosting,
  });
  const repeated = checkResume({
    resume: `${studentResume}\n${"communication teamwork ".repeat(50)}`,
    description: studentPosting,
  });
  assert.equal(repeated.jobMatch.score, base.jobMatch.score);
  const more = checkResume({
    resume: `${studentResume}\nCash handling, stocking, cleaning`,
    description: studentPosting,
  });
  assert.ok(more.jobMatch.score > base.jobMatch.score);
  const unrelated = checkResume({
    resume: studentResume.replaceAll("Communication", "Telecommunicationary"),
    description:
      "Strong communication skills are required. Help customers and follow cleaning procedures while working with a team.",
  });
  assert.equal(
    unrelated.keywords.find((item) => item.label === "Communication")?.matched,
    false,
  );
});

test("contact details and identities do not earn points, and no paid job is required", () => {
  const base = checkResume({
    resume: studentResume,
    description: studentPosting,
  });
  const privateDetails = checkResume({
    resume:
      studentResume.replace("Avery Example", "Different Person") +
      "\n416-555-0100\ncommunication@example.com\nhttps://example.com/stocking",
    description: studentPosting,
  });
  assert.deepEqual(privateDetails.scores, base.scores);
  assert.deepEqual(privateDetails.keywords, base.keywords);
  assert.equal(base.scores.experience, 10);
});

test("wording edits preserve facts and numbers instead of borrowing from the posting", () => {
  const review = checkResume({
    resume: studentResume,
    description:
      studentPosting + " Handle $500 and serve 100 customers per shift.",
  });
  assert.ok(review.bulletRewrites.length > 0);
  for (const edit of review.bulletRewrites) {
    assert.ok(studentResume.includes(edit.original));
    assert.ok(!edit.suggested.includes("500"));
    assert.ok(!edit.suggested.includes("100"));
    const originalNumbers: string[] = edit.original.match(/\d+/g) || [];
    assert.ok(
      (edit.suggested.match(/\d+/g) || []).every((number) =>
        originalNumbers.includes(number),
      ),
    );
  }
});

test("missing structure and weak bullets yield useful, nonjudgmental next steps", () => {
  const text = `Your name\n${"I am hard-working and I have helped with activities at my school. ".repeat(7)}`;
  const review = checkResume({ resume: text, description: studentPosting });
  assert.equal(review.scores.formatting, 2);
  assert.equal(review.missingSections.length, 3);
  assert.ok(
    review.grammarIssues.some((issue) => issue.includes("placeholder")),
  );
  assert.match(review.topActions.join(" "), /Education|Projects/);
  assert.ok(review.overallScore < 60);
});

test("short, oversized, and uninformative submissions cannot produce a score", () => {
  assert.throws(
    () => checkResume({ resume: "Very short", description: studentPosting }),
    /40 words/,
  );
  assert.throws(
    () =>
      checkResume({
        resume: "school ".repeat(8000),
        description: studentPosting,
      }),
    /50,000/,
  );
  assert.throws(
    () =>
      checkResume({ resume: studentResume, description: "A short posting" }),
    /12 words/,
  );
  assert.throws(
    () =>
      checkResume({ resume: studentResume, description: "a".repeat(16001) }),
    /16,000/,
  );
});

test("the former server endpoint cannot invoke an external review", async () => {
  const route = await import("../app/api/resume-review/route");
  const status = await route.GET();
  assert.deepEqual(await status.json(), {
    available: true,
    mode: "browser-checklist",
    acceptsUploads: false,
  });
  const response = await route.POST();
  assert.equal(response.status, 410);
  assert.equal((await response.json()).code, "USE_BROWSER_CHECKER");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
