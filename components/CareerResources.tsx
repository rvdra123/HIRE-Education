"use client";
import Link from "next/link";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  Flag,
  FolderKanban,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MapPin,
  MessageSquare,
  Monitor,
  ShieldCheck,
  Shuffle,
  Sparkles,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import styles from "./career-resources.module.css";
import Brand from "./Brand";
import CareerPractice from "./CareerPractice";

type CareerSkill = {
  title: string;
  description: string;
  icon: LucideIcon;
  means: string;
  matters: string;
  build: string;
  prove: string;
};

export const skills: CareerSkill[] = [
  {
    title: "Communication",
    description: "Explain ideas clearly and listen to others.",
    icon: MessageSquare,
    means:
      "Sharing information clearly and listening to understand someone else.",
    matters:
      "Clear questions and updates help a team avoid mistakes and support customers.",
    build:
      "Present a class project, write a club update, or practise explaining a task to a friend.",
    prove:
      "Describe how you explained an idea, answered questions, or kept a group informed.",
  },
  {
    title: "Teamwork",
    description: "Contribute to a team and support others.",
    icon: UsersRound,
    means:
      "Working with others toward a shared goal while respecting different ideas.",
    matters:
      "Most jobs depend on people sharing tasks and supporting one another.",
    build:
      "Join a school club, sports team, hackathon, or community volunteer project.",
    prove:
      "Explain your role in a group project, what you contributed, and what the team achieved.",
  },
  {
    title: "Leadership",
    description: "Help a group work toward a shared goal.",
    icon: Flag,
    means: "Taking responsibility and helping people work toward a goal.",
    matters:
      "Employers value people who can guide a task, support teammates, and follow through.",
    build:
      "Organize a small event, mentor a younger student, or lead one part of a club project.",
    prove:
      "Share a specific example of something you organized and how you helped others succeed.",
  },
  {
    title: "Reliability",
    description: "Keep commitments and communicate early.",
    icon: ShieldCheck,
    means: "Being prepared, arriving on time, and doing what you agreed to do.",
    matters:
      "A team needs to know that people will complete their work and communicate early.",
    build:
      "Keep a regular volunteer commitment and give notice when a plan needs to change.",
    prove:
      "Describe a commitment you maintained, its length, and the responsibilities you fulfilled.",
  },
  {
    title: "Time management",
    description: "Make a plan that works in real life.",
    icon: Clock3,
    means:
      "Planning your time, choosing priorities, and meeting reasonable deadlines.",
    matters:
      "Workplaces have busy periods and competing tasks that need a clear plan.",
    build:
      "Use a calendar to balance assignments, activities, and your personal time.",
    prove:
      "Explain how you planned a busy week or completed a project with several deadlines.",
  },
  {
    title: "Organization",
    description: "Keep the details moving in the right direction.",
    icon: FolderKanban,
    means: "Keeping information, materials, and tasks easy to find and use.",
    matters:
      "Good organization saves time and helps prevent important details being missed.",
    build:
      "Maintain a club task board, create a shared folder, or organize event materials.",
    prove:
      "Show a checklist, schedule, or system you created and explain how it helped.",
  },
  {
    title: "Problem solving",
    description: "Work through a problem and test a solution.",
    icon: Lightbulb,
    means:
      "Understanding a problem, considering options, and testing a sensible solution.",
    matters:
      "Unexpected issues happen at work. A thoughtful response keeps things moving.",
    build:
      "Debug a personal project, work through a competition challenge, or improve a club process.",
    prove:
      "Walk through the problem, the action you took, and what changed as a result.",
  },
  {
    title: "Customer service",
    description: "Help people feel heard and supported.",
    icon: HeartHandshake,
    means:
      "Listening to someone’s needs and helping them in a patient, respectful way.",
    matters:
      "Helpful service builds trust with customers, visitors, and community members.",
    build:
      "Welcome guests at a school event, support a fundraiser, or help at a community program.",
    prove:
      "Describe a time you answered questions, solved a small issue, or helped someone find what they needed.",
  },
  {
    title: "Adaptability",
    description: "Stay open when the plan changes.",
    icon: Shuffle,
    means:
      "Adjusting to new tools, people, or situations and being willing to learn.",
    matters:
      "Tasks and priorities change. Teams need people who respond constructively.",
    build:
      "Try an unfamiliar role, learn a new tool, or help adjust a plan when circumstances change.",
    prove:
      "Explain what changed, how you adjusted, and what you learned from the experience.",
  },
  {
    title: "Initiative",
    description: "Notice a need. Take a useful first step.",
    icon: Zap,
    means:
      "Taking a helpful action without waiting to be reminded, within your role.",
    matters:
      "People who notice opportunities to help make a workplace run more smoothly.",
    build:
      "Suggest an improvement, start a small personal project, or offer to take on a clear task.",
    prove:
      "Give an example of an idea you put into action and the useful outcome it produced.",
  },
  {
    title: "Digital skills",
    description: "Use everyday tools with confidence.",
    icon: Monitor,
    means:
      "Using digital tools effectively, checking information, and handling data responsibly.",
    matters:
      "Many student roles use email, documents, spreadsheets, and scheduling tools.",
    build:
      "Create a spreadsheet, build a simple website, or complete a practical beginner course.",
    prove:
      "Name the tool and show what you made with it, such as a budget sheet or project portfolio.",
  },
  {
    title: "Professionalism",
    description: "Be respectful, prepared, and accountable.",
    icon: BriefcaseBusiness,
    means:
      "Communicating respectfully, being prepared, and taking responsibility for your work.",
    matters:
      "Respectful conduct helps everyone work safely and confidently together.",
    build:
      "Practise clear emails, ask for feedback, and own mistakes with a plan to fix them.",
    prove:
      "Explain how you handled feedback or a difficult situation respectfully and responsibly.",
  },
];

