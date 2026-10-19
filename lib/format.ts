export function displayDate(value: string | null, includeYear = false) {
  return value
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Toronto",
        month: "short",
        day: "numeric",
        ...(includeYear ? { year: "numeric" as const } : {}),
      }).format(new Date(value))
    : "Not verified";
}
export function displayTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Toronto",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(value))
    : "Confirm with organizer";
}
export function displayDateOnly(value: string, includeYear = false) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" as const } : {}),
  }).format(new Date(`${value}T00:00:00Z`));
}
