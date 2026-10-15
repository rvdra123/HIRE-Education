"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import Brand from "./Brand";
const links = [
  { id: "about", label: "About & opportunities" },
  { id: "certifications", label: "Certificates" },
  { id: "resume", label: "Resume & cover letter" },
  { id: "skills", label: "Career skills & resources" },
];
export default function SiteHeader({ onSearch }: { onSearch?: () => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("about");
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handle);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setActive(
              e.target.id === "opportunities"
                ? "about"
                : e.target.id === "resources"
                  ? "skills"
                  : e.target.id,
            );
        }),
      { rootMargin: "-15% 0px -65% 0px" },
    );
    [...links.map((x) => x.id), "opportunities", "resources"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handle);
    };
  }, []);
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className={active === item.id ? "active" : ""}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          {onSearch ? (
            <button
              className="icon-button"
              aria-label="Search all resources"
              onClick={onSearch}
            >
              <Search />
            </button>
          ) : (
            <Link
              href="/opportunities"
              className="icon-button"
              aria-label="Search opportunities"
              prefetch={false}
            >
              <Search />
            </Link>
          )}
          <Link
            className="btn btn-primary nav-cta"
            href="/opportunities"
            prefetch={false}
          >
            Find opportunities <ArrowUpRight />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="mobile-nav"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {links.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            className="btn btn-primary"
            href="/opportunities"
            prefetch={false}
          >
            Find opportunities <ArrowUpRight />
          </Link>
        </nav>
      )}
    </header>
  );
}
