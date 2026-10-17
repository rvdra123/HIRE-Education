import { load } from "cheerio";
import { z } from "zod";
import type { ListingInput } from "../types";

const origin = "https://jobs.mississauga.ca";
const clean = (value: string) => value.replace(/\s+/g, " ").trim();

/** The City's public RSS contains complete postings. Only a reviewed student-accessible role is selected. */
export function mississaugaJobs(body: string): ListingInput[] {
  const feed = load(body, { xml: true });
  if (
    feed("rss > channel").length !== 1 ||
    feed("channel > title").text() !== "Jobs at City of Mississauga"
  )
    throw new Error("Mississauga careers RSS identity changed");
  const entries = feed("channel > item").toArray();
  if (!entries.length || entries.length > 500)
    throw new Error("Mississauga careers RSS is missing or too large");
  const selected = entries.filter(
    (entry) =>
      feed(entry).children("title").text() ===
      "Fitness Instructor (Mississauga, ON, CA)",
  );
  if (selected.length > 5)
    throw new Error("Mississauga careers selection is too large");
  return selected.map((entry) => {
    const item = feed(entry);
    const link = new URL(item.children("link").text());
    const guid = item.children("guid").text();
    if (
      link.origin !== origin ||
      link.pathname !== `/job/Mississauga-Fitness-Instructor-ON/${guid}/` ||
      !/^\d+$/.test(guid)
    )
      throw new Error("Mississauga careers job identity changed");
    // The feed places entity-encoded HTML inside CDATA; decode it before parsing.
    const html = load(item.children("description").text()).text();
    const page = load(html);
    page("script,style").remove();
    page("br").replaceWith(" ");
    page("p,div,li,h2").append(" ");
    const text = clean(page.text());
    const positions = /Number of Positions:\s*(\d+)\b/i.exec(text)?.[1];
    const closing = /Closing Date:\s*(\d{2})\/(\d{2})\/(\d{4})\b/i.exec(text);
    const rates =
      /Hourly Rate\/Salary:\s*\$?\s*(\d+\.\d{2})\s*-\s*\$?\s*(\d+\.\d{2})\b/i.exec(
        text,
      );
    const hours = /Hours of Work:\s*(up to \d+)\b/i.exec(text)?.[1];
    const location = /Work Location:\s*(.+?)\s*Organization Unit:/i.exec(
      text,
    )?.[1];
    if (
      !positions ||
      !closing ||
      !rates ||
      !hours ||
      !location ||
      !/Vacancy Type:\s*Part-Time/i.test(text) ||
      !/Experience teaching multi-level group exercise classes/i.test(text) ||
      !/Group Exercise Certification by a recognized association/i.test(text) ||
      !/Basic First Aid.*?CPR B certification/i.test(text) ||
      !/Level 3.*?Vulnerable Check/i.test(text) ||
      /(?:college|university|post-secondary).{0,100}(?:required|completion)|completion.{0,100}(?:college|university|post-secondary)/i.test(
        text,
      )
    )
      throw new Error("Mississauga careers job requirements changed");
    const date = z.iso
      .date()
      .parse(`${closing[3]}-${closing[1]}-${closing[2]}`);
    // The optional consideration for a later vacancy is standard boilerplate.
    // An explicit pool or no-existing-vacancy notice still prevents an open listing.
    const open =
      Number(positions) > 0 &&
      !/talent pool|candidate pool|future opportunities|not (?:for )?an? existing vacancy|no longer available|applications? (?:are )?closed/i.test(
        text,
      );
    return {
      title: "Fitness Instructor",
      organization: "City of Mississauga",
      description: `Paid part-time group fitness instruction at ${location}, Mississauga. The City advertises ${positions} positions, ${hours} hours of work, and an hourly rate of ${rates[1]}–${rates[2]}; the feed does not state a currency. Teach safe, adaptable exercise classes and support participants. This is a certified instructor role requiring prior group teaching experience. Minimum age is not published; confirm eligibility before applying. Applications close ${date}; the source does not publish a closing time.`,
      opportunityType: "job",
      category: "Recreation and instruction",
      location: `${location}, Mississauga, Ontario`,
      city: "Mississauga",
      paid: "paid",
      compensation: `${rates[1]}–${rates[2]} per hour (currency not stated in feed)`,
      eligibility:
        "Experience teaching group exercise classes; a current recognized group exercise qualification; Basic First Aid and CPR B before starting; a Level 3 vulnerable sector check. Required checks and first aid certification are at the successful candidate's expense. Age is not stated; ask the employer about age and certification eligibility.",
      commitment: "part-time",
      hours,
      sourceUrl: link.href,
      applicationUrl: link.href,
      applicationClosingDate: date,
      applicationStatus: open ? "open" : "unknown",
    };
  });
}
