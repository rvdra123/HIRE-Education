import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allInterviewQuestions,
  filterInterviewQuestions,
  interviewQuestionCount,
  interviewQuestions,
  interviewRoles,
  interviewTopics,
} from "../lib/interview-questions";

const normalized = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

test("interview library contains distinct student questions with usable guidance across all roles", () => {
  assert.equal(interviewQuestionCount, 216);
  assert.equal(interviewRoles.length, 9);
  assert.equal(new Set(allInterviewQuestions.map((item) => item.id)).size, 216);
  assert.equal(
    new Set(allInterviewQuestions.map((item) => normalized(item.question)))
      .size,
    216,
  );
  assert.equal(
    new Set(allInterviewQuestions.map((item) => normalized(item.approach)))
      .size,
    216,
  );
  assert.equal(
    new Set(allInterviewQuestions.map((item) => normalized(item.example))).size,
    216,
  );
  for (const role of interviewRoles) {
    assert.equal(interviewQuestions[role].length, 24, role);
    for (const item of interviewQuestions[role]) {
      assert.equal(item.role, role);
      assert.ok(interviewTopics.includes(item.topic));
      assert.ok(item.question.length >= 20);
      assert.ok(item.approach.length >= 60);
      assert.ok(item.example.length >= 60);
      assert.match(item.id, /^[a-z0-9-]+$/);
    }
  }
  assert.deepEqual(
    new Set(allInterviewQuestions.map((item) => item.topic)),
    new Set(interviewTopics),
  );
});

test("role, topic and multiword search combine while question identities remain stable", () => {
  const retail = filterInterviewQuestions({ role: "Retail" });
  assert.equal(retail.length, 24);
  assert.ok(retail.every((item) => item.role === "Retail"));
  const safety = filterInterviewQuestions({
    role: "Retail",
    topic: "Safety and boundaries",
  });
  assert.ok(safety.length > 0);
  assert.ok(
    safety.every(
      (item) =>
        item.role === "Retail" && item.topic === "Safety and boundaries",
    ),
  );
  const keys = filterInterviewQuestions({
    role: "Technology internship",
    search: "  API   KEY ",
  });
  assert.equal(keys.length, 1);
  assert.match(keys[0].question, /API key/);
  assert.equal(
    keys[0],
    allInterviewQuestions.find((item) => item.id === keys[0].id),
  );
  assert.equal(
    filterInterviewQuestions({ search: "no-such-question-12345" }).length,
    0,
  );
  assert.equal(
    filterInterviewQuestions({ search: "   " }).length,
    interviewQuestionCount,
  );
  assert.equal(
    filterInterviewQuestions({
      role: "Tutoring",
      topic: "Customer service",
      search: "parent",
    }).length,
    1,
  );
});

test("student safety scenarios retain qualified help and role boundaries", () => {
  const find = (fragment: string) => {
    const item = allInterviewQuestions.find((question) =>
      question.question.includes(fragment),
    );
    assert.ok(item, fragment);
    return item;
  };
  assert.match(
    find("meal is safe for their allergy").approach,
    /Never guess|trained staff/,
  );
  assert.match(find("participant was injured").approach, /qualified staff/);
  assert.match(
    find("suspected shoplifting").approach,
    /Do not confront, chase/,
  );
  assert.match(
    find("asks you to complete a graded assignment").approach,
    /without doing assessed work/,
  );
  assert.match(
    find("password or API key").approach,
    /Do not use, copy, share, or test/,
  );
  assert.match(
    find("website without clear permission").approach,
    /Do not probe, bypass controls/,
  );
  assert.match(
    find("interview question about private information").approach,
    /context-specific/,
  );
  assert.match(
    find("trial shift or training is paid").approach,
    /depends on the facts/,
  );
  assert.match(
    find("community involvement hours are recorded honestly").approach,
    /school and organization rules/,
  );
});
