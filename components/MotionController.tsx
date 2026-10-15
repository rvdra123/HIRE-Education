"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function MotionController() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty(
        "--page-progress",
        String(height > 0 ? window.scrollY / height : 0),
      );
      setShowTop(window.scrollY > 750);
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    update();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-motion", "visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.03, rootMargin: "0px 0px 45px 0px" },
    );
    const scan = () => {
      document
        .querySelectorAll(
          "main > section > .container, main.feature-page > .page-heading",
        )
        .forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          if (
            reduced.matches ||
            element.getBoundingClientRect().top < window.innerHeight
          )
            return;
          element.setAttribute("data-motion", "pending");
          observer.observe(element);
        });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    const motionChanged = () => {
      if (reduced.matches) {
        document
          .querySelectorAll('[data-motion="pending"]')
          .forEach((element) => element.setAttribute("data-motion", "visible"));
        observer.disconnect();
      }
    };
    reduced.addEventListener("change", motionChanged);
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      reduced.removeEventListener("change", motionChanged);
    };
  }, []);
  return (
    <>
      <div className="reading-progress" aria-hidden="true" />
      {showTop && (
        <button
          className="back-to-top"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            })
          }
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
