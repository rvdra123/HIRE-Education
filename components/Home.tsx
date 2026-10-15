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
    title: "AI resume reviewer",
    description: "Upload a resume and target posting for feedback.",
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
export default function Home() {
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
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
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
                <span className="blue-text">Brampton students</span>
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
              HIRE Education helps Brampton high school students prepare for
              work and find ways to gain experience. We bring opportunities,
              learning resources, and application guidance together so it’s
              easier to work out your next step.
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
                  Explore Brampton and nearby communities. Each published
                  listing shows its application status and when it was last
                  checked.
                </p>
              </div>
              <Link
                className="text-link"
                href="/opportunities#events"
                prefetch={false}
              >
                Youth events calendar
                <ArrowUpRight />
              </Link>
            </div>
            <Catalogue compact />
          </div>
        </section>
        <Discovery />
        <ApplicationTools />
        <CareerResources />
      </main>
      {searchOpen && <GlobalSearch onClose={close} />}
    </>
  );
}
function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<Entry[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const entries: Entry[] = [
      ...guides,
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
      ? entries
          .filter((e) =>
            terms.every((t) =>
              `${e.title} ${e.description}`.toLowerCase().includes(t),
            ),
          )
          .slice(0, 30)
      : guides;
  }, [query, live]);
  useEffect(() => {
    if (query.trim().length < 2) {
      setLive([]);
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
          .then((d) =>
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
            ),
          )
          .catch(() => {}),
      250,
    );
    return () => {
      clearTimeout(t);
      abort.abort();
    };
  }, [query]);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          "a[href],button,input",
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
        <div className="search-results" aria-live="polite">
          {results.length ? (
            results.map((item, i) => (
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
        </div>
      </div>
    </div>
  );
}
