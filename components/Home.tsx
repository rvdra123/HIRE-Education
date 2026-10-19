"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  GraduationCap,
  Search,
} from "lucide-react";
import SiteHeader from "./SiteHeader";
import Discovery from "./Discovery";
import ApplicationTools from "./ApplicationTools";
import CareerResources, { resources, skills } from "./CareerResources";
import Catalogue from "./opportunities/Catalogue";
import OpportunityDirectory from "./opportunities/OpportunityDirectory";
import { certifications } from "@/lib/discovery-data";
import { opportunityDirectory } from "@/lib/opportunities/directory";
type Entry = {
  title: string;
  description: string;
  url: string;
  type: string;
  applicationTab?: string;
};
const guides: Entry[] = [
  {
    title: "High school resume guide",
    description:
      "Resume structure, bullet examples, and a fictional student resume.",
    url: "#resume",
    type: "Guide",
    applicationTab: "resume",
  },
  {
    title: "Cover letter guide",
    description: "Explain why you want the role and show relevant experience.",
    url: "#resume",
    type: "Guide",
    applicationTab: "cover",
  },
  {
    title: "Application checklist",
    description: "Check your documents and prepare before applying.",
    url: "#resume",
    type: "Checklist",
    applicationTab: "checklist",
  },
  {
    title: "Free resume checker",
    description:
      "Browser-only checks for structure, posting keywords, and bullet points.",
    url: "/resume-reviewer",
    type: "Tool",
  },
  {
    title: "Brampton youth events calendar",
    description: "Verified workshops, hiring events, and career sessions.",
    url: "/opportunities#events",
    type: "Events",
  },
  {
    title: "First-interview practice",
    description:
      "Practise questions for retail, food service, recreation, and volunteering.",
    url: "#interview-practice",
    type: "Practice",
  },
];
export default function Home({ staticMode = false }: { staticMode?: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const close = useCallback(() => {
    setSearchOpen(false);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>('[aria-label="Search all resources"]')
        ?.focus({ preventScroll: true }),
    );
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchOpen) close();
        else setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen, close]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader onSearch={() => setSearchOpen(true)} />
      <main id="main-content">
        <section className="hero" id="home">
          <div className="container hero-layout">
            <div className="hero-content">
              <h1>
                Career support for{" "}
                <span className="blue-text">Peel and GTA students</span>
              </h1>
              <p className="hero-copy">
                Find local opportunities, learn useful skills, and put together
                your first resume. Made for students in Grades 9–12.
              </p>
              <div className="hero-buttons">
                <Link
                  className="btn btn-primary"
                  href="/opportunities"
                  prefetch={false}
                >
                  Browse opportunities
                  <ArrowUpRight />
                </Link>
                <a className="btn btn-outline" href="#resume">
                  Get resume help
                  <FileText />
                </a>
              </div>
              <p className="student-note">
                <GraduationCap size={15} />
                School projects, clubs, sports, and volunteering all count as
                experience.
              </p>
            </div>
            <aside className="career-start-panel">
              <h2>Choose what you need help with</h2>
              {[
                {
                  icon: BriefcaseBusiness,
                  title: "Find work or volunteering",
                  description: "Browse the catalogue and check eligibility.",
                  url: "/opportunities",
                },
                {
                  icon: Award,
                  title: "Learn a new skill",
                  description: "Explore free courses and credentials.",
                  url: "#certifications",
                },
                {
                  icon: FileText,
                  title: "Prepare an application",
                  description: "Use the guides or get a resume review.",
                  url: "#resume",
                },
              ].map(({ icon: Icon, title, description, url }) => (
                <a href={url} className="start-link" key={title}>
                  <span className="start-icon">
                    <Icon size={20} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </a>
              ))}
            </aside>
          </div>
        </section>
        <section className="about-section" id="about">
          <div className="container about-concise">
            <div>
              <h2 className="section-title">About HIRE Education</h2>
            </div>
            <p>
              HIRE Education helps high school students in Brampton, Peel and
              the GTA prepare for work and find ways to gain experience. We
              bring opportunities, learning resources, and application guidance
              together so it’s easier to work out your next step.
            </p>
          </div>
        </section>
        <section className="home-catalogue" id="opportunities">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <h2 className="section-title">
                  Jobs, volunteering, and student programs
                </h2>
                <p className="section-description">
                  {staticMode
                    ? "Explore official employer, volunteering, and student program websites. Check current openings, dates, and eligibility on each source."
                    : "Explore Brampton, Peel and the Greater Toronto Area, plus online programs. Each published listing shows its application status and when it was last checked."}
                </p>
              </div>
              <Link
                className="text-link"
                href="/opportunities#events"
                prefetch={false}
              >
                {staticMode
                  ? "Youth workshops and events"
                  : "Youth events calendar"}
                <ArrowUpRight />
              </Link>
            </div>
            {staticMode ? (
              <OpportunityDirectory compact />
            ) : (
              <Catalogue compact />
            )}
          </div>
        </section>
        <Discovery />
        <ApplicationTools />
        <CareerResources />
      </main>
      {searchOpen && <GlobalSearch onClose={close} staticMode={staticMode} />}
    </>
  );
}
function GlobalSearch({
  onClose,
  staticMode = false,
}: {
  onClose: () => void;
  staticMode?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<Entry[]>([]);
  const [liveTotal, setLiveTotal] = useState(0);
  const [entryType, setEntryType] = useState("");
  const [visible, setVisible] = useState(20);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const entries: Entry[] = [
      ...guides.map((guide) =>
        staticMode && guide.type === "Events"
          ? {
              ...guide,
              title: "Brampton workshops and event sources",
              description:
                "Official library, youth program, and event websites. Check dates and registration with the organizer.",
            }
          : guide,
      ),
      ...skills.map((s) => ({
        title: s.title,
        description: `${s.description} ${s.means}`,
        url: "#skills",
        type: "Skill",
      })),
      ...resources.map((r) => ({ ...r, type: "Resource" })),
      ...certifications.map((c) => ({
        title: c.title,
        description: `${c.organization}: ${c.description}`,
        url: c.url,
        type: "Course",
      })),
      ...opportunityDirectory.map((entry) => ({
        title: entry.name,
        description: `${entry.area}: ${entry.description}`,
        url: entry.url,
        type: "Employer or program source",
      })),
      ...live,
    ];
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return terms.length
      ? entries.filter((e) =>
          terms.every((t) =>
            `${e.title} ${e.description}`.toLowerCase().includes(t),
          ),
        )
      : entries.filter((entry) =>
          ["Guide", "Tool", "Practice", "Events", "Checklist"].includes(
            entry.type,
          ),
        );
  }, [query, live, staticMode]);
  const filteredResults = results.filter(
    (entry) => !entryType || entry.type === entryType,
  );
  useEffect(() => setVisible(20), [query, entryType]);
  useEffect(() => {
    if (staticMode || query.trim().length < 2) {
      setLive([]);
      setLiveTotal(0);
      return;
    }
    const abort = new AbortController();
    const t = setTimeout(
      () =>
        fetch(
          `/api/opportunities?location=&search=${encodeURIComponent(query)}&pageSize=6`,
          { signal: abort.signal },
        )
          .then((r) => r.json())
          .then((d) => {
            setLiveTotal(typeof d.total === "number" ? d.total : 0);
            setLive(
              Array.isArray(d.items)
                ? d.items.map(
                    (i: {
                      id: string;
                      title: string;
                      description: string;
                    }) => ({
                      title: i.title,
                      description: i.description,
                      url: `/opportunities/${i.id}`,
                      type: "Opportunity",
                    }),
                  )
                : [],
            );
          })
          .catch(() => {}),
      250,
    );
    return () => {
      clearTimeout(t);
      abort.abort();
    };
  }, [query, staticMode]);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          "a[href],button,input,select",
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);
  return (
    <div
      className="search-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search HIRE Education"
      >
        <div className="search-input-row">
          <Search />
          <label className="sr-only" htmlFor="global-search">
            Search all resources
          </label>
          <input
            ref={input}
            id="global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities, courses, and guides"
          />
          <button className="search-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="global-search-tools">
          <label>
            Result type
            <select
              value={entryType}
              onChange={(event) => setEntryType(event.target.value)}
            >
              <option value="">All results</option>
              {[
                ...new Set(
                  [entryType, ...results.map((entry) => entry.type)].filter(
                    Boolean,
                  ),
                ),
              ]
                .sort()
                .map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
            </select>
          </label>
          <span role="status">
            {filteredResults.length} results · showing{" "}
            {Math.min(visible, filteredResults.length)}
          </span>
        </div>
        {!staticMode &&
          liveTotal > 0 &&
          (!entryType || entryType === "Opportunity") && (
            <a
              className="global-search-all"
              href={`/opportunities?search=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
            >
              View all {liveTotal} matching live opportunities ↗
            </a>
          )}
        <div className="search-results" aria-live="polite">
          {filteredResults.length ? (
            filteredResults.slice(0, visible).map((item, i) => (
              <a
                className="search-result"
                key={`${item.title}-${i}`}
                href={item.url}
                target={item.url.startsWith("https") ? "_blank" : undefined}
                rel={
                  item.url.startsWith("https")
                    ? "noopener noreferrer"
                    : undefined
                }
                onClick={() => {
                  if (item.applicationTab)
                    document
                      .getElementById(`application-tab-${item.applicationTab}`)
                      ?.click();
                  onClose();
                }}
              >
                <FileText size={17} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <small>{item.type}</small>
                <ChevronRight size={15} />
              </a>
            ))
          ) : (
            <p className="search-hint">
              No matches. Try “resume”, “volunteer”, or “communication”.
            </p>
          )}
          {visible < filteredResults.length && (
            <button
              className="btn btn-outline global-search-more"
              onClick={() => setVisible((value) => value + 20)}
            >
              Show {Math.min(20, filteredResults.length - visible)} more results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
