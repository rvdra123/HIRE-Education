// Convert a fully published local date/time without using the host timezone.
// Reject invalid, nonexistent, and ambiguous wall times rather than guess at DST.
export function torontoDateTime(day: string, time: string) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const d = /^(\w+) (\d{1,2}), (\d{4})$/.exec(day);
  const t = /^(\d{1,2}):(\d{2})(AM|PM)$/i.exec(time);
  if (!d || !t) return null;
  const month = months.indexOf(d[1]);
  const date = Number(d[2]),
    year = Number(d[3]),
    hour = Number(t[1]),
    minute = Number(t[2]);
  if (
    month < 0 ||
    hour < 1 ||
    hour > 12 ||
    minute > 59 ||
    date < 1 ||
    date > new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  )
    return null;
  const h = (hour % 12) + (t[3].toUpperCase() === "PM" ? 12 : 0);
  const wall = Date.UTC(year, month, date, h, minute);
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const matches = [4, 5]
    .map((offset) => new Date(wall + offset * 3600000))
    .filter((candidate) => {
      const parts = Object.fromEntries(
        format.formatToParts(candidate).map((p) => [p.type, p.value]),
      );
      return (
        Number(parts.year) === year &&
        Number(parts.month) === month + 1 &&
        Number(parts.day) === date &&
        Number(parts.hour) === h &&
        Number(parts.minute) === minute
      );
    });
  return matches.length === 1 ? matches[0].toISOString() : null;
}

export function torontoBoundary(year: number, month: number, day = 1) {
  const guess = new Date(Date.UTC(year, month, day, 5));
  const hour = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      hour: "numeric",
      hourCycle: "h23",
    }).format(guess),
  );
  return new Date(guess.getTime() - hour * 3600000).toISOString();
}
export function calendarRange(month: string, day?: string | null) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  if (day && /^\d{4}-\d{2}-\d{2}$/.test(day) && day.startsWith(month)) {
    const d = Number(day.slice(-2));
    if (d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate())
      return {
        from: torontoBoundary(y, m - 1, d),
        until: torontoBoundary(y, m - 1, d + 1),
      };
  }
  return { from: torontoBoundary(y, m - 1), until: torontoBoundary(y, m) };
}
