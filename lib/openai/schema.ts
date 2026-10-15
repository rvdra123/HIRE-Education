import { z } from "zod";
const score = z.number().int().min(0).max(10);
const points = z.array(z.string().max(1200)).max(12);
export const reviewSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  summary: z.string().max(2000),
  scores: z.object({
    formatting: score,
    content: score,
    experience: score,
    skills: score,
    ats: score,
    professionalism: score,
    jobRelevance: score,
  }),
  strongestSections: points,
  strengths: points,
  weaknesses: points,
  improvements: points,
  missingSections: points,
  grammarIssues: points,
  bulletRewrites: z
    .array(
      z.object({
        original: z.string().max(1500),
        suggested: z.string().max(1500),
        why: z.string().max(1000),
      }),
    )
    .max(8),
  atsFeedback: z.object({
    summary: z.string().max(1500),
    concerns: points,
    limitations: z.string().max(1000),
  }),
  jobMatch: z.object({
    score: z.number().int().min(0).max(100),
    summary: z.string().max(1500),
    relevantStrengths: points,
    emphasizedSkills: points,
    highlightExperience: points,
    potentialGaps: points,
    topChanges: points,
  }),
  topActions: z.array(z.string().max(1000)).length(3),
});
export type ResumeReview = z.infer<typeof reviewSchema>;
export function normalizeReview(value: unknown) {
  const data = reviewSchema.parse(value);
  data.bulletRewrites = data.bulletRewrites.filter((b) => {
    const original = new Set(b.original.match(/\d+(?:[.,]\d+)?%?/g) || []);
    return (b.suggested.match(/\d+(?:[.,]\d+)?%?/g) || []).every((n) =>
      original.has(n),
    );
  });
  data.overallScore = Math.round(
    (Object.values(data.scores).reduce((a, b) => a + b, 0) / 70) * 100,
  );
  return data;
}
export function scoreLabel(score: number) {
  return score >= 90
    ? "Excellent"
    : score >= 80
      ? "Strong"
      : score >= 70
        ? "Good foundation"
        : score >= 60
          ? "Needs improvement"
          : "Needs work";
}
