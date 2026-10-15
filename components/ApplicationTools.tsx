"use client";
import Link from "next/link";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Lightbulb,
  Printer,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import styles from "./application-tools.module.css";
import {
  readOptional,
  writeOptional,
  PRIVACY_EVENT,
} from "@/lib/privacy/storage";

type Tab = "resume" | "cover" | "checklist";

const resumeSections = [
  {
    title: "Contact information",
    label: "Make it easy to reach you",
    text: "Include your full name, a professional email, a phone number you check, and Brampton, ON. A street address, photo, birth date, and Social Insurance Number do not belong on your resume.",
    example:
      "Avery Singh · Brampton, ON · avery.singh@example.com · [your phone]",
  },
  {
    title: "Professional summary",
    label: "Two or three lines. All you.",
    text: "Introduce your grade, the role you want, and two relevant strengths. Back up your strengths with an activity or responsibility. Change this section for each job.",
    example:
      "Grade 11 student seeking a part-time recreation role. Brings experience supporting younger students, a welcoming attitude, and reliable weekend availability.",
  },
  {
    title: "Skills",
    label: "Be specific and honest",
    text: "Choose four to six skills that match the posting. Mix practical skills with people skills, and include evidence. List languages with your actual level of fluency. Do not add tools or skills you cannot demonstrate.",
    example:
      "Google Docs and Slides · Customer service through school events · Conversational French · Cash handling at a club fundraiser",
  },
  {
    title: "Work experience",
    label: "Every responsibility can count",
    text: "List paid roles, babysitting, helping a family business, or other work responsibilities with a title, context, dates, and two or three bullets. If you have not had a paid job, lead with relevant volunteer experience instead and omit an empty work section.",
    example:
      "Babysitter · Neighbourhood families · Summer 2026. Planned age-appropriate activities and followed family routines for two children.",
  },
  {
    title: "Volunteer experience",
    label: "Your contribution matters",
    text: "School events, peer tutoring, community groups, and service activities can show real workplace skills. Name the role, organization, and dates, then describe your contribution. If you list hours, use only hours you can accurately support.",
    example:
      "Peer tutor · School homework club · September 2026 to present. Help two Grade 9 students practise algebra each week.",
  },
  {
    title: "Education",
    label: "Your learning counts",
    text: "List your high school, city, grade, and expected graduation year. Add relevant courses such as business, computer studies, or physical education. Only include an average if it helps your application and you are comfortable sharing it.",
    example:
      "[Your high school], Brampton, ON · Grade 11 · Ontario Secondary School Diploma expected June 2028",
  },
  {
    title: "Certifications",
    label: "Relevant, current, and earned",
    text: "Include certifications you actually hold, along with the issuer and completion or expiry date where relevant. For some Brampton roles, current first aid or other role-specific training may help. Check the posting before paying for a course.",
    example:
      "[Certification name] · [Provider] · Completed [month/year] · Expires [month/year, if applicable]",
  },
  {
    title: "Activities, projects & awards",
    label: "Show what you get involved in",
    text: "A class project, sports team, arts group, coding club, leadership role, or earned award can show initiative. Explain your contribution and the result, rather than listing only the club name. Keep this section relevant to the role.",
    example:
      "School food drive: worked with a team of five to sort and label 120 donated items for pickup.",
  },
];

const checklistItems = [
  "I checked the employer and opened the original job posting.",
  "I meet the posting’s age, training, and availability requirements.",
  "My resume shows skills that match this particular role.",
  "My contact details and professional email are correct.",
  "My experience and qualifications are accurate.",
  "My bullets explain what I did and the difference it made.",
  "My resume is easy to read and ideally fits on one page.",
  "I checked spelling, grammar, dates, and the employer’s name.",
  "I included a tailored cover letter if one is requested.",
  "I followed the requested file format and used a clear file name.",
  "I have a realistic plan for travel, school, and work hours.",
  "I saved and tracked my application, and prepared examples for a possible interview.",
];

