import { createHash } from "node:crypto";
import type { NormalizedListing, OpportunityStatus } from "./types";
export function publicUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname) &&
      !/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[|0\.)/i.test(
        u.hostname,
      ) &&
      !u.hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
}
export function canonicalUrl(value: string) {
  const u = new URL(value);
  u.hash = "";
  for (const key of [...u.searchParams.keys()])
    if (/^(utm_|ref$|source$|fbclid$)/i.test(key)) u.searchParams.delete(key);
  u.searchParams.sort();
  return u.toString().replace(/\/$/, "");
}
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export function fingerprint(item: NormalizedListing) {
  return createHash("sha256")
    .update(
      [
        item.opportunityType,
        normalize(item.title),
        normalize(item.organization),
        normalize(item.location),
        item.startDate?.slice(0, 10) || "",
      ].join("|"),
    )
    .digest("hex");
}
export function suitableForStudents(item: NormalizedListing) {
  const text = `${item.title} ${item.educationRequirement}`;
  if (
    /\b(senior manager|chief|director of|registered nurse|physician|licensed engineer|bachelor|master'?s|ph\.?d)\b/i.test(
      text,
    )
  )
    return false;
  if (item.experienceYears !== null && item.experienceYears > 1) return false;
  if (item.minimumAge !== null && item.minimumAge > 18) return false;
  const positive =
    (item.opportunityType !== "job" && item.opportunityType !== "internship") ||
    item.eligibleGrades.length > 0 ||
    (item.minimumAge !== null && item.minimumAge <= 18) ||
    /student|youth|teen|entry.?level|part.?time|summer|seasonal|camp|recreation|retail|cashier|crew|volunteer/i.test(
      `${item.title} ${item.description} ${item.commitment}`,
    );
  return (
    positive &&
    (item.remote ||
      /brampton|peel|mississauga|caledon|toronto|gta|ontario|canada/i.test(
        `${item.location} ${item.city} ${item.province} ${item.country}`,
      ))
  );
}
export function qualityNotes(item: NormalizedListing) {
  const notes: string[] = [];
  if (!publicUrl(item.sourceUrl) || !publicUrl(item.applicationUrl))
    notes.push("Invalid official link");
  if (!suitableForStudents(item))
    notes.push("Not suitable for the student catalogue");
  if (
    /pay.*(apply|application)|guaranteed.*income|send.*(bitcoin|crypto)/i.test(
      item.description,
    )
  )
    notes.push("Requires manual fraud review");
  if (item.opportunityType === "event" && !item.startDate)
    notes.push("Event start date has not been confirmed");
  if (item.applicationStatus === "unknown")
    notes.push("Application status has not been confirmed");
  return notes;
}
export function statusFor(
  item: NormalizedListing,
  now = new Date(),
): OpportunityStatus {
  if (item.applicationStatus === "closed") return "expired";
  if (
    item.applicationDeadline &&
    Date.parse(item.applicationDeadline) <= now.getTime()
  )
    return "expired";
  if (
    item.opportunityType === "event" &&
    item.endDate &&
    Date.parse(item.endDate) <= now.getTime()
  )
    return "expired";
  if (
    item.opportunityType === "event" &&
    !item.endDate &&
    item.startDate &&
    Date.parse(item.startDate) <= now.getTime()
  )
    return "expired";
  if (qualityNotes(item).length) return "needs-review";
  if (
    item.applicationDeadline &&
    Date.parse(item.applicationDeadline) - now.getTime() <= 7 * 86400000
  )
    return "expiring-soon";
  return "active";
}
