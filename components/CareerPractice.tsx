"use client";
import { useEffect, useState } from "react";
import { interviewQuestions as questions } from "@/lib/interview-questions";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquare,
  Play,
  Shuffle,
} from "lucide-react";
const channels = [
  {
    name: "Vinh Giang",
    topic: "Communication",
    description:
      "Speaking clearly, using your voice, and building confidence when you speak.",
    url: "https://www.youtube.com/@askvinh",
  },
  {
    name: "CareerVidz",
    topic: "Interviews",
    description:
      "Interview question walkthroughs and examples you can adapt to your own experience.",
    url: "https://www.youtube.com/@CareerVidz",
  },
  {
    name: "Self Made Millennial",
    topic: "Job applications",
    description:
      "Interview preparation, job-search habits, and how to explain your experience.",
    url: "https://www.youtube.com/@SelfMadeMillennial",
  },
  {
    name: "Jeff Su",
    topic: "Work and digital skills",
    description:
      "Practical videos on professional communication, resumes, and productivity tools.",
    url: "https://www.youtube.com/@JeffSu",
  },
];
export default function CareerPractice() {
  const [role, setRole] = useState<keyof typeof questions>("Retail");
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState<number | null>(null);
  const answerKey = `${role}:${index}`;
  const answer = answers[answerKey] || "";
  const setAnswer = (value: string) =>
    setAnswers((previous) => ({ ...previous, [answerKey]: value }));
  const answered = questions[role].filter(
    (_, i) => (answers[`${role}:${i}`] || "").trim().length > 0,
  ).length;
  useEffect(() => {
    if (seconds === null || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);
  useEffect(() => {
    setSeconds(null);
    setShow(false);
  }, [role, index]);
  const current = questions[role][index];
  return (
    <section className="practice-section" id="interview-practice">
      <div className="container">
        <div className="section-heading-simple">
          <h2 className="section-title">Prepare for your first interview</h2>
          <p className="section-description">
            Practise 48 questions across four common student roles. Your answer
            can come from school, sports, clubs, or volunteering.
          </p>
        </div>
        <div className="practice-layout">
          <div className="interview-practice">
            <label>
              Choose a role
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as keyof typeof questions);
                  setIndex(0);
                  setShow(false);
                }}
              >
                {Object.keys(questions).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <div className="practice-progress">
              <span>
                {answered} of {questions[role].length} answers started
              </span>
              <progress
                max={questions[role].length}
                value={answered}
                aria-label="Interview answers started"
              />
            </div>
            <span className="small-note">
              Question {index + 1} of {questions[role].length}
            </span>
            <h3 className="question-transition" key={answerKey}>
              {current.question}
            </h3>
            <label>
              Your practice answer
              <textarea
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="What happened? What did you do? What was the result?"
                maxLength={3000}
              />
            </label>
            <p className="small-note">
              Your answer stays in this page’s memory and is not sent for AI
              analysis.
            </p>
            <div className="practice-buttons">
              <button
                className="btn btn-outline"
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                className="btn btn-outline"
                aria-expanded={show}
                onClick={() => setShow(!show)}
              >
                {show ? "Hide guidance" : "Show guidance"}
                <MessageSquare size={16} />
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIndex((index + 1) % questions[role].length);
                  setShow(false);
                }}
              >
                Next question
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="practice-extra-controls">
              <button
                onClick={() =>
                  setIndex(
                    (index +
                      1 +
                      Math.floor(
                        Math.random() * (questions[role].length - 1),
                      )) %
                      questions[role].length,
                  )
                }
              >
                <Shuffle size={15} />
                Random question
              </button>
              <button onClick={() => setSeconds(seconds !== null ? null : 60)}>
                <Clock3 size={15} />
                {seconds === null ? "Practise for 60 seconds" : "Stop timer"}
              </button>
              {seconds !== null && (
                <span role="timer" aria-label="Practice time remaining">
                  {seconds}s remaining
                </span>
              )}
            </div>
            {seconds === 0 && (
              <p className="small-note" role="status">
                Practice time is up. Finish your thought, then check whether you
                answered the question.
              </p>
            )}
            {show && (
              <div className="interview-guidance">
                <h4>How to approach it</h4>
                <p>{current.approach}</p>
                <h4>Fictional student example</h4>
                <p>{current.example}</p>
                <p className="small-note">
                  Use your own experience. This example is a guide, not a script
                  to memorize.
                </p>
              </div>
            )}
          </div>
          <aside className="interview-tips">
            <h3>Use a simple answer structure</h3>
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
              You do not need a paid job to have a useful example. Keep it
              honest and answer the question being asked.
            </p>
            <details className="practice-self-check">
              <summary>Check your answer</summary>
              {[
                "I answered the question directly.",
                "I used a real example.",
                "I explained my own actions.",
                "I included a result or something I learned.",
              ].map((item) => (
                <label key={`${answerKey}:${item}`}>
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </details>
          </aside>
        </div>
        <div className="video-section">
          <h2 className="section-title">Useful YouTube channels</h2>
          <p className="section-description">
            Choose a topic you want to practise. Some videos are aimed at
            adults, so adapt the advice to a high school application.
          </p>
          <div className="video-grid">
            {channels.map((c) => (
              <a
                className="video-card"
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="video-topic">
                  <Play size={14} />
                  {c.topic}
                </span>
                <h3>
                  {c.name}
                  <ArrowUpRight size={16} />
                </h3>
                <p>{c.description}</p>
                <span>Visit channel on YouTube ↗</span>
              </a>
            ))}
          </div>
          <p className="small-note">
            External educational channels, not HIRE Education partners. We link
            to channels without embedding tracking players; advice, course
            offers, and availability can change.
          </p>
        </div>
      </div>
    </section>
  );
}