const experienceSteps = [
  {
    title: "Participate",
    label: "Find your starting point",
    description:
      "Join a school club, team, community program, or competition. Show up and learn how it works.",
  },
  {
    title: "Contribute",
    label: "Make yourself useful",
    description:
      "Help with one real task: set up an event, make a poster, tutor a classmate, or test a project.",
  },
  {
    title: "Take responsibility",
    label: "Own a small piece",
    description:
      "Manage a sign-up list, maintain a schedule, or finish a personal project. Follow through.",
  },
  {
    title: "Lead",
    label: "Help someone else succeed",
    description:
      "Coordinate a small team, mentor a new member, or organize an activity from start to finish.",
  },
  {
    title: "Show results",
    label: "Turn experience into evidence",
    description:
      "Save your work, ask for feedback, and write down what you did and what changed.",
  },
];

type ResourceCategory =
  | "Jobs & work"
  | "Resume & interviews"
  | "Explore your path"
  | "Local & community"
  | "LinkedIn";
type Resource = {
  title: string;
  organization: string;
  category: ResourceCategory;
  description: string;
  url: string;
  mark: string;
};

const resourceCategories: ResourceCategory[] = [
  "Jobs & work",
  "Resume & interviews",
  "Explore your path",
  "Local & community",
  "LinkedIn",
];

