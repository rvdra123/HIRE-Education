import { createHash } from "node:crypto";
import { load } from "cheerio";
import { z } from "zod";
import type { ListingInput } from "../types";
import { torontoDateTime } from "../time";

const origin = "https://ajax.wd10.myworkdayjobs.com";
const clean = (text: string) =>
  text.normalize("NFKC").replace(/\s+/g, " ").trim();
const rules: Record<
  string,
  {
    title: string;
    qualificationSha256: string;
    summary: string;
    eligibility: string;
    minimumAge?: number;
    educationRequirement?: string;
    marchBreak?: boolean;
  }
> = {
  JR100505: {
    title: "Part Time Program Instructor - Adapted Arts",
    qualificationSha256:
      "2de2fe171d27320cb56cd07bfe83f3a68d655efa89aa946b6f1ca4c53971753e",
    summary:
      "Teach beginner performing and visual arts to participants with special needs. The program works with Grandview Kids at its Jerry Coughlan Building, 1461 Harwood Avenue North, Ajax; the duties are offsite from the Town's recreation centre. Programs begin January 13, 2027, with mandatory staff training January 6.",
    minimumAge: 16,
    eligibility:
      "Age 16 or older; at least one year teaching or coaching performing/visual arts or leadership skills, or an equivalent combination of training, education and experience; two to three years of advanced skills in the activity. Experience with recreation programs and children/youth; current Standard First Aid and CPR C; HIGH FIVE Principles of Healthy Child Development; a recent clear criminal reference/vulnerable sector check. Confirm the complete requirements with the employer.",
  },
  JR100502: {
    title: "March Break Inclusion Support 2027-1",
    qualificationSha256:
      "ef348db13b74dab68277bd1abebddb5056ba96417601f7c003b5179e3c41de8c",
    summary:
      "Support a child, youth or young adult with special needs during March Break camps, including adaptations, personal care, behaviour support and physical transfers. Work the full March 15–19, 2027 camp week and mandatory training dates. This role requires a completed Grade 12 diploma or an equivalent combination of education and experience.",
    educationRequirement:
      "Grade 12 high-school diploma or equivalent combination of experience and education",
    marchBreak: true,
    eligibility:
      "Grade 12 diploma or an equivalent combination of education and experience; nine months to one year of relevant experience; experience supporting children, youth or young adults with special needs; behaviour management and personal-care skills. Ability to lift at least 50 pounds. Standard First Aid/CPR C and HIGH FIVE certification by March 2, 2027 if hired; recent clear criminal reference/vulnerable sector check. Available March 15–19 and all mandatory training dates. Postsecondary study is an asset, not a requirement. Minimum age is not published.",
  },
  JR100501: {
    title: "2027 Camp Counsellor for March Break Camp",
    qualificationSha256:
      "ebbb59a5041c2a9c2a6e8fba85794940c3b11dde4b974c9c13c14b3c90a0f9aa",
    summary:
      "Plan and lead activities for March Break camp participants aged 2.5–16. The paid job runs March 15–19, 2027, with mandatory training before camp. The advertised pay rates take effect January 1, 2027. Applicants must turn 16 by March 2, 2027.",
    minimumAge: 16,
    marchBreak: true,
    eligibility:
      "Must be 16 or older by March 2, 2027. Standard First Aid with CPR C and HIGH FIVE Principles of Healthy Child Development by March 2 if hired; a recent clear criminal reference/vulnerable sector check. Available for the whole March 15–19 camp week and mandatory training. Strong communication, planning and teamwork skills; comfortable participating in outdoor activities and swim trips. One year working with children, including babysitting, is preferred rather than mandatory.",
  },
  JR100488: {
    title: "Part Time Lifeguard & Swim Instructor",
    qualificationSha256:
      "44e53f8554e8be354f6ba89718887be400ff5de261d16a59f22212603fc0590f",
    summary:
      "Supervise pool activities and teach learn-to-swim programs at Town of Ajax aquatic facilities. Shifts are scheduled with staff availability, Monday to Sunday between 6:30 a.m. and 10 p.m., up to 24 hours per week. This is a certified aquatics role.",
    minimumAge: 15,
    eligibility:
      "Age 15 or older; current Standard First Aid and CPR C; Lifesaving Society National Lifeguard qualification current within two years; LSS Swim Instructor qualification; aquatic program knowledge and strong communication. Recent clear criminal reference/vulnerable sector check. LSS Lifesaving Instructor and HIGH FIVE Principles of Healthy Child Development must be obtained within six months of employment.",
  },
  JR100461: {
    title: "Part Time Program Instructor - Dance",
    qualificationSha256:
      "391d521f6dd506d9752d8c867ded5d674bbe5eea084ece172c3fae0069c5372e",
    summary:
      "Teach beginner hip-hop dance and help participants develop skills in an inclusive recreation program. The current posting requests Wednesday classes at McLean Community Centre, 6:15–8:30 p.m.; broader shift availability is also required. Confirm the program schedule because the posting retains earlier seasonal training dates.",
    minimumAge: 16,
    eligibility:
      "Age 16 or older; one year teaching/coaching hip-hop or leadership skills, or an equivalent combination of training, education and experience; two to three years of advanced skills in the activity. Recreation experience across age groups; current Standard First Aid and CPR C; HIGH FIVE Principles of Healthy Child Development; a recent clear criminal reference/vulnerable sector check. Must be available for varied shifts, including days, afternoons, evenings and weekends.",
  },
  JR100486: {
    title: "Part Time Security - Community Schools",
    qualificationSha256:
      "2386b6f95a3aea77c8fb96cd29b96e6bac9e009381de2772443404f16f953bcb",
    summary:
      "Open and close community schools for recreation permit holders, assist with room setup, monitor facility rules and complete light housekeeping. This part-time role works evenings and weekends, up to 24 hours weekly. A completed Grade 12 diploma or equivalent experience is required; minimum age is not published.",
    educationRequirement: "Grade 12 diploma or equivalent experience",
    eligibility:
      "Grade 12 diploma or equivalent experience; current Standard First Aid, CPR C and AED certification; strong customer service, communication and leadership skills. Recent clear criminal reference/vulnerable sector check. Available for evening and weekend shifts, including statutory holidays. Minimum age is not published; confirm eligibility directly with the employer.",
  },
};

