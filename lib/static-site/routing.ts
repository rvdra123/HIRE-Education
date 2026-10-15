const base = "https://static.hire.invalid";
export function staticHref(href: string) {
  if (href.startsWith("#/")) return href;
  if ((!href.startsWith("/") && !href.startsWith("#")) || href.startsWith("//"))
    return href;
  const url = new URL(href.startsWith("#") ? `/${href}` : href, base);
  if (url.hash)
    url.searchParams.set("section", decodeURIComponent(url.hash.slice(1)));
  return `#${url.pathname}${url.search}`;
}
export function readStaticLocation(hash: string) {
  const url = new URL(hash.startsWith("#/") ? hash.slice(1) : `/${hash}`, base);
  return {
    path: url.pathname.replace(/\/$/, "") || "/",
    section: url.searchParams.get("section") || url.hash.slice(1),
  };
}
