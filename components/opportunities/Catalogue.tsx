"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Opportunity } from "@/lib/opportunities/types";
import OpportunityDirectory from "./OpportunityDirectory";
import {
  readOptional,
  writeOptional,
  PRIVACY_EVENT,
} from "@/lib/privacy/storage";
import { displayDate, displayDateOnly, displayTime } from "@/lib/format";
type Result = {
  items: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
  lastSuccessfulSync: string | null;
};
const empty: Result = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 24,
  lastSuccessfulSync: null,
};
const types = [
  ["", "All types"],
  ["job", "Jobs"],
  ["volunteer", "Volunteering"],
  ["internship", "Internships"],
  ["summer-program", "Summer programs"],
  ["youth-program", "Youth programs"],
  ["career-program", "Career programs"],
  ["mentorship", "Mentorship"],
  ["leadership", "Leadership"],
  ["competition", "Competitions"],
];
const areas = [
  "Business",
  "Technology",
  "STEM",
  "Healthcare",
  "Government",
  "Recreation",
  "Retail",
  "Customer Service",
  "Education",
  "Arts & Media",
  "Community Service",
  "General employment",
];
export default function Catalogue({
  compact = false,
  events = false,
  month = "",
  day = "",
}: {
  compact?: boolean;
  events?: boolean;
  month?: string;
  day?: string;
}) {
  const [data, setData] = useState<Result>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [grade, setGrade] = useState("");
  const [category, setCategory] = useState("");
  const [commitment, setCommitment] = useState("");
  const [paid, setPaid] = useState("");
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState("");
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [countdown, setCountdown] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      setSaved(JSON.parse(readOptional("hire-catalogue-saved") || "[]"));
    } catch {
      setSaved([]);
    }
    const clear = () => {
      try {
        setSaved(JSON.parse(readOptional("hire-catalogue-saved") || "[]"));
      } catch {
        setSaved([]);
      }
    };
    window.addEventListener(PRIVACY_EVENT, clear);
    return () => window.removeEventListener(PRIVACY_EVENT, clear);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    setPage(1);
  }, [
    debounced,
    type,
    location,
    grade,
    category,
    commitment,
    paid,
    sort,
    view,
    month,
    day,
  ]);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    const query = new URLSearchParams({
      search: debounced,
      type,
      location,
      grade,
      category,
      commitment,
      paid,
      sort,
      view,
      page: String(page),
      pageSize: String(compact ? 4 : 24),
      month,
      day,
    });
    if (view === "saved") query.set("ids", saved.slice(0, 200).join(","));
    fetch(`${events ? "/api/events" : "/api/opportunities"}?${query}`, {
      signal: abort.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const value = await r.json();
        if (!Array.isArray(value.items)) throw new Error();
        setData(value);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(
            "Live listings are unavailable right now. The official sources below are still available.",
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [
    debounced,
    type,
    location,
    grade,
    category,
    commitment,
    paid,
    sort,
    view,
    page,
    compact,
    events,
    refresh,
    saved,
    month,
    day,
  ]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") setRefresh((x) => x + 1);
    }, 300000);
    return () => clearInterval(timer);
  }, []);
  const clear = () => {
    setSearch("");
    setType("");
    setLocation("");
    setGrade("");
    setCategory("");
    setCommitment("");
    setPaid("");
    setSort("recommended");
    setView("");
    setPage(1);
  };
  function toggle(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    const persisted = writeOptional(
      "hire-catalogue-saved",
      JSON.stringify(next),
    );
    setCountdown(
      persisted
        ? "Saved opportunities updated."
        : "Saved for this visit. Allow optional storage in Privacy settings to keep your bookmarks.",
    );
  }
  const active =
    search ||
    type ||
    location !== "" ||
    grade ||
    category ||
    commitment ||
    paid ||
    view;
  return (
    <div className="catalogue">
      {!compact && !events && (
        <>
          <div
            className="catalogue-tabs"
            role="group"
            aria-label="Opportunity groups"
          >
            {[
              ["", "Recommended"],
              ["new", "New this week"],
              ["closing", "Closing soon"],
              ["saved", `Saved (${saved.length})`],
            ].map(([id, label]) => (
              <button
                key={id}
                className={view === id ? "selected" : ""}
                aria-pressed={view === id}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="catalogue-search">
            <label>
              <Search size={18} />
              <span className="sr-only">
                Search jobs, volunteering, internships
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, volunteering, internships..."
              />
            </label>
            <button
              className="btn btn-outline"
              onClick={() => setMore(!more)}
              aria-expanded={more}
              aria-controls="catalogue-filters"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>
          <div className="catalogue-basic-filters">
            <label>
              Opportunity type
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {types.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {[
                  ["nearby", "Brampton & nearby"],
                  ["", "All locations"],
                  ...[
                    "Brampton",
                    "Peel Region",
                    "Mississauga",
                    "Caledon",
                    "GTA",
                    "Ontario",
                    "Remote",
                  ].map((x) => [x, x]),
                ].map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="newest">Newest</option>
                <option value="deadline">Deadline soon</option>
                <option value="local">Brampton relevance</option>
              </select>
            </label>
          </div>
          {more && (
            <div className="catalogue-extra-filters" id="catalogue-filters">
              <label>
                Grade
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="">All grades</option>
                  {[9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Career area
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All career areas</option>
                  {areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label>
                Commitment
                <select
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                >
                  <option value="">Any commitment</option>
                  {[
                    "one-time",
                    "short-term",
                    "ongoing",
                    "summer",
                    "part-time",
                  ].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label>
                Compensation
                <select value={paid} onChange={(e) => setPaid(e.target.value)}>
                  <option value="">Any compensation</option>
                  {["paid", "volunteer", "stipend", "unspecified"].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <p>
                Listings with unstated grade requirements remain visible.
                Confirm eligibility before applying.
              </p>
            </div>
          )}
        </>
      )}
      <div className="catalogue-status">
        <p>
          {loading
            ? "Checking the catalogue..."
            : data.total
              ? `Showing ${(data.page - 1) * data.pageSize + 1}–${Math.min(data.page * data.pageSize, data.total)} of ${data.total} ${events ? "events" : "opportunities"}`
              : `${events ? "Upcoming events" : "Verified opportunities"}`}
        </p>
        {active && (
          <button onClick={clear}>
            Clear filters <X size={13} />
          </button>
        )}
        <span>
          <RefreshCw size={12} />
          {data.lastSuccessfulSync
            ? `Last refresh: ${displayDate(data.lastSuccessfulSync)}`
            : "No successful source refresh yet"}
        </span>
      </div>
      {error && (
        <div className="notice-box" role="status">
          {error}
          <button onClick={() => setRefresh((x) => x + 1)}>Try again</button>
        </div>
      )}
      <div ref={resultsRef} aria-live="polite" aria-busy={loading}>
        {loading && !data.items.length ? (
          <div className="listing-grid">
            {[0, 1, 2].map((i) => (
              <div className="listing-skeleton" key={i}>
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : data.items.length ? (
          <div className={`listing-grid ${compact ? "featured-listings" : ""}`}>
            {data.items.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                saved={saved.includes(item.id)}
                onSave={() => toggle(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <CalendarDays size={30} />
            <h3>
              {active
                ? "No opportunities match these filters."
                : events
                  ? "No upcoming events have been verified yet."
                  : "No current listings have been verified yet."}
            </h3>
            <p>
              {active
                ? "Try another location or clear the filters."
                : "We only publish listings with confirmed source information and application status. You can browse the official directories below in the meantime."}
            </p>
            {active && (
              <button className="btn btn-outline" onClick={clear}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
      {!compact && data.total > data.pageSize && (
        <nav className="pagination" aria-label="Catalogue pages">
          <button
            className="btn btn-outline"
            disabled={data.page <= 1}
            onClick={() => {
              setPage(page - 1);
              resultsRef.current?.scrollIntoView({ block: "start" });
            }}
          >
            <ChevronLeft />
            Previous
          </button>
          <span>
            Page {data.page} of {Math.ceil(data.total / data.pageSize)}
          </span>
          <button
            className="btn btn-outline"
            disabled={data.page * data.pageSize >= data.total}
            onClick={() => {
              setPage(page + 1);
              resultsRef.current?.scrollIntoView({ block: "start" });
            }}
          >
            Next
            <ChevronRight />
          </button>
        </nav>
      )}
      {compact && (
        <a
          href={events ? "/opportunities#events" : "/opportunities"}
          className="btn btn-outline catalogue-view-all"
        >
          {events ? "View events calendar" : "View all opportunities"}
          <ArrowRight size={16} />
        </a>
      )}
      <p className="catalogue-notice">
        Opportunity availability, deadlines, eligibility, and requirements may
        change. Always confirm details with the organization before applying.
      </p>
      <OpportunityDirectory compact={compact} events={events} />
      <p className="sr-only" role="status">
        {countdown}
      </p>
    </div>
  );
}
export function ListingCard({
  item,
  saved,
  onSave,
}: {
  item: Opportunity;
  saved: boolean;
  onSave: () => void;
}) {
  const isEvent = item.opportunityType === "event";
  return (
    <article className="listing-card">
      <div className="listing-card-top">
        <span
          className={`status-pill ${item.status === "expiring-soon" ? "status-soon" : ""}`}
        >
          {item.status === "expiring-soon"
            ? "Closing soon"
            : isEvent
              ? "Registration listed"
              : "Applications open"}
        </span>
        <button
          className="icon-button"
          aria-label={`${saved ? "Unsave" : "Save"} ${item.title}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="listing-organization">{item.organization}</p>
      <h3>
        <a href={`/opportunities/${item.id}`}>{item.title}</a>
      </h3>
      <p className="listing-description">
        {item.description.slice(0, 190)}
        {item.description.length > 190 ? "…" : ""}
      </p>
      <div className="listing-meta">
        <span>
          <MapPin size={14} />
          {item.remote ? "Remote" : item.location}
        </span>
        <span>
          {item.paid === "unspecified" ? "Compensation not listed" : item.paid}
        </span>
        {item.cost && <span>Cost: {item.cost}</span>}
        <span>
          {item.eligibleGrades.length
            ? `Grades ${item.eligibleGrades.join(", ")}`
            : item.minimumAge !== null
              ? `Ages ${item.minimumAge}+`
              : "Check eligibility"}
        </span>
        {isEvent && (
          <span>
            <CalendarDays size={14} />
            {displayTime(item.startDate)}
          </span>
        )}
      </div>
      <div className="listing-tags">
        {item.skills.slice(0, 3).map((s) => (
          <span className="badge" key={s}>
            {s}
          </span>
        ))}
      </div>
      <div className="listing-footer">
        <small>
          Last checked: {displayDate(item.lastVerifiedAt)}
          {(item.applicationDeadline || item.applicationClosingDate) && (
            <>
              <br />
              Deadline:{" "}
              {item.applicationDeadline
                ? displayDate(item.applicationDeadline)
                : displayDateOnly(item.applicationClosingDate!)}
            </>
          )}
        </small>
        <a href={`/opportunities/${item.id}`}>
          View details <ArrowUpRight size={15} />
        </a>
      </div>
    </article>
  );
}