const resumeTemplate = `YOUR FULL NAME
Brampton, ON | Your phone | professional.email@example.com

PROFESSIONAL SUMMARY
[Your grade and target role]. [Two relevant strengths, supported by an activity or responsibility]. [Availability, if useful and accurate].

SKILLS
- [Relevant skill and brief evidence]
- [Tool you can use confidently]
- [Language and accurate fluency level, if relevant]

WORK EXPERIENCE (omit if not applicable)
[Role title] | [Organization or context], [City]
[Month Year] – [Month Year or present]
- [Action verb] + [what you did] + [specific result or purpose].
- [Action verb] + [what you did] + [specific result or purpose].

VOLUNTEER EXPERIENCE
[Volunteer role, school event, tutoring, or community activity]
[Month Year] – [Month Year or present]
- [Specific contribution, using honest numbers where you have them].

EDUCATION
[Your high school], Brampton, ON
Ontario Secondary School Diploma expected [Month Year] | Grade [9–12]
Relevant courses: [Course 1], [Course 2]

CERTIFICATIONS (optional)
[Name] | [Issuer] | [Completion and expiry dates, if applicable]

ACTIVITIES, PROJECTS & AWARDS (optional)
[Project, club, or earned award] | [Your contribution and result]

BEFORE YOU SEND
Replace every bracketed prompt. Remove sections that do not apply. Keep the layout simple, tailor it to the posting, and follow the requested file format. Do not include a photo, date of birth, full street address, banking details, or SIN. Ask references before sharing their contact details on a separate sheet.

HIRE Education | Student resume template | Brampton, Ontario
`;

const coverTemplate = `YOUR FULL NAME
Brampton, ON | Your phone | professional.email@example.com

[Date]
[Hiring manager’s name or Hiring Team]
[Employer]
[City, Province]

Re: [Exact job title and reference number, if provided]

Dear [Hiring manager’s name or Hiring Team],

I am a Grade [number] student at [school] in Brampton, applying for the [job title] role I found on [source]. I am interested in your team because [specific, honest reason connected to the employer or role].

Through [volunteering, school project, club, family responsibility, or paid role], I [specific action and result]. This helped me build [skill from the posting]. For example, [one short example that shows this skill in action].

Your [specific program, service, or value you verified] interests me because [authentic reason]. I would bring my [relevant strength] to help your team [realistic contribution connected to the role].

I am available [your real availability] and have considered how I will travel to work. [Mention a required certification only if you hold it.] Thank you for considering my application. I would welcome the opportunity to discuss how I can contribute to your team.

Sincerely,
[Your full name]

BEFORE YOU SEND
Replace every bracketed prompt, verify the employer’s name and job title, keep the letter to one page, and follow the application instructions. Use only accurate experience and qualifications. Do not include a SIN, banking details, or other sensitive documents.

HIRE Education | Student cover letter template | Brampton, Ontario
`;

