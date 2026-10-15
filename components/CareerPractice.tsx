"use client";
import { useState } from "react";
import { ArrowUpRight, ChevronRight, MessageSquare, Play } from "lucide-react";
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
const questions = {
  Retail: [
    {
      question:
        "A customer asks you something you do not know. What would you do?",
      approach:
        "Explain how you would listen, be honest about what you know, and ask a trained teammate for help.",
      example:
        "At a school fundraiser, a visitor asked about an activity I was not running. I checked with the student in charge and brought back the correct information instead of guessing.",
    },
    {
      question: "Tell me about a time you worked well with other people.",
      approach:
        "Choose a real team project. Describe your contribution and how you helped the group finish.",
      example:
        "For a class presentation, I organized our shared slides and checked that everyone had time to practise. We finished the presentation by the deadline.",
    },
  ],
  "Food service": [
    {
      question: "How would you handle several tasks arriving at once?",
      approach:
        "Show that you can prioritize, communicate, and ask for help while following training and safety procedures.",
      example:
        "During a school event, I had to welcome visitors and restock supplies. I let a teammate know when supplies were low, finished helping the person in front of me, and then restocked.",
    },
    {
      question: "What would you do if you made a mistake?",
      approach:
        "Take responsibility, tell the right person promptly, and explain how you would prevent it next time.",
      example:
        "I once put the wrong date in a club announcement. I told the club leader, corrected the post, and started checking dates against our calendar before sharing updates.",
    },
  ],
  Recreation: [
    {
      question: "How would you help someone who feels left out of an activity?",
      approach:
        "Describe how you would listen, offer an appropriate way to join, and follow the program’s supervision and safety rules.",
      example:
        "In a group project, a quieter classmate was not getting a chance to contribute. I asked which task they wanted to try and made space for them to explain their idea.",
    },
    {
      question: "How do you show that people can rely on you?",
      approach:
        "Use a regular commitment and describe how you prepare and communicate when plans change.",
      example:
        "I help set up equipment for team practices. I arrive early enough to do it, and if I cannot attend, I let the coach know in advance.",
    },
  ],
  Volunteering: [
    {
      question: "Why do you want to volunteer with this organization?",
      approach:
        "Mention something specific from the organization’s official website and connect it to a real interest.",
      example:
        "I enjoy helping other students learn, so I would like a role that supports learning activities. I would first check the program’s goals and training requirements.",
    },
    {
      question: "Tell me about a time you helped someone.",
      approach:
        "A school or community example works. Explain what the person needed, what you did, and what happened.",
      example:
        "A classmate missed a lesson before a quiz. I shared my notes and worked through a few practice questions with them. I also encouraged them to ask our teacher about anything still unclear.",
    },
  ],
};
export default function CareerPractice() {
  const [role, setRole] = useState<keyof typeof questions>("Retail");
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [answer, setAnswer] = useState("");
  const current = questions[role][index];
  return (
    <section className="practice-section" id="interview-practice">
      <div className="container">
        <div className="section-heading-simple">
          <span className="eyebrow">Career skills & resources</span>
          <h2 className="section-title">Prepare for your first interview</h2>
          <p className="section-description">
            Practise with questions for common student roles. Your answer can
            come from school, sports, clubs, or volunteering.
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
                  setAnswer("");
                }}
              >
                {Object.keys(questions).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <span className="small-note">
              Question {index + 1} of {questions[role].length}
            </span>
            <h3>{current.question}</h3>
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
                  setAnswer("");
                }}
              >
                Next question
                <ChevronRight size={16} />
              </button>
            </div>
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
