import { NextResponse } from "next/server";
import { z } from "zod";
import { boundedForm, UploadError, validateResume } from "@/lib/openai/files";
import { reviewAvailable } from "@/lib/openai/config";
import { reviewResume } from "@/lib/openai/review";
import {
  clientLimitKey,
  limit,
  privateHeaders,
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
    { available: reviewAvailable(), maxFileSizeMb: 6 },
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
    const upload = form.get("resume");
    if (!(upload instanceof File))
      throw new UploadError("Choose a PDF or DOCX resume.");
    const file = await validateResume(upload);
    if (!reviewAvailable())
      return NextResponse.json(
        {
          error:
            "AI review is not available yet. You can use the resume guide while the service is being configured.",
        },
        { status: 503, headers: privateHeaders },
      );
    const userLimit = await limit(clientLimitKey(request), 3, 3600000);
    const globalLimit = await limit("review-global-budget", 60, 86400000);
    if (!userLimit.allowed || !globalLimit.allowed)
      return NextResponse.json(
        { error: "The review limit has been reached. Please try again later." },
        {
          status: 429,
          headers: {
            ...privateHeaders,
            "Retry-After": String(
              !userLimit.allowed
                ? userLimit.retryAfter
                : globalLimit.retryAfter,
            ),
          },
        },
      );
    return NextResponse.json(
      { review: await reviewResume(file, context.data) },
      { headers: privateHeaders },
    );
  } catch (error) {
    if (error instanceof UploadError)
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: privateHeaders },
      );
    return NextResponse.json(
      {
        error:
          "We could not complete this review. Your resume has not been saved by HIRE Education. Please try again later.",
      },
      { status: 503, headers: privateHeaders },
    );
  }
}
