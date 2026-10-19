"use client";
import { useEffect, useMemo, useState } from "react";
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
        <span className={styles.freeBadge}>
          {c.freeCredential
            ? "Free credential"
            : c.credentialKind === "Learning only"
              ? "Free learning"
              : "Check award details"}
        </span>
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
          <small>
            {c.freeCredential
              ? "No-cost award confirmed"
              : "See learning and award costs below"}
          </small>
        </div>
      </div>
      <p className={styles.learningCost}>{c.cost}</p>
      <details className="course-details">
        <summary>Access, age and source details</summary>
        {c.accessNotes && <p>{c.accessNotes}</p>}
        <p>
          {c.verificationStatus === "course-verified"
            ? "Course facts checked"
            : c.verificationStatus === "provider-verified"
              ? "Provider information checked; confirm this course’s current details"
              : "Current course and award details need confirmation with the provider"}
          {c.verifiedOn ? `: ${c.verifiedOn}` : "."}
        </p>
        {c.evidenceUrl && c.evidenceUrl !== c.url && (
          <a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer">
            Provider’s course and award information ↗
          </a>
        )}
      </details>
      <a
        className={styles.courseLink}
        href={c.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Find course at provider
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
  const [credential, setCredential] = useState("All credentials");
  const [awardCost, setAwardCost] = useState("");
  const [visible, setVisible] = useState(6);
  useEffect(
    () => setVisible(6),
    [query, category, provider, level, credential, awardCost],
  );
  const filtered = useMemo(
    () =>
      certifications
        .filter(
          (c) =>
            (category === "All" ||
              c.categories.includes(
                category as (typeof c.categories)[number],
              )) &&
            (provider === "All providers" || c.organization === provider) &&
            (level === "All levels" || c.difficulty === level) &&
            (credential === "All credentials" ||
              c.credentialKind === credential) &&
            (!awardCost ||
              (awardCost === "free-award"
                ? c.freeCredential === true
                : c.freeCredential !== true)) &&
            `${c.title} ${c.organization} ${c.description} ${c.tags.join(" ")} ${c.accessNotes || ""}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
          const rank = (status?: string) =>
            status === "course-verified"
              ? 0
              : status === "provider-verified"
                ? 1
                : 2;
          return (
            rank(a.verificationStatus) - rank(b.verificationStatus) ||
            Number(!!b.freeCredential) - Number(!!a.freeCredential)
          );
        }),
    [query, category, provider, level, credential, awardCost],
  );
  const active =
    !!query ||
    category !== "All" ||
    provider !== "All providers" ||
    level !== "All levels" ||
    credential !== "All credentials" ||
    !!awardCost;
  return (
    <section className={styles.learningSection} id="certifications">
      <div className="container">
        <h2 className="section-title">Free courses and career certificates</h2>
        <p className="section-description">
          Explore {certifications.length} courses across{" "}
          {new Set(certifications.map((c) => c.organization)).size} providers.
          Find a useful skill and see whether you earn a certificate, badge, or
          participation statement.
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
              "Health & Safety",
              "Accessibility",
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
              {[...new Set(certifications.map((c) => c.organization))].map(
                (name) => (
                  <option key={name}>{name}</option>
                ),
              )}
            </select>
            <select
              aria-label="Credential type"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
            >
              <option>All credentials</option>
              {[
                ...new Set(
                  certifications.map((course) => course.credentialKind),
                ),
              ]
                .sort()
                .map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
            </select>
            <select
              aria-label="Learning and award cost"
              value={awardCost}
              onChange={(e) => setAwardCost(e.target.value)}
            >
              <option value="">All free learning</option>
              <option value="free-award">Free credential confirmed</option>
              <option value="learning">
                Learning only or award cost varies
              </option>
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
          <p role="status">
            {filtered.length} courses · showing{" "}
            {Math.min(visible, filtered.length)}
          </p>
          {active && (
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
                setProvider("All providers");
                setLevel("All levels");
                setCredential("All credentials");
                setAwardCost("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        {filtered.length ? (
          <div className={styles.certificationGrid} data-stagger>
            {filtered.slice(0, visible).map((c) => (
              <CertificationCard key={c.id} certification={c} />
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <h3>No courses match those filters.</h3>
            <p>Try another topic or clear the filters.</p>
          </div>
        )}
        {visible < filtered.length && (
          <div className={styles.viewMore}>
            <button
              className="btn btn-outline"
              onClick={() => setVisible(visible + 12)}
            >
              Show {Math.min(12, filtered.length - visible)} more courses
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
