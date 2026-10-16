import { load } from "cheerio";
import { torontoDateTime } from "../time";
import type { ListingInput, SourceConfig } from "../types";

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
export function skillsOntarioCamps(
  body: string,
  source: SourceConfig,
): ListingInput[] {
  const $ = load(body);
  const paragraphs = $("p")
    .toArray()
    .map((p) => clean($(p).text()));
  const season = paragraphs.find((p) =>
    /Confirmed camp dates & locations for \d{4}/.test(p),
  );
  const year = season?.match(/for (\d{4})/)?.[1];
  const eligibility = paragraphs.find((p) =>
    /intended for participants entering Grades 7-9/.test(p),
  );
  const hours = paragraphs.find((p) =>
    /Monday-Friday, 9:00 AM to 4:00 PM/.test(p),
  );
  const fee = paragraphs.find((p) =>
    /registration rates are \$\d+ per camper/.test(p),
  );
  const table = $("table").filter(
    (_, el) =>
      /Camp Host/.test($(el).text()) && /Registration Link/.test($(el).text()),
  );
  if (!year || !eligibility || !hours || !fee || table.length !== 1)
    throw new Error("Skills Ontario camp schedule structure changed");
  let range: RegExpMatchArray | null = null;
  const items: ListingInput[] = [];
  table.find("tr").each((_, row) => {
    const cells = $(row).children("td");
    if (cells.length === 1 && cells.attr("colspan")) {
      // text() preserves the split markup in "July 2</strong><strong>7th".
      const label = clean(cells.text());
      range = label.match(
        /^(\w+) (\d{1,2})(?:st|nd|rd|th)?\s*[–-]\s*(\w+) (\d{1,2})(?:st|nd|rd|th)?(?:, (\d{4}))?$/,
      );
      if (range?.[5] && range[5] !== year) range = null;
      return;
    }
    if (cells.length !== 4 || clean(cells.eq(1).text()) !== "Brampton") return;
    if (!range)
      throw new Error("Skills Ontario Brampton session dates changed");
    const start = torontoDateTime(`${range[1]} ${range[2]}, ${year}`, "9:00AM");
    const end = torontoDateTime(`${range[3]} ${range[4]}, ${year}`, "4:00PM");
    const link = cells.eq(3).find("a").attr("href") || "";
    if (
      !start ||
      !end ||
      end <= start ||
      !/^https:\/\/www\.eventbrite\.com\/e\/[a-z0-9-]+\//.test(link)
    )
      throw new Error(
        "Skills Ontario session dates or registration link changed",
      );
    const host = clean(cells.eq(0).text());
    items.push({
      title: `Skills Ontario Trades & Tech Summer Camp — ${host}`,
      organization: source.organization,
      description: `Trades and technology summer camp at ${host}, Brampton. ${clean(range[0])}. ${eligibility} ${hours} ${fee}`,
      opportunityType: "summer-program",
      category: "Skilled trades and technology",
      location: `${host}, Brampton`,
      city: "Brampton",
      eligibleGrades: [9],
      eligibility,
      hours,
      cost: fee,
      startDate: start,
      endDate: end,
      commitment: "summer",
      sourceUrl: source.url,
      applicationUrl: link,
      // An old Register link does not establish available spaces or an open intake.
      applicationStatus: "unknown",
    });
  });
  if (!items.length)
    throw new Error("Skills Ontario Brampton sessions missing");
  return items;
}
