"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import { opportunityDirectory } from "@/lib/opportunities/directory";

export default function OpportunityDirectory({
  compact = false,
  events = false,
}: {
  compact?: boolean;
  events?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");
  const [area, setArea] = useState("All areas");
  const [visible, setVisible] = useState(compact ? 6 : 12);
  useEffect(() => setVisible(compact ? 6 : 12), [search, group, area, compact]);
  const entries = useMemo(
    () =>
      opportunityDirectory.filter(
        (entry) =>
          (!events ||
            entry.group === "Events & learning" ||
            entry.group === "Programs & competitions") &&
          (group === "All" || entry.group === group) &&
          (area === "All areas" || entry.area.includes(area)) &&
          `${entry.name} ${entry.description} ${entry.area} ${entry.group}`
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
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
            Search official career pages, volunteering portals, and student
            programs. Current vacancies, intake dates, and age requirements must
            be checked on each organization’s website.
          </p>
        </div>
        <span className="directory-label">Source directory</span>
      </div>
      <div className="directory-search-row">
        <label className="catalogue-search">
          <Search size={18} />
          <input
            aria-label="Search employers and programs"
            placeholder="Search an employer, interest, or program"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {!events && (
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
              <option key={g}>{g}</option>
            ))}
          </select>
        )}
        <select
          aria-label="Directory area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          {[
            "All areas",
            "Brampton",
            "Peel",
            "Mississauga",
            "GTA",
            "Ontario",
            "Online",
          ].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      <p className="directory-count" role="status">
        {entries.length} sources · showing {Math.min(entries.length, visible)}
      </p>
      <div className="directory-grid">
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
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearch("");
              setGroup("All");
              setArea("All areas");
            }}
          >
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