export const resources: Resource[] = [
  {
    title: "Find your first job",
    organization: "Government of Canada · Job Bank",
    category: "Jobs & work",
    description:
      "Search by Brampton and review the experience, schedule, and eligibility listed by each employer.",
    url: "https://www.jobbank.gc.ca/",
    mark: "CA",
  },
  {
    title: "Youth employment support",
    organization: "Government of Ontario",
    category: "Jobs & work",
    description:
      "Explore Ontario programs that help young people build skills, prepare for work, and look for a job.",
    url: "https://www.ontario.ca/page/get-help-finding-youth-or-student-job",
    mark: "ON",
  },
  {
    title: "Student & graduate jobs",
    organization: "Government of Canada",
    category: "Jobs & work",
    description:
      "Explore federal student employment programs and read each program’s current eligibility before applying.",
    url: "https://www.canada.ca/en/services/jobs/opportunities/student.html",
    mark: "CA",
  },
  {
    title: "Build a clear resume",
    organization: "Government of Canada · Job Bank",
    category: "Resume & interviews",
    description:
      "Use official resume advice and the Resume Builder. An account may be needed for some tools.",
    url: "https://www.jobbank.gc.ca/findajob/resume-builder",
    mark: "JB",
  },
  {
    title: "Prepare for an interview",
    organization: "Government of Canada · Job Bank",
    category: "Resume & interviews",
    description:
      "Get practical guidance for preparing answers, researching employers, and following up after an interview.",
    url: "https://www.jobbank.gc.ca/findajob/resources",
    mark: "JB",
  },
  {
    title: "Find employment services",
    organization: "Employment Ontario",
    category: "Resume & interviews",
    description:
      "Find local help with job searching, applications, training, and interview preparation. Confirm service eligibility.",
    url: "https://www.ontario.ca/page/employment-ontario",
    mark: "ON",
  },
  {
    title: "Explore skilled trades",
    organization: "Ontario Youth Apprenticeship Program",
    category: "Explore your path",
    description:
      "Learn about exploring an apprenticeship through high school co-op. Ask your school about participation.",
    url: "https://oyap.com/",
    mark: "OY",
  },
  {
    title: "Explore careers",
    organization: "Government of Canada · Job Bank",
    category: "Explore your path",
    description:
      "Compare occupations, typical education, job duties, wages, and outlooks as you explore possible paths.",
    url: "https://www.jobbank.gc.ca/career-planning",
    mark: "JB",
  },
  {
    title: "Plan your next school step",
    organization: "Government of Ontario",
    category: "Explore your path",
    description:
      "Understand Ontario high school graduation requirements, including community involvement and career planning.",
    url: "https://www.ontario.ca/page/high-school-graduation-requirements",
    mark: "ON",
  },
  {
    title: "Discover your city",
    organization: "City of Brampton",
    category: "Local & community",
    description:
      "Visit the City’s official website for recreation, community programs, volunteering, and municipal careers.",
    url: "https://www.brampton.ca/",
    mark: "BR",
  },
  {
    title: "Find community connections",
    organization: "Volunteer MBC",
    category: "Local & community",
    description:
      "Explore volunteer listings across Mississauga, Brampton, and Caledon. Check each role’s age and hour requirements.",
    url: "https://volunteermbc.org/",
    mark: "VM",
  },
  {
    title: "Learn with your library",
    organization: "Brampton Library",
    category: "Local & community",
    description:
      "Explore library learning resources, programs, and youth information. Some services require a library card.",
    url: "https://www.bramptonlibrary.ca/",
    mark: "BL",
  },
  {
    title: "Explore Peel services",
    organization: "Region of Peel",
    category: "Local & community",
    description:
      "Find community services and official regional programs relevant to students and families in Brampton.",
    url: "https://www.peelregion.ca/",
    mark: "PL",
  },
  {
    title: "Start your professional profile",
    organization: "LinkedIn Help",
    category: "LinkedIn",
    description:
      "Learn how LinkedIn profiles work. Review the platform’s current age requirements and privacy settings first.",
    url: "https://www.linkedin.com/help/linkedin",
    mark: "in",
  },
  {
    title: "Add a certification",
    organization: "LinkedIn Help",
    category: "LinkedIn",
    description:
      "In LinkedIn Help, search “licenses and certifications” for instructions on adding your credential and verification link.",
    url: "https://www.linkedin.com/help/linkedin",
    mark: "in",
  },
];

const faqs = [
  {
    question: "Do I need job experience to make a resume?",
    answer:
      "No. School projects, volunteering, clubs, sports, personal projects, and certifications can all show useful skills. Explain what you did and what you learned, and label each experience honestly.",
  },
  {
    question: "Can volunteer work count as experience?",
    answer:
      "Absolutely. Describe your role, responsibilities, and contributions just as clearly as paid work. For Ontario community involvement hours, confirm that an activity is eligible with your school before you start, and keep the required records.",
  },
  {
    question: "Can I add online certifications to LinkedIn?",
    answer:
      "Yes, when you have earned a real credential. Use the exact certification name, issuing organization, issue date, and credential URL or ID if provided. A completed course is not always a certification, so check what the provider actually awards.",
  },
  {
    question: "How old do I need to be to work in Ontario?",
    answer:
      "Minimum ages depend on the workplace and type of work, and school attendance rules also apply. Check Ontario’s official minimum-age guidance and the employer’s stated requirements for the specific role.",
    link: {
      label: "Read Ontario’s minimum-age guidance",
      url: "https://www.ontario.ca/page/minimum-age-work",
    },
  },
  {
    question: "How do I know an opportunity is still available?",
    answer:
      "Open the organization’s official website and check the posting date, deadline, eligibility, and application instructions. The opportunities on HIRE Education point you toward sources to explore; they do not guarantee that a position is open. If anything is unclear, contact the organization through its official channel.",
  },
  {
    question: "Should my student resume be one page?",
    answer:
      "One page is usually a good goal for a high school student. Choose the experience and skills most relevant to the role, use clear headings and short bullet points, and leave enough space for the page to be easy to read.",
  },
];

