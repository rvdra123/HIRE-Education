"use client";
import { useMemo, useState } from "react";
import { ArrowRight, Award, ChevronDown, Search } from "lucide-react";
import { certifications, type Certification } from "@/lib/discovery-data";
import styles from "./discovery.module.css";
export function CertificationCard({
  certification: c,
}: {
  certification: Certification;
}) {
  return (
    <article className={styles.certificationCard}>
      <div className={styles.cardTop}>
        <div
          className={`${styles.orgLogo} ${styles[c.color]}`}
          aria-hidden="true"
        >
          {c.logo}
        </div>
        <span className={styles.freeBadge}>Free learning</span>
      </div>
      <p className={styles.organization}>{c.organization}</p>
      <h3>{c.title}</h3>
      <p className={styles.cardDescription}>{c.description}</p>
      <div className={styles.learningMeta}>
        <span>{c.difficulty}</span>
        <span>{c.format}</span>
      </div>
      <div className={styles.credential}>
        <Award size={17} />
        <div>
          <span>{c.credential}</span>
          <small>{c.cost}</small>
        </div>
      </div>
      <a
        className={styles.courseLink}
        href={c.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        View course on the provider’s website
        <ArrowRight size={16} />
      </a>
    </article>
  );
}
export default function Discovery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [provider, setProvider] = useState("All providers");
  const [level, setLevel] = useState("All levels");
  const [all, setAll] = useState(false);
  const filtered = useMemo(
    () =>
      certifications.filter(
        (c) =>
          (category === "All" ||
            c.categories.includes(category as (typeof c.categories)[number])) &&
          (provider === "All providers" || c.organization === provider) &&
          (level === "All levels" || c.difficulty === level) &&
          `${c.title} ${c.organization} ${c.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, category, provider, level],
  );
  const active =
    !!query ||
    category !== "All" ||
    provider !== "All providers" ||
    level !== "All levels";
  return (
    <section className={styles.learningSection} id="certifications">
      <div className="container">
        <span className="eyebrow">Certificates</span>
        <h2 className="section-title">Free courses and career certificates</h2>
        <p className="section-description">
          Learn from recognized providers. Check what each course awards: a
          certificate, a digital badge, or a learning achievement.
        </p>
        <div className={styles.learningTools}>
          <div
            className={styles.learningTabs}
            role="group"
            aria-label="Learning category"
          >
            {[
              "All",
              "Business",
              "Technology",
              "Marketing",
              "AI",
              "Data",
              "Career Skills",
            ].map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? styles.activeLearningTab : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className={styles.learningSearchRow}>
            <label className={styles.searchInput}>
              <Search size={17} />
              <input
                aria-label="Search free learning"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses or providers"
              />
            </label>
            <select
              aria-label="Learning provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option>All providers</option>
              {certifications.map((c) => (
                <option key={c.id}>{c.organization}</option>
              ))}
            </select>
            <select
              aria-label="Learning difficulty"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option>All levels</option>
              <option>Beginner</option>
              <option>Mixed levels</option>
            </select>
          </div>
        </div>
        <div className={styles.resultsBar}>
          <p>{filtered.length} courses and providers</p>
          {active && (
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
                setProvider("All providers");
                setLevel("All levels");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        {filtered.length ? (
          <div className={styles.certificationGrid}>
            {(all || active ? filtered : filtered.slice(0, 3)).map((c) => (
              <CertificationCard key={c.id} certification={c} />
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <h3>No courses match those filters.</h3>
            <p>Try another topic or clear the filters.</p>
          </div>
        )}
        {!active && (
          <div className={styles.viewMore}>
            <button className="btn btn-outline" onClick={() => setAll(!all)}>
              {all ? "Show fewer courses" : "View all courses and providers"}
              <ChevronDown size={16} />
            </button>
          </div>
        )}
        <p className="catalogue-notice">
          Course availability, credentials, account requirements, and fees can
          change. Free learning does not always include a free certification
          exam.
        </p>
        <details className="official-directories" id="linkedin-guide">
          <summary>How to add a credential to LinkedIn</summary>
          <div className="linkedin-instructions">
            <p>
              On your profile, select Add profile section, then Recommended,
              then Add licenses & certifications.
            </p>
            <ol>
              <li>Enter the official course or credential name.</li>
              <li>Select the issuing organization.</li>
              <li>
                Use the issue date, and an expiry date only if the provider
                gives one.
              </li>
              <li>Add a credential ID if provided.</li>
              <li>
                Add the provider’s credential verification URL if one is
                available.
              </li>
            </ol>
            <p>
              Check LinkedIn’s{" "}
              <a
                href="https://www.linkedin.com/legal/user-agreement"
                target="_blank"
                rel="noopener noreferrer"
              >
                age and account requirements
              </a>{" "}
              before creating an account.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
