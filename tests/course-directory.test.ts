import test from "node:test";
import assert from "node:assert/strict";
import { certifications } from "../lib/certificates";
import verification from "../data/course-verification.json";
import originalIds from "./fixtures/courses-original-ids.json";

test("course directory preserves existing entries and associates every record with honest evidence", () => {
  const byId = new Map(certifications.map((course) => [course.id, course]));
  const evidence = new Map(verification.map((entry) => [entry.id, entry]));
  assert.equal(byId.size, certifications.length, "Course IDs must be unique");
  assert.equal(
    evidence.size,
    verification.length,
    "Evidence IDs must be unique",
  );
  assert.equal(evidence.size, byId.size);
  for (const id of originalIds) assert.ok(byId.has(id), `Preserve ${id}`);
  for (const course of certifications) {
    const checked = evidence.get(course.id);
    assert.ok(checked, `${course.id} has a public-source record`);
    assert.equal(new URL(course.url).protocol, "https:");
    assert.equal(new URL(course.evidenceUrl!).protocol, "https:");
    assert.equal(checked.title, course.title);
    assert.ok(course.description && course.cost && course.accessNotes);
    assert.match(course.verifiedOn!, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(typeof course.freeCredential, "boolean");
    if (course.verificationStatus === "course-verified") {
      assert.equal(checked.status, 200);
    }
    if (course.freeCredential) {
      assert.equal(course.verificationStatus, "course-verified");
      assert.ok(
        checked.freeCredentialEvidence,
        `${course.id}: free award needs explicit evidence`,
      );
      assert.notEqual(course.credentialKind, "Learning only");
    } else {
      assert.equal(checked.freeCredentialEvidence, null);
    }
  }
});

test("training achievements, professional exams and employer records stay distinct", () => {
  for (const course of certifications) {
    if (["Microsoft Learn", "GitHub Skills"].includes(course.organization)) {
      assert.equal(course.freeCredential, false);
      assert.equal(course.credentialKind, "Learning only");
      assert.match(course.cost, /separate|limits/);
    }
    if (course.organization === "AccessForward") {
      assert.equal(course.freeCredential, false);
      assert.match(course.credential, /Employer training record/);
    }
    if (course.organization === "Harvard CS50" && course.freeCredential) {
      assert.match(course.cost, /edX verified certificate costs extra/);
      assert.match(course.accessNotes!, /assessments/);
    }
    if (course.verificationStatus !== "course-verified") {
      assert.equal(course.freeCredential, false);
      if (course.credentialKind === "Award details unconfirmed") {
        assert.match(course.cost, /confirm/i);
      }
    }
  }
});

test("working course research does not promote broken lesson shells or unavailable product prerequisites", () => {
  assert.ok(
    !certifications.some(
      (course) => course.organization === "LearnFree (GCFGlobal)",
    ),
  );
  assert.ok(
    !certifications.some((course) => course.url.endsWith("/ship-with-quality")),
  );
  assert.ok(!certifications.some((course) => /semrush\.com/.test(course.url)));
  const advancedPython = certifications.find(
    (course) =>
      course.id === "helsinki-advanced-course-in-programming-python-mooc-2026",
  );
  assert.equal(advancedPython?.difficulty, "Mixed levels");
  assert.match(advancedPython!.description, /parts 8–14/);
  const finance = certifications.find(
    (course) => course.organization === "McGill University",
  );
  assert.match(finance!.description, /October 29/);
  assert.match(finance!.description, /will not transfer/);
});
