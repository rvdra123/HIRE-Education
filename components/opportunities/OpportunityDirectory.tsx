"use client";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react";
import { opportunityDirectory } from "@/lib/opportunities/directory";
import {
  directoryAreas,
  matchesDirectoryArea,
} from "@/lib/opportunities/directory-filters";

export default function OpportunityDirectory({
  compact = false,
  events = false,
}: {
  compact?: boolean;
  events?: boolean;
}) {
  const [search, setSearch] = useState("");
  const searchId = useId();
  const [group, setGroup] = useState("All");
  const [area, setArea] = useState("All areas");
  const [visible, setVisible] = useState(compact ? 6 : 12);
  const active = !!search || group !== "All" || area !== "All areas";
  const clear = () => {
    setSearch("");
    setGroup("All");
    setArea("All areas");
    document.getElementById(searchId)?.focus({ preventScroll: true });
  };
  useEffect(() => setVisible(compact ? 6 : 12), [search, group, area, compact]);
  const entries = useMemo(
    () =>
      opportunityDirectory
        .filter(
          (entry) =>
            (!events ||
              entry.group === "Events & learning" ||
              entry.group === "Programs & competitions") &&
            (group === "All" || entry.group === group) &&
            matchesDirectoryArea(entry.area, area) &&
            `${entry.name} ${entry.description} ${entry.area} ${entry.group}`
              .toLowerCase()
              .includes(search.toLowerCase().trim()),
        )
        .sort(
          (a, b) =>
            Number(b.reviewStatus === "verified") -
            Number(a.reviewStatus === "verified"),
        ),
    [search, group, area, events],
  );
  return (
    <section
      className="employer-directory"
      id={events ? "event-sources" : "employer-directory"}
      aria-label={
        events
          ? "Event and program source directory"
          : "Employer and program directory"
      }
    >
      <div className="directory-heading">
        <div>
          <h3>
            {events
              ? "Find more local events and programs"
              : `Explore ${opportunityDirectory.length} employers and programs`}
          </h3>
          <p>
            Find career pages, volunteer portals, and student programs. Check
            openings, dates, and age requirements with each organization.
          </p>
        </div>
        <span className="directory-label">Official websites</span>
      </div>
      <div className="directory-search-row">
        <div className="directory-search-field">
          <label htmlFor={searchId} className="directory-field-label">
            Search
          </label>
          <span className="directory-input-wrap">
            <Search size={18} aria-hidden="true" />
            <input
              id={searchId}
              aria-label="Search employers and programs"
              placeholder="Employer, interest, or program"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="directory-clear-search"
                aria-label="Clear directory search"
                onClick={() => {
                  setSearch("");
                  document
                    .getElementById(searchId)
                    ?.focus({ preventScroll: true });
                }}
              >
                <X size={16} />
              </button>
            )}
          </span>
        </div>
        {!events && (
          <label className="directory-filter-field">
            <span className="directory-field-label">Category</span>
            <select
              aria-label="Directory category"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {[
                "All",
                "Jobs",
                "Volunteering",
                "Programs & competitions",
                "Events & learning",
              ].map((g) => (
                <option key={g} value={g}>
                  {g === "All" ? "All categories" : g}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="directory-filter-field">
          <span className="directory-field-label">Location</span>
          <select
            aria-label="Directory area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            {directoryAreas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="directory-results-bar">
        <p className="directory-count" role="status">
          {entries.length} {entries.length === 1 ? "website" : "websites"} ·
          showing {Math.min(entries.length, visible)}
        </p>
        {active && (
          <button className="directory-reset" onClick={clear}>
            Clear filters <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="directory-grid" data-stagger>
        {entries.slice(0, visible).map((entry, index) => (
          <article
            className="directory-card"
            key={entry.id}
            style={{ animationDelay: `${Math.min(index, 5) * 35}ms` }}
          >
            <div className="directory-card-meta">
              <span>{entry.group}</span>
              <span>{entry.area}</span>
            </div>
            <h4>{entry.name}</h4>
            <p>{entry.description}</p>
            <small className="directory-review-note">
              {entry.reviewStatus === "verified"
                ? `Website checked ${entry.reviewedOn}`
                : "Check current website details"}
            </small>
            <a href={entry.url} target="_blank" rel="noopener noreferrer">
              Visit official website <ArrowUpRight size={16} />
            </a>
          </article>
        ))}
      </div>
      {!entries.length && (
        <div className="catalogue-empty">
          <h4>No sources match your search</h4>
          <p>Try a broader interest or another area.</p>
          <button className="btn btn-outline" onClick={clear}>
            Clear directory filters
          </button>
        </div>
      )}
      {visible < entries.length && (
        <div className="directory-more">
          {compact ? (
            <Link
              className="btn btn-outline"
              href="/opportunities#employer-directory"
            >
              Browse the full employer and program directory{" "}
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <button
              className="btn btn-outline"
              onClick={() => setVisible(visible + 12)}
            >
              Show {Math.min(12, entries.length - visible)} more sources{" "}
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}
      <p className="small-note">
        Directory entries are not verified open positions and are counted
        separately from live listings. Ask your school before counting any
        activity toward Ontario community involvement hours.
      </p>
    </section>
  );
}
