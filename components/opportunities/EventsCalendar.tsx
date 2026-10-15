"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Catalogue from "./Catalogue";
const nowMonth = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .split("-")
    .slice(0, 2)
    .join("-");
export default function EventsCalendar() {
  const [month, setMonth] = useState(nowMonth);
  const [day, setDay] = useState("");
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const label = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
  function move(change: number) {
    const d = new Date(Date.UTC(y, m - 1 + change, 1));
    setMonth(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    );
    setDay("");
  }
  return (
    <>
      <div className="event-month-control">
        <button
          className="icon-button"
          aria-label="Previous month"
          onClick={() => move(-1)}
        >
          <ChevronLeft />
        </button>
        <label>
          Event month
          <input
            type="month"
            value={month}
            onChange={(e) => {
              if (e.target.value) {
                setMonth(e.target.value);
                setDay("");
              }
            }}
          />
        </label>
        <button
          className="icon-button"
          aria-label="Next month"
          onClick={() => move(1)}
        >
          <ChevronRight />
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setDay("")}
          disabled={!day}
        >
          All dates this month
        </button>
      </div>
      <div
        className="event-calendar"
        role="group"
        aria-label={`${label} event dates`}
      >
        <div className="calendar-weekdays" aria-hidden="true">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="calendar-days">
          {Array.from({ length: offset }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const value = `${month}-${String(i + 1).padStart(2, "0")}`;
            return (
              <button
                key={value}
                aria-pressed={day === value}
                aria-label={`Show events on ${label} ${i + 1}`}
                onClick={() => setDay(day === value ? "" : value)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
      <p className="small-note">
        Select a date to filter the agenda. Event times use the Toronto time
        zone.
      </p>
      <Catalogue events month={month} day={day} />
    </>
  );
}