export function ajaxJobLinks(body: string) {
  const sitemap = load(body, { xml: true });
  if (sitemap("urlset").length !== 1)
    throw new Error("Ajax careers sitemap changed");
  const urls = sitemap("url > loc")
    .toArray()
    .map((element) => sitemap(element).text().trim());
  if (!urls.length || urls.length > 500)
    throw new Error("Ajax careers sitemap is missing or too large");
  const selected: string[] = [];
  const ids = new Set<string>();
  for (const value of urls) {
    const url = new URL(value);
    const match = /^\/Ajax\/job\/[^/]+\/[^/]+_(JR\d+)(?:-\d+)?$/.exec(
      url.pathname,
    );
    if (
      url.origin !== origin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !match
    )
      throw new Error("Ajax careers sitemap contains an unexpected URL");
    if (!rules[match[1]]) continue;
    if (ids.has(match[1]))
      throw new Error("Ajax careers selection is duplicated");
    ids.add(match[1]);
    selected.push(
      value.replace(`${origin}/Ajax/job/`, `${origin}/wday/cxs/ajax/Ajax/job/`),
    );
  }
  return selected;
}

const posting = z.object({
  jobPostingInfo: z.object({
    title: z.string(),
    jobDescription: z.string(),
    location: z.string(),
    jobReqId: z.string(),
    jobPostingId: z.string(),
    externalUrl: z.string().url(),
    country: z.object({ descriptor: z.literal("Canada") }),
    canApply: z.boolean(),
    posted: z.boolean(),
    timeType: z.enum(["Part time", "Full time"]),
  }),
});
const envelope = z.object({
  search: z.string(),
  details: z
    .array(z.object({ url: z.string().url(), body: z.string() }))
    .max(6),
});