function ResumePaper() {
  return (
    <article
      className={styles.paper}
      aria-label="Fictional student resume example"
    >
      <div className={styles.paperTop}>
        <h4>Avery Singh</h4>
        <span>BRAMPTON, ONTARIO</span>
      </div>
      <p className={styles.paperContact}>
        avery.singh@example.com · [your phone number]
      </p>
      <section>
        <h5>PROFESSIONAL SUMMARY</h5>
        <p>
          Friendly Grade 11 student seeking a part-time recreation role.
          Experienced in helping younger students and organizing school
          activities. Reliable, patient, and available evenings and weekends.
        </p>
      </section>
      <section>
        <h5>SKILLS</h5>
        <p>
          Clear communication · Teamwork · Google Docs & Slides
          <br />
          Activity setup · English and conversational French
        </p>
      </section>
      <section>
        <h5>VOLUNTEER EXPERIENCE</h5>
        <div className={styles.paperRow}>
          <strong>Peer Tutor · School Homework Club</strong>
          <span>Sept 2026 to present</span>
        </div>
        <ul>
          <li>
            Help two Grade 9 students practise algebra during weekly homework
            sessions.
          </li>
          <li>
            Break down challenging questions into clear steps and encourage
            students to ask for help.
          </li>
        </ul>
        <div className={styles.paperRow}>
          <strong>Volunteer · School Community Day</strong>
          <span>June 2026</span>
        </div>
        <ul>
          <li>
            Welcomed families and explained activity instructions at a school
            event.
          </li>
          <li>
            Worked with four volunteers to set up, supervise, and tidy three
            activity stations.
          </li>
        </ul>
      </section>
      <section>
        <h5>EDUCATION</h5>
        <div className={styles.paperRow}>
          <strong>Local secondary school · Brampton, ON</strong>
          <span>2026 to present</span>
        </div>
        <p>
          Grade 11 · OSSD expected June 2028
          <br />
          Relevant courses: Leadership, Business, Physical Education
        </p>
      </section>
      <section>
        <h5>ACTIVITIES</h5>
        <p>
          <strong>School volleyball team</strong> · Practise twice weekly and
          help set up equipment for team sessions.
        </p>
      </section>
      <div className={styles.paperFooter}>
        FICTIONAL EXAMPLE · USE YOUR OWN EXPERIENCE
      </div>
    </article>
  );
}

function CoverPaper() {
  return (
    <article
      className={`${styles.paper} ${styles.letter}`}
      aria-label="Fictional recreation assistant cover letter example"
    >
      <div className={styles.paperTop}>
        <h4>Avery Singh</h4>
        <span>BRAMPTON, ONTARIO</span>
      </div>
      <p className={styles.paperContact}>
        avery.singh@example.com · [your phone number]
      </p>
      <p>October 14, 2026</p>
      <p>
        Hiring Team
        <br />
        Meadowview Community Centre
        <br />
        Brampton, ON
      </p>
      <p>
        <strong>Re: Part-time Recreation Assistant</strong>
      </p>
      <p>Dear Hiring Team,</p>
      <p>
        <span className={styles.annotation}>1</span>I am a Grade 11 student in
        Brampton applying for your part-time Recreation Assistant position. I
        enjoy helping young people feel included and would welcome the chance to
        support activities for families in my community.
      </p>
      <p>
        <span className={styles.annotation}>2</span>As a peer tutor, I help two
        Grade 9 students work through algebra problems each week. I explain
        instructions patiently and adapt when someone needs a different
        approach. At my school’s Community Day, I also helped a team of
        volunteers set up and run three activity stations. These experiences
        have helped me become a clear communicator and dependable teammate.
      </p>
      <p>
        <span className={styles.annotation}>3</span>Your beginner-friendly youth
        programs appeal to me because I know how much a welcoming first
        experience can matter. I would bring patience and clear explanations to
        help participants feel comfortable joining a new activity.
      </p>
      <p>
        <span className={styles.annotation}>4</span>I am available after school
        on Tuesdays and Thursdays and on weekends, and have planned a reliable
        transit route. Thank you for considering my application. I would
        appreciate the opportunity to discuss how I could contribute to your
        recreation team.
      </p>
      <p>
        Sincerely,
        <br />
        <strong>Avery Singh</strong>
      </p>
      <div className={styles.paperFooter}>
        FICTIONAL STUDENT, EMPLOYER, AND OPENING
      </div>
    </article>
  );
}

