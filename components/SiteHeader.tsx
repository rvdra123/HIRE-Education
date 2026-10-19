"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [active, setActive] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen((wasOpen) => {
          if (wasOpen) toggle.current?.focus();
          return false;
        });
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest(".site-header")
      )
        setOpen(false);
    };
    window.addEventListener("keydown", handle);
    document.addEventListener("pointerdown", outside);
    if (
      window.location.pathname.startsWith("/opportunities") ||
      window.location.hash.startsWith("#/opportunities")
    )
      setActive("about");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setActive(
              e.target.id === "opportunities"
                ? "about"
                : [
                      "resources",
                      "interview-practice",
                      "youtube-resources",
                      "faq",
                    ].includes(e.target.id)
                  ? "skills"
                  : e.target.id,
            );
        }),
      { rootMargin: "-15% 0px -65% 0px" },
    );
    [
      ...links.map((x) => x.id),
      "opportunities",
      "resources",
      "interview-practice",
      "youtube-resources",
      "faq",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handle);
      document.removeEventListener("pointerdown", outside);
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
              onClick={() => {
                setOpen(false);
                onSearch();
              }}
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
            ref={toggle}
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
            href="/#resources"
            prefetch={false}
            onClick={() => setOpen(false)}
          >
            Resource library
          </Link>
          <Link
            href="/#youtube-resources"
            prefetch={false}
            onClick={() => setOpen(false)}
          >
            YouTube channels
          </Link>
          <Link
            className="btn btn-primary"
            href="/opportunities"
            prefetch={false}
            onClick={() => setOpen(false)}
          >
            Find opportunities <ArrowUpRight />
          </Link>
        </nav>
      )}
    </header>
  );
}
