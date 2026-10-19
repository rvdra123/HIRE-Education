"use client";
import { useEffect, useMemo, useState } from "react";
import {
  allInterviewQuestions,
  filterInterviewQuestions,
  interviewQuestionCount,
  interviewRoles,
  interviewTopics,
  type InterviewRole,
  type InterviewTopic,
} from "@/lib/interview-questions";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquare,
  Shuffle,
} from "lucide-react";

export default function CareerPractice() {
  const [role, setRole] = useState<InterviewRole | "All roles">("Retail");
  const [topic, setTopic] = useState<InterviewTopic | "All topics">(
    "All topics",
  );
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState<number | null>(null);
  const filtered = useMemo(
    () => filterInterviewQuestions({ role, topic, search }),
    [role, topic, search],
  );
  const current = filtered[index];
  const answerKey = current?.id || "";
  const answer = answers[answerKey] || "";
  const answered = filtered.filter(
    (item) => (answers[item.id] || "").trim().length > 0,
  ).length;
  const totalAnswered = allInterviewQuestions.filter(
    (item) => (answers[item.id] || "").trim().length > 0,
  ).length;
  const navigate = (nextIndex: number) => {
    setIndex(nextIndex);
    setShow(false);
    setSeconds(null);
  };
  useEffect(() => {
    if (seconds === null || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  return (
    <section className="practice-section" id="interview-practice">
      <div className="container">
        <div className="section-heading-simple">
          <h2 className="section-title">Prepare for your first interview</h2>
          <p className="section-description">
            Practise {interviewQuestionCount} distinct questions across{" "}
            {interviewRoles.length} role and interview categories. Use school,
            sports, clubs, volunteering, or other real responsibilities. No paid
            experience is required to practise.
          </p>
        </div>
        <div className="practice-layout">
          <div className="interview-practice">
            <div className="practice-filters">
              <label>
                Choose a role
                <select
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value as InterviewRole | "All roles");
                    navigate(0);
                  }}
                >
                  <option>All roles</option>
                  {interviewRoles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Choose an interview topic
                <select
                  value={topic}
                  onChange={(event) => {
                    setTopic(
                      event.target.value as InterviewTopic | "All topics",
                    );
                    navigate(0);
                  }}
                >
                  <option>All topics</option>
                  {interviewTopics.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Search interview questions
                <input
                  type="search"
                  value={search}
                  maxLength={150}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    navigate(0);
                  }}
                  placeholder="Try transit, allergy, teamwork, or exam"
                />
              </label>
            </div>
            <p
              className="practice-library-status"
              role="status"
              aria-live="polite"
            >
              {filtered.length} matching questions · {totalAnswered} of{" "}
              {interviewQuestionCount} drafts started in this visit
            </p>
            {(role !== "Retail" || topic !== "All topics" || search !== "") && (
              <button
                className="btn btn-outline"
                onClick={() => {
                  setRole("Retail");
                  setTopic("All topics");
                  setSearch("");
                  navigate(0);
                }}
              >
                Reset interview filters
              </button>
            )}
            {current ? (
              <>
                <div className="practice-progress">
                  <span>
                    {answered} of {filtered.length} answers started in this view
                  </span>
                  <progress
                    max={filtered.length}
                    value={answered}
                    aria-label="Interview answers started in this view"
                  />
                </div>
                <label>
                  Jump to a question
                  <select
                    value={index}
                    onChange={(event) => navigate(Number(event.target.value))}
                  >
                    {filtered.map((item, itemIndex) => (
                      <option key={item.id} value={itemIndex}>
                        {itemIndex + 1}. {item.question}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="small-note">
                  Question {index + 1} of {filtered.length}
                </span>
                <p className="practice-topic">
                  {current.role} · {current.topic}
                </p>
                <h3 className="question-transition" key={answerKey}>
                  {current.question}
                </h3>
                <label>
                  Your practice answer
                  <textarea
                    rows={5}
                    value={answer}
                    onChange={(event) =>
                      setAnswers((previous) => ({
                        ...previous,
                        [answerKey]: event.target.value,
                      }))
                    }
                    placeholder={
                      current.role === "Questions to ask"
                        ? "Write the question you would ask and why the answer matters to you."
                        : "What happened? What did you do? What was the result? For a hypothetical situation, explain what you would do."
                    }
                    maxLength={3000}
                  />
                </label>
                <p className="small-note">
                  Drafts stay only in this page’s memory. They are not sent for
                  analysis or saved after a reload. Avoid including private
                  information.
                </p>
                <div className="practice-buttons">
                  <button
                    className="btn btn-outline"
                    disabled={index === 0}
                    onClick={() => navigate(index - 1)}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    className="btn btn-outline"
                    aria-expanded={show}
                    aria-controls="interview-guidance"
                    onClick={() => setShow(!show)}
                  >
                    {show ? "Hide guidance" : "Show guidance"}
                    <MessageSquare size={16} />
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={filtered.length < 2}
                    onClick={() => navigate((index + 1) % filtered.length)}
                  >
                    Next question
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="practice-extra-controls">
                  <button
                    disabled={filtered.length < 2}
                    onClick={() =>
                      navigate(
                        (index +
                          1 +
                          Math.floor(Math.random() * (filtered.length - 1))) %
                          filtered.length,
                      )
                    }
                  >
                    <Shuffle size={15} />
                    Random question
                  </button>
                  <button
                    onClick={() => setSeconds(seconds !== null ? null : 60)}
                  >
                    <Clock3 size={15} />
                    {seconds === null
                      ? "Practise for 60 seconds"
                      : "Stop timer"}
                  </button>
                  {seconds !== null && (
                    <span role="timer" aria-label="Practice time remaining">
                      {seconds}s remaining
                    </span>
                  )}
                </div>
                {seconds === 0 && (
                  <p className="small-note" role="status">
                    Practice time is up. Finish your thought, then check whether
                    you answered the question.
                  </p>
                )}
                {show && (
                  <div className="interview-guidance" id="interview-guidance">
                    <h4>How to approach it</h4>
                    <p>{current.approach}</p>
                    <h4>Fictional student example</h4>
                    <p>{current.example}</p>
                    <p className="small-note">
                      Use your own experience. This example is a guide, not a
                      script to memorize. Say when an answer describes what you
                      would do rather than something you have done.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="interview-guidance">
                No questions match these filters. Try a broader topic, choose
                All roles, or clear the search. Your existing drafts are still
                available during this visit.
              </p>
            )}
          </div>
          <aside className="interview-tips">
            <h3>Use a simple answer structure</h3>
            <p>For a question about a past experience, try:</p>
            <ol>
              <li>
                <strong>Situation:</strong> give enough context to understand
                the example.
              </li>
              <li>
                <strong>Task:</strong> explain what you needed to do.
              </li>
              <li>
                <strong>Action:</strong> describe your own contribution.
              </li>
              <li>
                <strong>Result:</strong> explain what happened or what you
                learned.
              </li>
            </ol>
            <p>
              For a hypothetical situation, explain the steps you would take and
              when you would ask trained staff for help. For Questions to ask,
              choose a few that have not already been answered.
            </p>
            <p>
              You do not need a paid job to have a useful example. Keep it
              honest and answer the question being asked.
            </p>
            <details className="practice-self-check" key={answerKey}>
              <summary>Check your answer</summary>
              {[
                "I answered the question directly.",
                "I used a real example, or clearly explained what I would do.",
                "I explained my own actions and limits.",
                "I included a result, next step, or something I learned.",
              ].map((item) => (
                <label key={item}>
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </details>
            <details className="practice-self-check">
              <summary>Official preparation and safety guidance</summary>
              <p>
                These are original practice questions, not questions promised by
                an employer. Hiring, accommodation, pay, and safety rules depend
                on the role and circumstances. Check official guidance when you
                need advice about your situation.
              </p>
              <ul>
                <li>
                  <a
                    href="https://nationalcareers.service.gov.uk/careers-advice/interview-advice"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    National Careers Service: interview preparation
                  </a>{" "}
                  (UK career advice; use Ontario sources for local rights)
                </li>
                <li>
                  <a
                    href="https://nationalcareers.service.gov.uk/careers-advice/interview-advice/the-star-method"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    National Careers Service: the STAR method
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ohrc.on.ca/en/iv-human-rights-issues-all-stages-employment/5-interviewing-and-making-hiring-decisions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ontario Human Rights Commission: interviews and hiring
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ccohs.ca/oshanswers/legisl/legislation/three_rights.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CCOHS: worker health and safety rights
                  </a>
                </li>
              </ul>
            </details>
          </aside>
        </div>
        <div className="video-section">
          <h2 className="section-title">
            Learn from useful videos and youth resources
          </h2>
          <p className="section-description">
            Explore the searchable resource library for learning channels,
            communication practice, and school-friendly career support. Check
            the audience and adapt general advice to your own high-school
            application.
          </p>
          <a className="btn btn-outline" href="#youtube-resources">
            Browse YouTube learning resources
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