export default function ApplicationTools() {
  const [tab, setTab] = useState<Tab>("resume");
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [checked, setChecked] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [notice, setNotice] = useState("");
  const paperRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        readOptional("hire-education-application-checklist-v1") || "[]",
      );
      if (Array.isArray(saved))
        setChecked([
          ...new Set(
            saved.filter(
              (item): item is number =>
                Number.isInteger(item) &&
                item >= 0 &&
                item < checklistItems.length,
            ),
          ),
        ]);
    } catch {
      setStorageAvailable(false);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      setStorageAvailable(
        writeOptional(
          "hire-education-application-checklist-v1",
          JSON.stringify(checked),
        ),
      );
    } catch {
      setStorageAvailable(false);
    }
  }, [checked, loaded]);

  useEffect(() => {
    const update = () => {
      setChecked([]);
      setStorageAvailable(false);
    };
    window.addEventListener(PRIVACY_EVENT, update);
    return () => window.removeEventListener(PRIVACY_EVENT, update);
  }, []);

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "resume", label: "Resume guide", icon: FileText },
    { id: "cover", label: "Cover letters", icon: FileText },
    { id: "checklist", label: "Before you apply", icon: ClipboardCheck },
  ];

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  function downloadTemplate(kind: "resume" | "cover") {
    const url = URL.createObjectURL(
      new Blob([kind === "resume" ? resumeTemplate : coverTemplate], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `HIRE-Education-${kind === "resume" ? "Resume" : "Cover-Letter"}-Template.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      `${kind === "resume" ? "Resume" : "Cover letter"} template downloaded. Open the text file in your preferred document editor and replace the prompts.`,
    );
  }

  function printExample() {
    if (!paperRef.current) return;
    const printWindow = window.open("", "_blank", "width=850,height=1050");
    if (!printWindow) {
      setNotice(
        "Your browser blocked the print window. Allow pop-ups for this site, then choose Print example again.",
      );
      return;
    }
    const content = paperRef.current.innerHTML;
    printWindow.document.write(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>HIRE Education ,  ${tab === "cover" ? "Cover letter" : "Resume"} example</title><style>@page{size:letter;margin:18mm}body{font-family:Arial,sans-serif;color:#172438;font-size:11pt;line-height:1.5;max-width:700px;margin:auto}h4{font-size:29pt;margin:0;color:#102c51}h5{font-size:10pt;letter-spacing:2px;border-bottom:1px solid #b6c7da;margin:22px 0 8px;padding-bottom:5px}p{margin:10px 0}ul{padding-left:18px}li{margin:5px 0}article>div:first-child{display:flex;align-items:baseline;justify-content:space-between}article>div:first-child span{font-size:8pt;letter-spacing:1px}section>div{display:flex;justify-content:space-between;gap:12px}section>div span{font-size:9pt;white-space:nowrap}article>div:last-child{font-size:7pt;letter-spacing:1px;color:#657487;border-top:1px solid #d3dbe5;padding-top:16px;margin-top:25px}p>span{display:none}a{color:inherit}</style></head><body>${content}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 250);
    setNotice(
      "Print example opened. Choose Save as PDF in the print dialog to keep a copy.",
    );
  }

  return (
    <section
      id="resume"
      className={styles.section}
      aria-labelledby="application-title"
    >
      <div className="container">
        <div className={styles.headingRow}>
          <div>
            <p className="eyebrow">
              <span className={styles.eyebrowDot} /> YOUR APPLICATION TOOLKIT
            </p>
            <h2 id="application-title" className="section-title">
              Resume and cover letter guides
            </h2>
            <p className={`section-description ${styles.intro}`}>
              Use your school activities, projects, and volunteering to show
              what you can bring to a role.
            </p>
          </div>
          <div className={styles.headingNote}>
            <Sparkles size={19} aria-hidden="true" />
            <span>
              Guidance for students
              <br />
              <strong>With or without a first job</strong>
            </span>
          </div>
        </div>

        <div className="reviewer-launch">
          <div>
            <h3>Get an AI resume review</h3>
            <p>
              Compare your PDF or DOCX resume with a job description. See
              strengths, improvements, and suggested bullet rewrites.
            </p>
          </div>
          <Link
            className="btn btn-primary"
            href="/resume-reviewer"
            prefetch={false}
          >
            Open resume reviewer <ArrowRight size={16} />
          </Link>
        </div>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Application tools"
        >
          {tabs.map(({ id, label, icon: Icon }, index) => (
            <button
              key={id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`application-tab-${id}`}
              aria-controls={`application-panel-${id}`}
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => {
                setTab(id);
                setNotice("");
              }}
              onKeyDown={(event) => handleTabKey(event, index)}
              className={tab === id ? styles.activeTab : ""}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
              {id === "checklist" && checked.length > 0 && (
                <span className={styles.tabCount}>{checked.length}/12</span>
              )}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id="application-panel-resume"
          aria-labelledby="application-tab-resume"
          hidden={tab !== "resume"}
          tabIndex={0}
          className={styles.panel}
        >
          <div className={styles.guideGrid}>
            <div className={styles.guideContent}>
              <span className={styles.smallLabel}>BUILD YOUR FIRST RESUME</span>
              <h3>Build a high school resume</h3>
              <p className={styles.bodyText}>
                Think of your resume as a snapshot of what you can bring to a
                team. Start with these eight building blocks.
              </p>
              <div className={styles.accordion}>
                {resumeSections.map((item, index) => (
                  <div
                    className={`${styles.accordionItem} ${openSection === index ? styles.accordionOpen : ""}`}
                    key={item.title}
                  >
                    <h4>
                      <button
                        type="button"
                        aria-expanded={openSection === index}
                        aria-controls={`resume-section-${index}`}
                        onClick={() =>
                          setOpenSection(openSection === index ? null : index)
                        }
                      >
                        <span className={styles.sectionNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{item.title}</span>
                        <ChevronDown size={17} aria-hidden="true" />
                      </button>
                    </h4>
                    <div
                      id={`resume-section-${index}`}
                      hidden={openSection !== index}
                      className={styles.accordionBody}
                    >
                      <strong>{item.label}</strong>
                      <p>{item.text}</p>
                      <div className={styles.exampleText}>
                        <span>TRY SOMETHING LIKE</span>
                        {item.example}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.referencesTip}>
                <strong>What about references?</strong> Keep them on a separate
                sheet and share only when requested. Ask a teacher, coach, or
                supervisor for permission before sharing their contact details.
              </p>
              <button
                className={`${styles.downloadButton} btn btn-primary`}
                type="button"
                onClick={() => downloadTemplate("resume")}
              >
                <ArrowDownToLine size={17} aria-hidden="true" />
                Download editable template
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <p className={styles.fileNote}>
                Free .txt file · Open in Word, Google Docs, or any text editor
              </p>
            </div>
            <div className={styles.previewColumn}>
              <div className={styles.previewHeading}>
                <span>
                  <span className={styles.liveDot} /> A REALISTIC FIRST RESUME
                </span>
                <button
                  type="button"
                  onClick={printExample}
                  aria-label="Print the fictional student resume example"
                >
                  <Printer size={16} aria-hidden="true" />
                  Print example
                </button>
              </div>
              <div ref={tab === "resume" ? paperRef : undefined}>
                <ResumePaper />
              </div>
              <p className={styles.previewCaption}>
                <Lightbulb size={15} aria-hidden="true" />
                An example, not a script. Replace every detail with your own.
              </p>
            </div>
          </div>

          <div className={styles.bulletGuide}>
            <div>
              <span className={styles.smallLabel}>MAKE EVERY BULLET COUNT</span>
              <h3>Write clear resume bullets</h3>
              <p>
                Use <strong>action + what you did + impact</strong>. Use real
                numbers when you have them, and describe the result honestly.
              </p>
            </div>
            <div className={styles.bulletExamples}>
              <div>
                <span className={styles.beforeLabel}>BEFORE</span>
                <p>“Helped at a school event.”</p>
                <ArrowRight size={19} aria-hidden="true" />
                <span className={styles.afterLabel}>AFTER</span>
                <p>
                  “Welcomed 30 families and explained activity instructions at a
                  school community event.”
                </p>
              </div>
              <div>
                <span className={styles.beforeLabel}>BEFORE</span>
                <p>“Good at teamwork.”</p>
                <ArrowRight size={19} aria-hidden="true" />
                <span className={styles.afterLabel}>AFTER</span>
                <p>
                  “Worked with five classmates to plan, rehearse, and deliver a
                  business class presentation on time.”
                </p>
              </div>
            </div>
          </div>
          <div className={styles.dosGrid}>
            <div className={styles.doCard}>
              <h4>
                <Check size={18} aria-hidden="true" />A few things to do
              </h4>
              <ul>
                <li>Tailor your skills to the posting.</li>
                <li>
                  Use clear headings, readable type, and consistent dates.
                </li>
                <li>Include unpaid experience and responsibilities.</li>
                <li>
                  Follow the employer’s file instructions; PDF is often useful
                  when no format is specified.
                </li>
              </ul>
            </div>
            <div className={styles.dontCard}>
              <h4>
                <X size={18} aria-hidden="true" />A few things to skip
              </h4>
              <ul>
                <li>Photos, birth dates, SINs, and banking details.</li>
                <li>
                  Experience, references, or certifications you do not have.
                </li>
                <li>Long paragraphs, vague claims, and crowded layouts.</li>
                <li>Sending the same untailored resume to every employer.</li>
              </ul>
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          id="application-panel-cover"
          aria-labelledby="application-tab-cover"
          hidden={tab !== "cover"}
          tabIndex={0}
          className={styles.panel}
        >
          <div className={styles.guideGrid}>
            <div className={styles.guideContent}>
              <span className={styles.smallLabel}>MAKE THE INTRODUCTION</span>
              <h3>Write a clear cover letter</h3>
              <p className={styles.bodyText}>
                A cover letter connects your experience to one specific job.
                Include one when the employer asks, or when you have something
                useful to add. Use these four short phases and keep it to one
                page.
              </p>
              <div className={styles.letterSteps}>
                <div>
                  <span>1</span>
                  <div>
                    <h4>Opening: introduce yourself</h4>
                    <p>
                      Name the exact role, your grade, and where you found the
                      posting when useful. Give the reader a clear reason to
                      keep reading.
                    </p>
                  </div>
                </div>
                <div>
                  <span>2</span>
                  <div>
                    <h4>Evidence: show what you bring</h4>
                    <p>
                      Choose one or two skills from the posting. Connect them to
                      a real story from school, volunteering, a club, or a
                      responsibility at home.
                    </p>
                  </div>
                </div>
                <div>
                  <span>3</span>
                  <div>
                    <h4>Connection: explain “why them”</h4>
                    <p>
                      Mention a specific program, service, or value you have
                      verified. Explain why it matters to you and how you could
                      contribute. Skip generic praise.
                    </p>
                  </div>
                </div>
                <div>
                  <span>4</span>
                  <div>
                    <h4>Closing: make the next step clear</h4>
                    <p>
                      Share accurate availability if relevant, thank the reader,
                      and express interest in an interview. Keep the tone warm
                      and professional.
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.tip}>
                <Lightbulb size={20} aria-hidden="true" />
                <p>
                  <strong>Read it out loud.</strong> If it does not sound like
                  something you would say, simplify it. Clear, honest writing
                  makes a stronger impression.
                </p>
              </div>
              <button
                className={`${styles.downloadButton} btn btn-primary`}
                type="button"
                onClick={() => downloadTemplate("cover")}
              >
                <ArrowDownToLine size={17} aria-hidden="true" />
                Download cover letter template
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <p className={styles.fileNote}>
                Free .txt file · Replace the prompts and make it your own
              </p>
            </div>
            <div className={styles.previewColumn}>
              <div className={styles.previewHeading}>
                <span>
                  <span className={styles.liveDot} /> SEE THE FOUR PARTS IN
                  ACTION
                </span>
                <button
                  type="button"
                  onClick={printExample}
                  aria-label="Print the fictional cover letter example"
                >
                  <Printer size={16} aria-hidden="true" />
                  Print example
                </button>
              </div>
              <div ref={tab === "cover" ? paperRef : undefined}>
                <CoverPaper />
              </div>
              <p className={styles.previewCaption}>
                <Lightbulb size={15} aria-hidden="true" />
                Illustrative application only. The student, employer, and
                opening are fictional.
              </p>
            </div>
          </div>
          <div className={styles.emailTip}>
            <div className={styles.emailIcon}>
              <FileText size={23} aria-hidden="true" />
            </div>
            <div>
              <h4>Applying by email?</h4>
              <p>
                Use a clear subject like{" "}
                <strong>
                  “Recreation Assistant Application , Avery Singh”
                </strong>
                . Write a brief greeting, name the role, mention your
                attachments, and sign with your name and phone number.
                Double-check that the files are attached before sending.
              </p>
            </div>
          </div>
          <div className={styles.dosGrid}>
            <div className={styles.doCard}>
              <h4>
                <Check size={18} aria-hidden="true" />
                Make the letter count
              </h4>
              <ul>
                <li>Use the organization’s name and the exact role.</li>
                <li>Connect a real example to a skill in the posting.</li>
                <li>Explain why this organization interests you.</li>
                <li>
                  Keep it concise, customize it, and proofread before sending.
                </li>
              </ul>
            </div>
            <div className={styles.dontCard}>
              <h4>
                <X size={18} aria-hidden="true" />
                Keep these out
              </h4>
              <ul>
                <li>Repeating every detail from your resume.</li>
                <li>Exaggerated experience or qualifications.</li>
                <li>
                  Generic filler, slang, and unnecessarily long paragraphs.
                </li>
                <li>The same letter sent to every employer.</li>
              </ul>
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          id="application-panel-checklist"
          aria-labelledby="application-tab-checklist"
          hidden={tab !== "checklist"}
          tabIndex={0}
          className={styles.panel}
        >
          <div className={styles.checklistGrid}>
            <div className={styles.checklistIntro}>
              <div className={styles.checklistIcon}>
                <ClipboardCheck size={31} aria-hidden="true" />
              </div>
              <span className={styles.smallLabel}>YOUR FINAL ONCE-OVER</span>
              <h3>Before you apply</h3>
              <p className={styles.bodyText}>
                A few small checks make a big difference. Work through this list
                before you hit send.
              </p>
              <div className={styles.progressBlock}>
                <div>
                  <strong>
                    {checked.length}
                    <span> / 12 complete</span>
                  </strong>
                  <span>{Math.round((checked.length / 12) * 100)}%</span>
                </div>
                <progress
                  value={checked.length}
                  max={12}
                  aria-label="Application checklist progress"
                />
                <p>
                  {checked.length === 12
                    ? "All checked. You’re ready for your next step!"
                    : storageAvailable
                      ? "Your progress is saved in this browser."
                      : "Progress stays on this page. Accept optional storage in Privacy settings to keep it."}
                </p>
              </div>
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => {
                  setChecked([]);
                  setNotice("Application checklist reset.");
                }}
                disabled={checked.length === 0}
              >
                <RotateCcw size={15} aria-hidden="true" />
                Reset checklist
              </button>
              <div className={styles.tip}>
                <Lightbulb size={20} aria-hidden="true" />
                <p>
                  Save your final files with a clear name, like{" "}
                  <strong>Avery-Singh-Resume.pdf</strong>, unless the employer
                  asks for a different format.
                </p>
              </div>
            </div>
            <div className={styles.checklistItems}>
              {checklistItems.map((item, index) => (
                <label
                  key={item}
                  className={`${styles.checklistItem} ${checked.includes(index) ? styles.checked : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked.includes(index)}
                    onChange={() =>
                      setChecked((current) =>
                        current.includes(index)
                          ? current.filter((value) => value !== index)
                          : [...current, index],
                      )
                    }
                  />
                  <span className={styles.checkboxGraphic}>
                    <Check size={15} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </label>
              ))}
              <div className={styles.checklistEnd}>
                <CheckCheck size={18} aria-hidden="true" />
                <span>
                  One thoughtful application is a meaningful step forward.
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className={styles.notice} aria-live="polite" role="status">
          {notice}
        </p>
      </div>
    </section>
  );
}