export default function CareerResources() {
  const [resourceCategory, setResourceCategory] =
    useState<ResourceCategory>("Jobs & work");
  const visibleResources = resources.filter(
    (resource) => resource.category === resourceCategory,
  );

  return (
    <>
      <section
        id="skills"
        className={styles.skillsSection}
        aria-labelledby="skills-title"
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <span className="eyebrow">
                <Sparkles size={14} aria-hidden="true" /> CAREER SKILLS
              </span>
              <h2 id="skills-title" className="section-title">
                Skills employers{" "}
                <span className={styles.softText}>look for.</span>
              </h2>
              <p className="section-description">
                You’re building them in class, in your community, and in
                everyday life. Learn how to make them count.
              </p>
            </div>
            <span className={styles.headingHint}>
              <ChevronDown size={15} aria-hidden="true" /> Open a skill to
              explore
            </span>
          </div>
          <div className={styles.skillsGrid}>
            {skills.map((skill, index) => (
              <details className={styles.skillCard} key={skill.title}>
                <summary>
                  <span className={styles.skillIcon}>
                    <skill.icon
                      size={20}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <span className={styles.skillTitleRow}>
                    <h3>{skill.title}</h3>
                    <ChevronDown
                      size={17}
                      className={styles.accordionChevron}
                      aria-hidden="true"
                    />
                  </span>
                  <span className={styles.skillDescription}>
                    {skill.description}
                  </span>
                  <span className={styles.skillNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </summary>
                <div className={styles.skillBody}>
                  <p>
                    <strong>What it means</strong>
                    {skill.means}
                  </p>
                  <p>
                    <strong>Why employers care</strong>
                    {skill.matters}
                  </p>
                  <p>
                    <strong>Build it</strong>
                    {skill.build}
                  </p>
                  <p>
                    <strong>Prove it</strong>
                    {skill.prove}
                  </p>
                </div>
              </details>
            ))}
          </div>
          <p className={styles.sectionFootnote}>
            <Check size={15} aria-hidden="true" /> A specific example beats a
            long list of skills. Show what you did, not just what you’re good
            at.
          </p>
        </div>
      </section>

      <CareerPractice />
      <details className="container experience-disclosure">
        <summary>How to gain experience before your first job</summary>{" "}
        <section
          id="experience"
          className={styles.experienceSection}
          aria-labelledby="experience-title"
        >
          <div className={`container ${styles.experienceLayout}`}>
            <div className={styles.experienceIntro}>
              <span className="eyebrow">
                <Flag size={14} aria-hidden="true" /> EVERYONE STARTS SOMEWHERE
              </span>
              <h2 id="experience-title" className="section-title">
                No experience?
                <br />
                <span className={styles.softText}>Start here.</span>
              </h2>
              <p className="section-description">
                Your first step doesn’t have to be a job. It can be showing up,
                trying something new, and taking a little more responsibility
                each time.
              </p>
              <div className={styles.firstStepBox}>
                <span className={styles.firstStepIcon}>
                  <Lightbulb size={21} aria-hidden="true" />
                </span>
                <div>
                  <strong>Your next two weeks</strong>
                  <p>
                    Choose one club, volunteer source, or project. Take one
                    small action. Keep a note of what you learn.
                  </p>
                </div>
              </div>
              <a href="#opportunities" className="btn btn-outline">
                Find your starting point{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <p className={styles.schoolNote}>
                <MapPin size={14} aria-hidden="true" /> Start at your school or
                in your Brampton community.
              </p>
            </div>
            <ol className={styles.experienceLadder}>
              {experienceSteps.map((step, index) => (
                <li key={step.title}>
                  <span className={styles.stepNumber}>
                    {index === 4 ? (
                      <Check size={18} aria-hidden="true" />
                    ) : (
                      `0${index + 1}`
                    )}
                  </span>
                  <div className={styles.stepContent}>
                    <span>{step.label}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                  {index < experienceSteps.length - 1 && (
                    <ArrowDown
                      className={styles.stepArrow}
                      size={15}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </details>

      <section
        id="resources"
        className={styles.resourcesSection}
        aria-labelledby="resources-title"
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <span className="eyebrow">
                <BookOpen size={14} aria-hidden="true" /> RESOURCE LIBRARY
              </span>
              <h2 id="resources-title" className="section-title">
                Career resource library
              </h2>
              <p className="section-description">
                A shortcut to useful tools and trusted sources, chosen with
                Brampton high school students in mind.
              </p>
            </div>
            <span className={styles.externalHint}>
              <ExternalLink size={14} aria-hidden="true" /> Official & community
              sources
            </span>
          </div>
          <div
            className={styles.resourceTabs}
            role="group"
            aria-label="Filter career resources by topic"
          >
            {resourceCategories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={resourceCategory === category}
                className={
                  resourceCategory === category ? styles.activeTab : ""
                }
                onClick={() => setResourceCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className={styles.resourceResultHeader} aria-live="polite">
            <span>{resourceCategory}</span>
            <span>{visibleResources.length} resources</span>
          </div>
          <div className={styles.resourceGrid}>
            {visibleResources.map((resource) => (
              <a
                className={styles.resourceCard}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                key={resource.title}
              >
                <div className={styles.resourceTop}>
                  <span className={styles.resourceMark}>{resource.mark}</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </div>
                <span className={styles.resourceOrganization}>
                  {resource.organization}
                </span>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <span className={styles.resourceLink}>
                  Visit official website{" "}
                  <ExternalLink size={12} aria-hidden="true" />
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </span>
              </a>
            ))}
          </div>
          <p className={styles.resourceNotice}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              Requirements, programs, and availability can change. Always
              confirm details at the official source before you apply or sign
              up.
            </span>
          </p>
        </div>
      </section>

      <section
        id="faq"
        className={styles.faqSection}
        aria-labelledby="faq-title"
      >
        <div className={`container ${styles.faqLayout}`}>
          <div className={styles.faqIntro}>
            <span className="eyebrow">LET’S CLEAR A FEW THINGS UP</span>
            <h2 id="faq-title" className="section-title">
              Common questions
            </h2>
            <p className="section-description">
              Taking your first step comes with questions. Here are a few we
              hear a lot.
            </p>
            <span className={styles.faqTag}>
              <GraduationCap size={17} aria-hidden="true" /> Made for your first
              steps
            </span>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details className={styles.faqItem} key={faq.question}>
                <summary>
                  <h3>{faq.question}</h3>
                  <ChevronDown
                    size={18}
                    className={styles.accordionChevron}
                    aria-hidden="true"
                  />
                </summary>
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                  {faq.link && (
                    <a
                      href={faq.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {faq.link.label}{" "}
                      <ExternalLink size={13} aria-hidden="true" />
                      <span className={styles.srOnly}>
                        {" "}
                        (opens in a new tab)
                      </span>
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalSection} aria-labelledby="start-title">
        <div className={`container ${styles.finalCta}`}>
          <div className={styles.ctaDecoration} aria-hidden="true">
            <GraduationCap />
            <span />
            <span />
          </div>
          <div className={styles.ctaContent}>
            <span className={styles.ctaEyebrow}>
              <span /> FIND YOUR NEXT OPPORTUNITY
            </span>
            <h2 id="start-title">Explore your next opportunity</h2>
            <p>
              Browse local opportunities, check the requirements, and prepare
              your application.
            </p>
            <div className={styles.ctaActions}>
              <a href="#opportunities" className="btn btn-primary">
                Explore opportunities{" "}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a href="#resume" className={styles.ctaSecondary}>
                Build your resume <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <Brand footer />
              <p>
                Helping students build skills, gain experience,
                <br className={styles.desktopBreak} /> and get ready for what
                comes next.
              </p>
              <span className={styles.bramptonTag}>
                <MapPin size={13} aria-hidden="true" /> For high school students
                in Brampton, Ontario.
              </span>
            </div>
            <div className={styles.footerLinks}>
              <h3>Explore</h3>
              <a href="#about">About HIRE Education</a>
              <a href="#certifications">Certifications</a>
              <a href="#opportunities">Opportunities</a>
            </div>
            <div className={styles.footerLinks}>
              <h3>Build your future</h3>
              <a href="#resume">Resume & cover letter</a>
              <a href="#skills">Career skills</a>
              <a href="#resources">Resource library</a>
            </div>
            <div className={styles.footerConnect}>
              <h3>Your privacy</h3>
              <span>External sources open in a new tab</span>
              <span>No account required</span>
              <Link href="/privacy" prefetch={false}>
                Privacy policy
              </Link>
              <div className={styles.communityBadge}>
                <span /> A student-focused initiative
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>
              © {new Date().getFullYear()} HIRE Education. Built to help you
              take your next step.
            </p>
            <a href="#home">
              Back to top <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
          <p className={styles.affiliation}>
            HIRE Education is an independent student-focused initiative and is
            not affiliated with the external organizations listed unless
            specifically stated. External links open in a new tab.
          </p>
        </div>
      </footer>
    </>
  );
}
