import test from "node:test";
import assert from "node:assert/strict";
import { matchesDirectoryArea } from "../lib/opportunities/directory-filters";

test("GTA and regional directory filters include constituent cities without claiming all online sources are local", () => {
  for (const city of [
    "Brampton",
    "Mississauga",
    "Caledon",
    "Toronto",
    "Scarborough",
    "Markham",
    "Vaughan",
    "Oakville",
    "Ajax",
    "Oshawa",
  ])
    assert.equal(matchesDirectoryArea(city, "GTA"), true, city);
  assert.equal(matchesDirectoryArea("Caledon", "Peel"), true);
  assert.equal(matchesDirectoryArea("Vaughan", "York Region"), true);
  assert.equal(matchesDirectoryArea("Burlington", "Halton"), true);
  assert.equal(matchesDirectoryArea("Pickering", "Durham"), true);
  assert.equal(matchesDirectoryArea("Toronto", "Peel"), false);
  assert.equal(matchesDirectoryArea("Markham", "Peel"), false);
  assert.equal(matchesDirectoryArea("Online — worldwide", "GTA"), false);
  assert.equal(matchesDirectoryArea("Ontario", "GTA"), false);
  assert.equal(matchesDirectoryArea("Remote / online", "Online"), true);
  assert.equal(matchesDirectoryArea("Newmarket", "Ontario"), true);
});
