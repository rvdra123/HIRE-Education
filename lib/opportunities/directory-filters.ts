const peel = /\b(?:brampton|mississauga|caledon|peel)\b/i;
const york =
  /\b(?:york region|vaughan|markham|richmond hill|newmarket|aurora|east gwillimbury|georgina|king township|stouffville)\b/i;
const halton = /\b(?:halton|oakville|burlington|milton)\b/i;
const durham =
  /\b(?:durham|ajax|pickering|whitby|oshawa|clarington|scugog|uxbridge|brock township)\b/i;
const toronto = /\b(?:toronto|scarborough|etobicoke|north york|east york)\b/i;

export const directoryAreas = [
  "All areas",
  "Brampton",
  "Mississauga",
  "Caledon",
  "Peel",
  "Toronto",
  "York Region",
  "Halton",
  "Durham",
  "GTA",
  "Ontario",
  "Canada",
  "Online",
];

export function matchesDirectoryArea(location: string, selected: string) {
  if (selected === "All areas") return true;
  const gta =
    /\bgta\b|greater toronto area/i.test(location) ||
    [peel, york, halton, durham, toronto].some((region) =>
      region.test(location),
    );
  if (selected === "GTA") return gta;
  if (selected === "Peel") return peel.test(location);
  if (selected === "York Region") return york.test(location);
  if (selected === "Halton") return halton.test(location);
  if (selected === "Durham") return durham.test(location);
  if (selected === "Toronto") return toronto.test(location);
  if (selected === "Ontario") return gta || /\bontario\b/i.test(location);
  if (selected === "Canada")
    return gta || /\b(?:ontario|canada|nationwide)\b/i.test(location);
  if (selected === "Online") return /\b(?:online|remote)\b/i.test(location);
  return location.toLowerCase().includes(selected.toLowerCase());
}
