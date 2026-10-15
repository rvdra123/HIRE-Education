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