export function ajaxJobs(body: string): ListingInput[] {
  const data = envelope.parse(JSON.parse(body));
  const links = ajaxJobLinks(data.search);
  const details = new Map(
    data.details.map((detail) => [detail.url, detail.body]),
  );
  if (details.size !== data.details.length || details.size !== links.length)
    throw new Error("Ajax careers details are incomplete");
  return links.map((url) => {
    const detail = details.get(url);
    if (!detail) throw new Error("Ajax careers detail page is missing");
    const job = posting.parse(JSON.parse(detail)).jobPostingInfo;
    const rule = rules[job.jobReqId];
    const external = url.replace(
      `${origin}/wday/cxs/ajax/Ajax/job/`,
      `${origin}/Ajax/job/`,
    );
    if (
      !rule ||
      job.title !== rule.title ||
      job.externalUrl !== external ||
      job.jobPostingId !== new URL(external).pathname.split("/").at(-1)
    )
      throw new Error("Ajax careers job identity changed");
    const page = load(job.jobDescription);
    page("script,style").remove();
    page("br").replaceWith(" ");
    page("p,div,li,h2,h3").append(" ");
    const text = clean(page.text());
    const qualifications =
      /Qualifications\/Skills\s*(.+?)\s*What is offered to Staff\s*:?/i.exec(
        text,
      )?.[1];
    if (
      !qualifications ||
      createHash("sha256").update(clean(qualifications)).digest("hex") !==
        rule.qualificationSha256
    )
      throw new Error("Ajax careers qualifications changed and require review");
    const positions = /Number of Positions\s+(\d+)\s+Affiliation/.exec(
      text,
    )?.[1];
    const date =
      /apply by 11:59 p\.m\. on the closing date:\s*(\w+ \d{1,2}, \d{4})/i.exec(
        text,
      )?.[1];
    const deadline = date ? torontoDateTime(date, "11:59PM") : null;
    const hourly =
      /Compensation:\s*(\$\d+\.\d{2})\s*-\s*(\$\d+\.\d{2}) per hour/i.exec(
        text,
      );
    const range =
      hourly ||
      /Compensation Range\s*(\$\d+\.\d{2})\s*-\s*(\$\d+\.\d{2})/.exec(text);
    if (
      !positions ||
      !deadline ||
      !range ||
      !/All job postings issued by the Town of Ajax are intended to fill existing vacant positions unless otherwise stated\./.test(
        text,
      )
    )
      throw new Error("Ajax careers vacancy details changed");
    if (
      rule.marchBreak &&
      (!/Camps begin\s*[–—:-]\s*March 15, 2027/.test(text) ||
        !/Camps end\s*[–—:-]\s*March 19, 2027/.test(text) ||
        !/pay rates are effective January 1, 2027/.test(text))
    )
      throw new Error("Ajax March Break season changed");
    if (
      job.jobReqId === "JR100505" &&
      (!text.includes("1461 Harwood Ave. N, Ajax") ||
        !text.includes("Programs begin: January 13, 2027") ||
        !text.includes("Staff Training: January 6, 2027"))
    )
      throw new Error("Ajax adapted arts program details changed");
    if (
      job.jobReqId === "JR100461" &&
      !text.includes(
        "Wednesdays at the McLean Community Centre from 6:15 p.m. - 8:30 p.m.",
      )
    )
      throw new Error("Ajax dance program schedule changed");
    const open =
      job.posted &&
      job.canApply &&
      Number(positions) > 0 &&
      !/talent pool|candidate pool|not (?:for )?an? existing vacancy|no longer available|applications? (?:are )?closed/i.test(
        text,
      );
    const compensation = `${range[1]}–${range[2]}${hourly ? " per hour, effective January 1, 2027" : " (pay period not stated)"}`;
    return {
      title: job.title,
      organization: "Town of Ajax",
      description: `${rule.summary} The Town advertises ${positions} existing position${positions === "1" ? "" : "s"}. Published compensation: ${compensation}. Applications close ${date} at 11:59 p.m. Toronto time. Read the official posting for all required qualifications and hiring conditions.`,
      opportunityType: "job",
      category: "Recreation and community services",
      location:
        job.jobReqId === "JR100505"
          ? "Grandview Kids – Jerry Coughlan Building, Ajax, Ontario"
          : `${job.location}, Ajax, Ontario`,
      city: "Ajax",
      paid: "paid",
      compensation,
      minimumAge: rule.minimumAge ?? null,
      eligibility: rule.eligibility,
      educationRequirement: rule.educationRequirement || "",
      commitment: rule.marchBreak ? "short-term" : "part-time",
      hours: rule.marchBreak
        ? "Full March 15–19, 2027 camp week plus mandatory training; daytime shifts"
        : "Up to 24 hours per week; check the official posting for required availability",
      ...(rule.marchBreak
        ? { startDateOnly: "2027-03-15", endDateOnly: "2027-03-19" }
        : {}),
      ...(job.jobReqId === "JR100505" ? { startDateOnly: "2027-01-13" } : {}),
      sourceUrl: external,
      applicationUrl: external,
      applicationDeadline: deadline,
      applicationStatus: open ? "open" : "unknown",
    };
  });
}
