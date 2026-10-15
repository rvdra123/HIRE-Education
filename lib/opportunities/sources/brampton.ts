import { load } from "cheerio";
import { torontoDateTime } from "../time";
import type { ListingInput, SourceConfig } from "../types";

const clean = (value: string) =>
  value
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// These adapters read only the public, server-rendered listing sections. They
// never turn navigation links, role directories, or inferred dates into records.
export function bramptonListings(
  body: string,
  source: SourceConfig,
): ListingInput[] {
  const $ = load(body);
  if (source.adapter === "brampton-library-events") {
    const cards = $(".event-wrapper");
    if (!cards.length) throw new Error("Library event page format changed");
    return cards.toArray().map((element) => {
      const card = $(element);
      const link = card.find("a.card__title-link");
      const title = clean(link.text());
      const fields = new Map<string, string>();
      card.find(".kvp").each((_, field) => {
        fields.set(
          clean($(field).find(".label").text()),
          clean($(field).find(".value").text()),
        );
      });
      const day = fields.get("Date") || "";
      const time = fields.get("Time") || "";
      const times =
        /^@\s*(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)$/i.exec(time);
      const start = times ? torontoDateTime(day, times[1]) : null;
      const end = times ? torontoDateTime(day, times[2]) : null;
      const applicationUrl = link.attr("href") || "";
      if (!/^https:\/\/bramlib\.libnet\.info\/event\/\d+$/.test(applicationUrl))
        throw new Error("Library event link format changed");
      const location = fields.get("Location") || "";
      const ages =
        /(?:ages?\s*)?(\d{1,2})(?:\s*[-–]\s*\d{1,2}\s*years|\+)/i.exec(title);
      return {
        title,
        organization: source.organization,
        description: `${title}. Date: ${day}. Time: ${time}. Location: ${location}.`,
        opportunityType: "event",
        category: "Library teen events",
        location,
        city: "Brampton",
        sourceUrl: source.url,
        applicationUrl,
        startDate: start,
        endDate: end,
        minimumAge: ages ? Number(ages[1]) : null,
        eligibility: ages
          ? ages[0]
          : "Check eligibility with Brampton Library.",
        applicationStatus:
          start &&
          end &&
          end > start &&
          !/cancelled|canceled|postponed|sold out|full|waitlist/i.test(
            card.text(),
          )
            ? "open"
            : "unknown",
      };
    });
  }
  if (source.adapter === "brampton-library-volunteer") {
    const heading = $("h2").filter(
      (_, el) => clean($(el).text()) === "Youth Volunteer Opportunities",
    );
    if (heading.length !== 1)
      throw new Error("Library youth volunteer section changed");
    const section = heading.nextUntil("h2");
    const title = clean(section.filter("h3").text());
    const description = section
      .filter("p")
      .toArray()
      .map((el) => clean($(el).text()))
      .join(" ");
    const link =
      section
        .find("a")
        .filter((_, el) => clean($(el).text()) === "Apply online")
        .attr("href") || "";
    if (
      title !== "Program Assistant" ||
      !/^https:\/\/form\.jotform\.com\/\d+$/.test(link)
    )
      throw new Error("Library youth volunteer application changed");
    return [
      {
        title,
        organization: source.organization,
        description,
        opportunityType: "volunteer",
        category: "Library volunteering",
        location: "Brampton Library branches",
        city: "Brampton",
        paid: "volunteer",
        eligibility:
          "Youth Volunteer Opportunities; check eligibility with Brampton Library.",
        sourceUrl: source.url,
        applicationUrl: link,
        applicationStatus:
          /please complete|apply online/i.test(description) &&
          !/closed|not accepting/i.test(description)
            ? "open"
            : "unknown",
      },
    ];
  }
  if (source.adapter === "brampton-volunteer") {
    const content = $("[id$='_ControlWrapper_RichHtmlField']").filter(
      (_, el) =>
        /Application Process/.test($(el).text()) &&
        /volunteering with the City of Brampton/.test($(el).text()),
    );
    if (content.length !== 1)
      throw new Error("City volunteer intake section changed");
    const description = clean(content.text());
    const link =
      content
        .find("a")
        .filter((_, el) => clean($(el).text()) === "Apply to Volunteer!")
        .attr("href") || "";
    if (
      !/^https:\/\/app\.betterimpact\.com\/PublicOrganization\/[a-f0-9-]+\/1$/.test(
        link,
      )
    )
      throw new Error("City volunteer intake application changed");
    const age =
      /eligible to volunteer with us when you turn (\d{1,2}) years old/i.exec(
        description,
      );
    return [
      {
        title: "City of Brampton Volunteer Opportunities",
        organization: source.organization,
        description,
        opportunityType: "volunteer",
        category: "City volunteering",
        location: "Brampton",
        city: "Brampton",
        paid: "volunteer",
        minimumAge: age ? Number(age[1]) : null,
        eligibility: age
          ? age[0]
          : "Check eligibility with the City of Brampton.",
        sourceUrl: source.url,
        applicationUrl: link,
        applicationStatus:
          /intake is now open/i.test(description) &&
          !/intake is (?:now )?closed|applications (?:are )?closed/i.test(
            description,
          )
            ? "open"
            : "unknown",
        // The page says "November 9" without a year or time. Preserve that text
        // in the description; never manufacture an applicationDeadline.
      },
    ];
  }
  throw new Error("Unknown Brampton adapter");
}
