import { load } from "cheerio";
import type { ListingInput, SourceConfig } from "../types";

export function hackClubCommunity(
  body: string,
  source: SourceConfig,
): ListingInput[] {
  const $ = load(body);
  $("script,style,nav,header,footer").remove();
  const text = $("main").text().replace(/\s+/g, " ");
  const join =
    $("input[type=email]").length > 0 &&
    $("button")
      .toArray()
      .some((el) => /^Join!$/.test($(el).text().trim()));
  if (
    !join ||
    !/For all teens aged 13[–-]18/.test(text) ||
    !/Hack Club is free for every teenager, forever/.test(text) ||
    !/anywhere on Earth/.test(text) ||
    !/Our online community/.test(text)
  )
    throw new Error("Hack Club community intake changed");
  return [
    {
      title: "Hack Club online community for teen makers",
      organization: source.organization,
      description:
        "Free online coding and making community for teenagers aged 13–18 worldwide. Meet other teen makers, collaborate on projects and get help with coding. Join using the email signup on Hack Club's official page. Separate challenges and in-person events have their own eligibility and terms; no prize, paid employment or event admission is guaranteed.",
      opportunityType: "youth-program",
      category: "Coding and technology",
      location: "Online — worldwide",
      remote: true,
      minimumAge: 13,
      eligibility:
        "Ages 13–18, worldwide. Review Hack Club's terms and code of conduct; minors need parent or guardian permission for challenges.",
      cost: "Free",
      commitment: "ongoing",
      sourceUrl: source.url,
      applicationUrl: source.url,
      applicationStatus: "open",
    },
  ];
}
