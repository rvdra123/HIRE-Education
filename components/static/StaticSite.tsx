"use client";
import { useEffect, useState } from "react";
import Home from "../Home";
import SiteHeader from "../SiteHeader";
import OpportunityDirectory from "../opportunities/OpportunityDirectory";
import Reviewer from "../resume/Reviewer";
import PrivacyPage from "@/app/privacy/page";
import PrivacyControls from "../privacy/PrivacyControls";
import MotionController from "../MotionController";
import { readStaticLocation, staticHref } from "@/lib/static-site/routing";

export default function StaticSite({ preview = false }: { preview?: boolean }) {
  const [location, setLocation] = useState({ path: "/", section: "" });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const next = readStaticLocation(window.location.hash);
      setLocation(next);
      document.title = `${next.path === "/resume-reviewer" ? "Free Student Resume Checker" : next.path === "/privacy" ? "Privacy Policy" : next.path === "/opportunities" ? "Peel and GTA Student Opportunities" : "Career Support for Peel and GTA Students"} | HIRE Education`;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const target = next.section
            ? document.getElementById(next.section)
            : null;
          if (target) {
            target.scrollIntoView();
            if (!target.hasAttribute("tabindex"))
              target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
          } else window.scrollTo(0, 0);
        });
      });
    };
    const rewriteLinks = () => {
      document
        .querySelectorAll<HTMLAnchorElement>("a[href]")
        .forEach((anchor) => {
          const href = anchor.getAttribute("href") || "";
          const resolved = staticHref(href);
          if (resolved !== href) anchor.setAttribute("href", resolved);
        });
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return;
      const href = staticHref(link.getAttribute("href") || "");
      if (!href.startsWith("#/")) return;
      event.preventDefault();
      if (window.location.hash === href) update();
      else window.location.hash = href;
    };
    update();
    rewriteLinks();
    const observer = new MutationObserver(rewriteLinks);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });
    window.addEventListener("hashchange", update);
    document.addEventListener("click", click);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", update);
      document.removeEventListener("click", click);
    };
  }, []);
  return (
    <>
      {preview && (
        <div className="offline-preview-note">
          Offline edition: the resume checker, guides, and practice tools work
          on this device. Check live openings and event dates on the official
          websites.
        </div>
      )}
      {location.path === "/privacy" ? (
        <PrivacyPage />
      ) : location.path === "/resume-reviewer" ? (
        <>
          <SiteHeader />
          <main className="container feature-page">
            <div className="page-heading">
              <h1>Free resume checker for high school students</h1>
              <p>
                Compare your resume with a job or volunteer posting. Get
                checklist-based feedback on structure, keywords, and bullet
                points, processed entirely in your browser.
              </p>
            </div>
            <Reviewer />
          </main>
        </>
      ) : location.path === "/opportunities" ? (
        <>
          <SiteHeader />
          <main className="container feature-page">
            <div className="page-heading">
              <h1>Student opportunities in Peel and the GTA</h1>
              <p>
                Find official career pages, volunteering portals, and student
                programs. Check application status, eligibility, and deadlines
                with each organization.
              </p>
            </div>
            <OpportunityDirectory />
            <section id="events" className="events-section">
              <h2>Brampton youth workshops and events</h2>
              <p className="section-description">
                Browse official library, city, and youth program websites for
                current dates, costs, locations, and registration. This edition
                does not run a live event feed.
              </p>
              <OpportunityDirectory events />
            </section>
          </main>
        </>
      ) : (
        <Home staticMode />
      )}
      <MotionController />
      <PrivacyControls />
    </>
  );
}
