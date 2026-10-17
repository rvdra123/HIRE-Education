import assert from "node:assert/strict";
import { test } from "node:test";
import {
  educationalChannels,
  filterCareerResources,
  resources,
  resourceCategories,
  resourceRegions,
  resourceTopicFromLocation,
  type ResourceFilters,
} from "../lib/career-resources-data";

const emptyFilters: ResourceFilters = {
  query: "",
  category: "",
  region: "",
  audience: "",
  organization: "",
};

test("resource library has unique HTTPS destinations and explicit audience and scope", () => {
  const ids = new Set<string>();
  const destinations = new Set<string>();
  for (const resource of resources) {
    assert.ok(!ids.has(resource.id), `duplicate ID: ${resource.id}`);
    ids.add(resource.id);
    const url = new URL(resource.url);
    assert.equal(url.protocol, "https:", resource.id);
    assert.equal(url.username, "");
    assert.equal(url.password, "");
    const destination = resource.url.replace(/\/$/, "");
    assert.ok(
      !destinations.has(destination),
      `duplicate destination: ${destination}`,
    );
    destinations.add(destination);
    assert.ok(resourceCategories.includes(resource.category));
    assert.ok(resourceRegions.includes(resource.region));
    assert.ok(resource.audienceNote.trim());
    assert.ok(resource.description.trim());
  }
});

test("every educational channel has a provider identity source and labels general content", () => {
  assert.ok(educationalChannels.length > 0);
  for (const channel of educationalChannels) {
    assert.equal(channel.format, "YouTube");
    assert.match(new URL(channel.url).hostname, /^(www\.)?youtube\.com$/);
    assert.ok(channel.identitySourceUrl, channel.id);
    assert.doesNotMatch(
      new URL(channel.identitySourceUrl!).hostname,
      /(^|\.)youtube\.com$/,
    );
    assert.match(channel.sourceReviewedOn || "", /^\d{4}-\d{2}-\d{2}$/);
    if (!channel.youthFocused)
      assert.match(
        channel.audienceNote,
        /not made specifically for high-school/,
      );
  }
});

test("combined search finds real cross-field matches and handles accents and whitespace", () => {
  assert.ok(
    filterCareerResources(resources, {
      ...emptyFilters,
      query: "achev youth",
    }).some((item) => item.id === "achev-youth"),
  );
  assert.ok(
    filterCareerResources(resources, {
      ...emptyFilters,
      query: " SIN   Canada ",
    }).some((item) => item.id === "canada-sin"),
  );
  assert.deepEqual(
    filterCareerResources(resources, {
      ...emptyFilters,
      query: "nonexistentxyz banana",
    }),
    [],
  );
});

test("topic, provider, scope and audience filters combine rather than replace each other", () => {
  const found = filterCareerResources(resources, {
    ...emptyFilters,
    category: "YouTube learning",
    region: "Peel",
    audience: "youth",
    organization: "BGC Peel",
  });
  assert.deepEqual(
    found.map((resource) => resource.id),
    ["youtube-bgcpeel"],
  );
  assert.deepEqual(
    filterCareerResources(resources, {
      ...emptyFilters,
      category: "YouTube learning",
      organization: "BGC Peel",
      audience: "general",
    }),
    [],
  );
  assert.equal(
    filterCareerResources(resources, emptyFilters).length,
    resources.length,
  );
});

test("restricted youth pathways and paid study options keep their access limits visible", () => {
  const holland = resources.find(
    (resource) => resource.id === "holland-employment",
  )!;
  assert.match(holland.audienceNote, /14–18/);
  assert.match(holland.audienceNote, /one more full year/);
  const mentor = resources.find(
    (resource) => resource.id === "holland-mentorship",
  )!;
  assert.match(mentor.audienceNote, /current\/former clients 16\+/);
  assert.match(
    resources.find((resource) => resource.id === "tvoilc")!.audienceNote,
    /fees/,
  );
  assert.match(
    resources.find((resource) => resource.id === "jvs-youth")!.description,
    /start at age 18/,
  );
});

test("YouTube and topic links work in ordinary and static hash routes", () => {
  assert.equal(
    resourceTopicFromLocation("", "#youtube-resources"),
    "YouTube learning",
  );
  assert.equal(
    resourceTopicFromLocation("", "#/?section=youtube-resources"),
    "YouTube learning",
  );
  assert.equal(
    resourceTopicFromLocation(
      "?resourceTopic=School%20%26%20study",
      "#resources",
    ),
    "School & study",
  );
  assert.equal(
    resourceTopicFromLocation(
      "",
      "#/?resourceTopic=YouTube%20learning&section=resources",
    ),
    "YouTube learning",
  );
  assert.equal(
    resourceTopicFromLocation("?resourceTopic=unknown", "#resources"),
    null,
  );
  assert.equal(resourceTopicFromLocation("", "#/?section=%"), null);
});
