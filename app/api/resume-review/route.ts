import { NextResponse } from "next/server";
import { z } from "zod";
import { boundedForm, UploadError, validateResume } from "@/lib/openai/files";
import { reviewConfiguration } from "@/lib/openai/config";
import { reviewResume } from "@/lib/ai/review";
import { reviewFailure } from "@/lib/openai/errors";
import {
  clientLimitKey,
  limit,
  privateHeaders,
  reserveLimits,
  reviewLimitMessage,
  releaseReservation,
  sameOrigin,
} from "@/lib/security/requests";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
const contextSchema = z.object({
  grade: z.enum(["", "9", "10", "11", "12"]),
  kind: z.enum([
    "job",
    "volunteer",
    "internship",
    "summer-program",
    "youth-program",
    "career-program",
    "other",
  ]),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(60).max(16000),
  consent: z.literal("yes"),
});
export async function GET() {
  return NextResponse.json(
    { ...reviewConfiguration(), maxFileSizeMb: 4 },
    { headers: privateHeaders },
  );
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      {
        error:
          "Open the reviewer from the HIRE Education website and try again.",
      },
      { status: 403, headers: privateHeaders },
    );
  let reservation: { key: string; resetAt: number } | undefined;
  let stage: "usage" | "document" | "provider" = "usage";
  try {
    const gate = await limit(`upload:${clientLimitKey(request)}`, 12, 3600000);
    if (!gate.allowed)
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: {
            ...privateHeaders,
            "Retry-After": String(gate.retryAfter),
          },
        },
      );
    stage = "document";
    const form = await boundedForm(request);
    const context = contextSchema.safeParse({
      grade: form.get("grade") || "",
      kind: form.get("kind"),
      title: form.get("title"),
      description: form.get("description"),
      consent: form.get("consent"),
    });
    if (!context.success)
      return NextResponse.json(
        {
          error:
            "Add a target role, a job description of at least 60 characters, and consent to AI processing.",
        },
        { status: 400, headers: privateHeaders },
      );
    const plain = form.get("resumeText");
    const upload = form.get("resume");
    const file =
      typeof plain === "string" && plain.trim()
        ? (() => {
            if (plain.trim().length < 80 || plain.length > 50000)
              throw new UploadError(
                "Paste between 80 and 50,000 characters of resume text.",
              );
            return {
              buffer: Buffer.from(plain.trim()),
              name: "student-resume.txt",
              mime: "text/plain",
              format: "text" as const,
            };
          })()
        : upload instanceof File
          ? await validateResume(upload)
          : (() => {
              throw new UploadError(
                "Upload a PDF or DOCX resume, or paste your resume text.",
              );
            })();
    const configuration = reviewConfiguration();
    if (!configuration.available)
      return NextResponse.json(
        {
          error:
            "AI review is not available yet. You can use the resume guide while the service is being configured.",
          code: configuration.code,
        },
        { status: 503, headers: privateHeaders },
      );
    stage = "usage";
    const reviewLimit = await reserveLimits([
      { key: clientLimitKey(request), max: 3, windowMs: 3600000 },
      { key: "review-global-budget", max: 60, windowMs: 86400000 },
    ]);
    if (!reviewLimit.allowed)
      return NextResponse.json(
        {
          error: reviewLimitMessage(
            reviewLimit.blockedIndex,
            reviewLimit.retryAfter,
          ),
          retryAfter: reviewLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            ...privateHeaders,
            "Retry-After": String(reviewLimit.retryAfter),
          },
        },
      );
    reservation = reviewLimit.reservations[0];
    stage = "provider";
    const review = await reviewResume(file, context.data);
    reservation = undefined;
    return NextResponse.json({ review }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof UploadError)
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: privateHeaders },
      );
    // Service failures do not spend the student's hourly allowance. The daily
    // attempt budget remains consumed to keep provider spending bounded.
    if (reservation) await releaseReservation(reservation).catch(() => {});
    const failure =
      stage === "provider"
        ? reviewFailure(error)
        : {
            code:
              stage === "usage"
                ? "REVIEW_STORAGE_UNAVAILABLE"
                : "RESUME_READ_FAILED",
            message:
              stage === "usage"
                ? "The reviewer’s usage service is unavailable. The site owner needs to check the database connection."
                : "This document could not be read. Export it again or paste your resume text instead.",
            providerStatus: undefined,
          };
    console.error(
      JSON.stringify({
        event: "resume_review_failed",
        code: failure.code,
        providerStatus: failure.providerStatus,
      }),
    );
    return NextResponse.json(
      { error: failure.message, code: failure.code },
      { status: 503, headers: privateHeaders },
    );
  }
}
