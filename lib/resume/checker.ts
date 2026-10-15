import type { ResumeReview } from "../openai/schema";

export type CheckCategory = keyof ResumeReview["scores"];
export type ResumeCheck = {
  category: CheckCategory;
  label: string;
  passed: boolean;
  evidence: string;
};
export type ChecklistReview = ResumeReview & {
  method: "checklist-v1";
  checks: ResumeCheck[];
  keywords: { label: string; matched: boolean }[];
  wordCount: number;
  bulletCount: number;
};

// These are text signals, not conclusions about a student's abilities.
const concepts: [string, RegExp][] = [
  [
    "Customer service",
    /\bcustomer (?:service|support|care)|\b(?:help(?:ed|ing)?|assist(?:ed|ing)?|serv(?:e|ed|ing)) customers\b/i,
  ],
  ["Communication", /\b(?:communicat(?:e|ed|ing|ion|ions)|public speaking)\b/i],
  [
    "Teamwork",
    /\bteamwork|\bteam player|\bteam (?:member|project)|\bwork(?:ed|ing)? (?:in|with|as part of) a team|\bcollaborat(?:e|ed|ion|ing)\b/i,
  ],
  [
    "Reliability",
    /\breliab(?:le|ility)|\bdependab(?:le|ility)|\bpunctual(?:ity)?\b/i,
  ],
  [
    "Organization",
    /\borgani[sz](?:e|ed|ing|ation|ational)|\bprioriti[sz](?:e|ed|ing)\b/i,
  ],
  [
    "Time management",
    /\btime management|\bmeet(?:ing)? deadlines|\bmet deadlines\b/i,
  ],
  [
    "Leadership",
    /\bleadership|\bled a team|\bteam leader|\bmentoring|\bmentored\b/i,
  ],
  [
    "Problem solving",
    /\bproblem[ -]solv(?:ing|er)|\bsolv(?:e|ed|ing) problems|\btroubleshoot(?:ing)?\b/i,
  ],
  [
    "Attention to detail",
    /\battention to detail|\bdetail[ -]oriented|\baccuracy|\baccurate(?:ly)?\b/i,
  ],
  [
    "Cash handling",
    /\bcash handl(?:ing|er)|\bhandled cash|\bcash register|\bcashier\b/i,
  ],
  ["Point of sale", /\bpoint[ -]of[ -]sale|\bPOS\b/i],
  ["Stocking", /\bstock(?:ing|ed)|\brestock(?:ing|ed)?|\bshelv(?:ing|es)\b/i],
  ["Inventory", /\binventor(?:y|ies)\b/i],
  ["Sales", /\bsales|\bselling|\bupsell(?:ing)?\b/i],
  ["Food safety", /\bfood (?:safety|handler|handling)|\bfood[ -]safe\b/i],
  [
    "Food preparation",
    /\bfood prep(?:aration)?|\bprepar(?:e|ed|ing) food|\bcook(?:ing)?\b/i,
  ],
  ["Cleaning", /\bclean(?:ing|ed)|\bsaniti[sz](?:e|ed|ing|ation)|\bhygiene\b/i],
  ["First aid", /\bfirst[ -]aid|\bCPR\b/i],
  [
    "Lifeguarding",
    /\blifeguard(?:ing)?|\bnational lifeguard|\bbronze (?:cross|medallion)\b/i,
  ],
  [
    "Working with children",
    /\bchildren|\bchildcare|\bchild care|\bday camp|\bcamp counsel(?:l)?or\b/i,
  ],
  ["Safety", /\bsafety|\bsafe environment|\bsafety procedures\b/i],
  [
    "Conflict resolution",
    /\bconflict (?:resolution|management)|\bde[ -]?escalat(?:e|ion|ing)\b/i,
  ],
  ["Coaching", /\bcoach(?:ing|ed)?|\btutor(?:ing|ed)?\b/i],
  ["Event support", /\bevent(?:s)?|\bregistration desk\b/i],
  ["Microsoft Excel", /\bexcel|\bspreadsheets?\b/i],
  ["Microsoft Word", /\bmicrosoft word|\bMS word\b/i],
  ["Google Workspace", /\bgoogle (?:workspace|docs|sheets|slides)\b/i],
  ["Data entry", /\bdata entry|\benter(?:ing|ed) data\b/i],
  ["Social media", /\bsocial media|\binstagram|\btiktok\b/i],
  ["Design", /\bgraphic design|\bcanva|\bphotoshop|\billustrator\b/i],
  [
    "Programming",
    /\bprogramming|\bcoding|\bpython|\bjavascript|\btypescript\b/i,
  ],
  ["Accessibility", /\baccessibility|\bAODA|\baccommodation(?:s)?\b/i],
  ["French", /\bfrench|\bfran[cç]ais\b/i],
  ["WHMIS", /\bWHMIS\b/i],
];
const stopWords = new Set(
  "about above across after again against ages all also and any apply applying applicant applicants application applications are area assist assistant available availability based because been before being below benefits between both brampton business can canada canadian candidate candidates career careers certificate certification check city come company contact could currently customer day days description details duties each education eligibility email employer employment equal even every excellent experience experienced fast first following for free from full get give good grade great greater grow had has have having help here high hire hiring hours how ideal including information interested interview job jobs join keep key know learn letter like live local looking make may meet member members month more most must name need needed new next no not now offer offers office old one only ontario opportunity opportunities organization our out over part people per person please position posting preferred previous program provide provided qualifications qualify race read receive required requirements responsibilities responsible resume role roles salary school see send service services shift should skills some staff start student students successful such summer support take team than that the their them then there these they this those through time times title together too training two under university up use used using value values volunteer volunteers volunteering want was way we website week welcome well were what when where whether which while who will with within without work worked worker working workplace works would year years you your youth".split(
    /\s+/,
  ),
);
const actionStart =
  /^(?:achieved|arranged|assisted|built|cared|coached|collaborated|collected|completed|coordinated|created|delivered|designed|developed|edited|explained|greeted|guided|helped|improved|led|maintained|managed|organized|organised|planned|prepared|presented|provided|raised|recorded|resolved|scheduled|served|set up|sorted|stocked|supported|taught|tracked|trained|tutored|updated|volunteered|wrote|achieve|arrange|assist|build|care|coach|collaborate|collect|complete|coordinate|create|deliver|design|develop|edit|explain|greet|guide|help|improve|lead|maintain|manage|organize|organise|plan|prepare|present|provide|raise|record|resolve|schedule|serve|sort|stock|support|teach|track|train|tutor|update|volunteer|write)\b/i;
const headings = {
  education:
    /^(?:(?:school|academic)\s*(?:&|and)?\s*)?education(?:\s*(?:&|and)\s*(?:qualifications|training))?$|^academic (?:background|qualifications)$/i,
  experience:
    /^(?:(?:work|volunteer|volunteering|school|leadership|relevant|community|professional|extracurricular|project|employment)\s*(?:&|and)?\s*)*(?:experience|projects|activities|employment|volunteering|community involvement|clubs|achievements|extracurriculars)$/i,
  skills:
    /^(?:(?:technical|key|relevant|personal|core)\s+)?skills(?:\s*(?:&|and)\s*(?:certifications|interests|qualifications))?$/i,
};
const words = (text: string) =>
  text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
const cleanLine = (line: string) =>
  line.replace(/^\s*(?:[•●▪◦*–-]|\d+[.)])\s*/, "").trim();
const plainForMatch = (text: string) =>
  text.replace(
    /https?:\/\/\S+|\b[A-Z0-9._%+-]{1,80}@[A-Z0-9.-]{1,200}\.[A-Z]{2,24}\b/gi,
    " ",
  );
function keywordSignals(description: string) {
  const text = plainForMatch(description);
  const selected = concepts.filter(([, pattern]) => pattern.test(text));
  const stripped = selected.reduce(
    (value, [, regex]) => value.replace(new RegExp(regex.source, "gi"), " "),
    text,
  );
  const counts = new Map<string, number>();
  for (const word of stripped.toLowerCase().match(/\b[a-z][a-z+#-]{3,24}\b/g) ||
    []) {
    if (!stopWords.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
  }
  const extra = [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, selected.length >= 3 ? 0 : Math.max(0, 8 - selected.length));
  return [
    ...selected,
    ...extra.map(
      ([label]) =>
        [
          label,
          new RegExp(
            `\\b${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i",
          ),
        ] as [string, RegExp],
    ),
  ].slice(0, 20);
}

export function checkResume(input: {
  resume: string;
  description: string;
}): ChecklistReview {
  const resume = input.resume.replace(/\r\n?/g, "\n").trim();
  const description = input.description.trim();
  const wordCount = words(resume).length;
  if (resume.length > 50000 || wordCount < 40)
    throw new Error(
      "Add at least 40 words of resume text, up to 50,000 characters. Include your education and a school, work, or volunteer example.",
    );
  if (
    description.length < 60 ||
    description.length > 16000 ||
    words(description).length < 12
  )
    throw new Error(
      "Paste at least 12 words and 60 characters from the posting, up to 16,000 characters. Include its responsibilities and skills.",
    );
  const lines = resume
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const normalizedLines = lines.map((line) =>
    cleanLine(line).replace(/\s+/g, " ").replace(/:$/, ""),
  );
  const has = (type: keyof typeof headings) =>
    normalizedLines.some(
      (line) => line.length <= 90 && headings[type].test(line),
    );
  const bullets = lines
    .filter((line) => {
      const clean = cleanLine(line);
      const count = words(clean).length;
      return (
        count >= 3 &&
        count <= 90 &&
        (/^\s*[•●▪◦*–-]\s+/.test(line) ||
          actionStart.test(clean) ||
          /^(?:responsible for|duties included)\b/i.test(clean))
      );
    })
    .map(cleanLine)
    .slice(0, 60);
  const actionBullets = bullets.filter((line) => actionStart.test(line));
  const conciseBullets = bullets.filter(
    (line) => words(line).length >= 8 && words(line).length <= 35,
  );
  const contextBullets = bullets.filter(
    (line) =>
      words(line).length >= 8 &&
      /\b(?:for|with|using|during|through|by|at|to)\b/i.test(line),
  );
  const resultBullets = bullets.filter((line) =>
    /\b(?:so that|result(?:ed|ing)?|improv(?:ed|ing)|complet(?:ed|ing)|rais(?:ed|ing)|deliver(?:ed|ing)|creat(?:ed|ing)|present(?:ed|ing)|finish(?:ed|ing)|help(?:ed|ing))\b/i.test(
      line,
    ),
  );
  const keywords = keywordSignals(description).map(([label, pattern]) => ({
    label,
    matched: pattern.test(plainForMatch(resume)),
  }));
  if (keywords.length < 2)
    throw new Error(
      "Add more of the posting’s responsibilities and skills so there is enough detail to compare.",
    );
  const matched = keywords.filter((item) => item.matched);
  const missing = keywords.filter((item) => !item.matched);
  const skillNames = concepts.filter(([, pattern]) =>
    pattern.test(plainForMatch(resume)),
  );
  const skillExamples = concepts.filter(([, pattern]) =>
    pattern.test(bullets.join("\n")),
  );
  const checks: ResumeCheck[] = [];
  const add = (
    category: CheckCategory,
    label: string,
    passed: boolean,
    evidence: string,
  ) => checks.push({ category, label, passed, evidence });
  add(
    "formatting",
    "Education heading",
    has("education"),
    has("education")
      ? "Found a standard education heading."
      : "Use a heading such as Education above your school information.",
  );
  add(
    "formatting",
    "Experience or projects heading",
    has("experience"),
    has("experience")
      ? "Found an experience, projects, activities, or volunteering heading."
      : "Add a heading such as Projects, Experience, or Volunteering. Paid work is not required.",
  );
  add(
    "formatting",
    "Skills heading",
    has("skills"),
    has("skills")
      ? "Found a skills heading."
      : "Put relevant skills under a Skills heading.",
  );
  add(
    "formatting",
    "Separate lines",
    lines.length >= 6,
    `${lines.length} non-empty lines found. Separate headings, entries, and bullets with line breaks.`,
  );
  add(
    "formatting",
    "Student-length content",
    wordCount >= 80 && wordCount <= 650,
    `${wordCount} words found. This check uses an 80–650 word range for a short student resume, not a page-count estimate.`,
  );
  add(
    "content",
    "At least one action-led bullet",
    actionBullets.length >= 1,
    `${actionBullets.length} bullets start with a recognized action verb.`,
  );
  add(
    "content",
    "Mostly action-led bullets",
    bullets.length >= 2 && actionBullets.length / bullets.length >= 0.6,
    "Aim to start most bullets with an action such as Organized, Prepared, or Helped.",
  );
  add(
    "content",
    "A specific task or context",
    contextBullets.length >= 1,
    contextBullets[0]
      ? `Example text: “${contextBullets[0].slice(0, 220)}”`
      : "Explain what you did, who it was for, or what you used.",
  );
  add(
    "content",
    "An outcome or completed contribution",
    resultBullets.length >= 1,
    "Look for a truthful completed contribution or outcome. Numbers are optional and should never be invented.",
  );
  add(
    "content",
    "Enough detail in most bullets",
    bullets.length >= 2 && conciseBullets.length / bullets.length >= 0.6,
    `${conciseBullets.length} of ${bullets.length} detected bullets have 8–35 words. This is a rough writing guide.`,
  );
  add(
    "experience",
    "An experience section",
    has("experience"),
    "School projects, sports, clubs, caring responsibilities, and volunteering can all count.",
  );
  add(
    "experience",
    "A recognizable example",
    /\b(?:project|club|team|volunteer|employment|work|tutor|coach|babysit|caregiv|event|fundrais|council|committee|family)\w*\b/i.test(
      resume,
    ),
    "Looked for words referring to a project, activity, work, volunteering, or caring responsibility.",
  );
  add(
    "experience",
    "One contribution described",
    bullets.length >= 1,
    `${bullets.length} possible experience bullets detected from bullet markers or action-led lines.`,
  );
  add(
    "experience",
    "Two contributions described",
    bullets.length >= 2,
    "Two distinct contributions help a reader understand your experience. They can come from the same activity.",
  );
  add(
    "experience",
    "Your action is visible",
    actionBullets.length >= 1 && contextBullets.length >= 1,
    "An action-led bullet and a task or context signal were found when this check passes. This does not verify the experience.",
  );
  add(
    "skills",
    "Skills section",
    has("skills"),
    "Keep relevant skills easy to find under a conventional heading.",
  );
  add(
    "skills",
    "Two recognized skill terms",
    skillNames.length >= 2,
    `${skillNames.length} terms recognized from a small student-role vocabulary. Unrecognized skills are not judged.`,
  );
  add(
    "skills",
    "Three recognized skill terms",
    skillNames.length >= 3,
    "List only skills you can explain. This check cannot recognize every technical skill or language.",
  );
  add(
    "skills",
    "A skill term in an example",
    skillExamples.length >= 1,
    skillExamples.length
      ? `Recognized in bullets: ${skillExamples.map(([label]) => label).join(", ")}.`
      : "If relevant, connect a skill to an experience bullet instead of only listing it.",
  );
  add(
    "skills",
    "Two skill terms in examples",
    skillExamples.length >= 2,
    "This checks for two recognized skill terms in your bullets, not proof of proficiency.",
  );
  add(
    "ats",
    "Readable characters",
    !/[\uFFFD\u0000]/.test(resume),
    "Replacement or null characters can mean document text was extracted incorrectly.",
  );
  add(
    "ats",
    "Words are not spaced letter by letter",
    !/\b(?:[A-Z] ){5,}[A-Z]\b/.test(resume),
    "Letter-by-letter headings can be difficult for text extraction.",
  );
  add(
    "ats",
    "No dense text block",
    lines.filter((line) => line.length > 240).length <=
      Math.floor(lines.length / 5),
    "Lines above 240 characters are flagged when they make up more than a fifth of your text. Extraction can affect line breaks.",
  );
  add(
    "ats",
    "Bullets are reasonably short",
    bullets.length > 0 && bullets.every((line) => words(line).length <= 45),
    "Detected bullets should usually stay under 45 words.",
  );
  add(
    "ats",
    "Conventional section labels",
    has("education") && has("experience"),
    "Recognized Education plus Experience, Projects, Activities, or Volunteering.",
  );
  const placeholders =
    /\b(?:lorem ipsum|insert (?:your|name|school)|your name|your school|your email|example@email|xxx+)\b|\[(?:add|insert|your)[^\]]*\]/i;
  const personalPronouns =
    /\b(?:I am|I have|I was|I helped|my duties|my responsibilities)\b/i;
  const vague =
    /\b(?:hard[ -]working|go[ -]getter|goes above and beyond|best candidate|perfect candidate)\b/i;
  add(
    "professionalism",
    "No obvious template placeholders",
    !placeholders.test(resume),
    "Replace placeholder names and bracketed template instructions with your own information.",
  );
  add(
    "professionalism",
    "Direct resume wording",
    !personalPronouns.test(resume),
    "Bullets usually work well starting with an action instead of I or My.",
  );
  add(
    "professionalism",
    "No stock self-praise",
    !vague.test(resume),
    "Concrete examples are more useful than phrases such as hard-working or perfect candidate.",
  );
  add(
    "professionalism",
    "No repeated bullet lines",
    new Set(bullets.map((line) => line.toLowerCase())).size === bullets.length,
    "Repeated bullets may be an editing or extraction issue.",
  );
  add(
    "professionalism",
    "Consistent bullet capitalization",
    bullets.length > 0 && bullets.every((line) => /^[A-Z\p{Lu}\d]/u.test(line)),
    "Start detected bullets consistently. This is not a spelling or grammar check.",
  );
  for (const keyword of keywords)
    add(
      "jobRelevance",
      keyword.label,
      keyword.matched,
      keyword.matched
        ? "Found this term or a listed related phrase in your text."
        : "Not found by the text matcher. Add it only if it truthfully describes you.",
    );
  const scores = Object.fromEntries(
    (
      [
        "formatting",
        "content",
        "experience",
        "skills",
        "ats",
        "professionalism",
        "jobRelevance",
      ] as CheckCategory[]
    ).map((category) => {
      const group = checks.filter((check) => check.category === category);
      return [
        category,
        Math.round(
          (group.filter((check) => check.passed).length / group.length) * 10,
        ),
      ];
    }),
  ) as ResumeReview["scores"];
  const failed = checks.filter(
    (check) => !check.passed && check.category !== "jobRelevance",
  );
  const writingImprovements = [
    ...new Set(failed.map((check) => check.evidence)),
  ].slice(0, 6);
  const improvements = [
    ...writingImprovements,
    ...(missing.length
      ? [
          `Posting terms not found: ${missing
            .slice(0, 5)
            .map((item) => item.label)
            .join(
              ", ",
            )}. Review these against your real experience; they are not confirmed gaps.`,
        ]
      : []),
  ].slice(0, 6);
  const topActions = [
    ...new Set([
      ...(!has("education")
        ? [
            "Add an Education heading and your school information. Keep your exact home address out of the resume.",
          ]
        : []),
      ...(!has("experience")
        ? [
            "Add a Projects, Experience, or Volunteering section. A school activity is a useful starting point.",
          ]
        : []),
      ...(bullets.length < 2
        ? [
            "Describe two things you contributed at school, at home, at work, or while volunteering. Start each bullet with an action.",
          ]
        : []),
      ...(missing.length
        ? [
            `Compare the posting’s terms with your experience: ${missing
              .slice(0, 4)
              .map((item) => item.label)
              .join(", ")}. Add only relevant, truthful matches.`,
          ]
        : []),
      ...writingImprovements,
      "Read the original posting and check age requirements, qualifications, application instructions, and your actual availability.",
      "Ask a teacher or trusted adult to proofread your original document. This checker does not assess spelling or visual layout.",
      "Keep a copy tailored to this role and make sure you can explain every claim in an interview.",
    ]),
  ].slice(0, 3);
  const rewrites = bullets
    .filter((line) =>
      /^(?:responsible for|duties included|I (?:helped|was)|helped with|helped out with)\b/i.test(
        line,
      ),
    )
    .slice(0, 4)
    .map((original) => {
      let suggested = original
        .replace(/^responsible for\s+/i, "")
        .replace(/^duties included\s+/i, "")
        .replace(/^I was\s+/i, "")
        .replace(/^I helped\s+/i, "Helped ")
        .replace(/^helped out with\s+/i, "Helped with ");
      const verbChanges: [RegExp, string][] = [
        [/^organizing\b/i, "Organized"],
        [/^organising\b/i, "Organised"],
        [/^preparing\b/i, "Prepared"],
        [/^helping\b/i, "Helped"],
        [/^cleaning\b/i, "Cleaned"],
        [/^stocking\b/i, "Stocked"],
        [/^planning\b/i, "Planned"],
        [/^creating\b/i, "Created"],
        [/^serving\b/i, "Served"],
        [/^greeting\b/i, "Greeted"],
        [/^assisting\b/i, "Assisted"],
      ];
      for (const [pattern, replacement] of verbChanges)
        suggested = suggested.replace(pattern, replacement);
      suggested = suggested.charAt(0).toUpperCase() + suggested.slice(1);
      const unfinished = !actionStart.test(suggested);
      return {
        original,
        suggested,
        why: unfinished
          ? "Removed an introductory phrase. This is an unfinished draft: choose an accurate action verb and check the tense. No new experience or numbers were added."
          : "Shortened an introductory phrase using a fixed editing rule. Check the tense and accuracy before using it. No new experience or numbers were added.",
      };
    })
    .filter((item) => item.original !== item.suggested);
  const jobScore = Math.round((matched.length / keywords.length) * 100);
  return {
    method: "checklist-v1",
    checks,
    keywords,
    wordCount,
    bulletCount: bullets.length,
    overallScore: Math.round(
      (Object.values(scores).reduce((total, value) => total + value, 0) / 70) *
        100,
    ),
    scores,
    summary: `Checked ${wordCount} words and ${bullets.length} possible experience bullets against ${keywords.length} terms from the posting. The score is the average of seven text-check categories. It measures checklist completion, not your ability or hiring chances.`,
    strongestSections: [],
    strengths: [
      ...(has("education")
        ? ["Your education is under a recognizable heading."]
        : []),
      ...(has("experience")
        ? ["Your projects or experience have a recognizable section."]
        : []),
      ...(actionBullets.length
        ? [
            `${actionBullets.length} detected bullets begin with an action verb.`,
          ]
        : []),
      ...(contextBullets.length
        ? ["At least one bullet includes a task or context signal."]
        : []),
      ...(matched.length
        ? [
            `Posting terms found: ${matched
              .slice(0, 5)
              .map((item) => item.label)
              .join(", ")}.`,
          ]
        : []),
    ],
    weaknesses: [],
    improvements,
    missingSections: [
      ...(!has("education")
        ? [
            "Education: your school, program if relevant, and expected graduation date.",
          ]
        : []),
      ...(!has("experience")
        ? [
            "Experience or Projects: use school, work, clubs, sports, caring responsibilities, or volunteering.",
          ]
        : []),
      ...(!has("skills")
        ? [
            "Skills: include a few relevant abilities you can explain with examples.",
          ]
        : []),
    ],
    grammarIssues: checks
      .filter((check) => check.category === "professionalism" && !check.passed)
      .map((check) => check.evidence),
    bulletRewrites: rewrites,
    atsFeedback: {
      summary:
        "These checks use extracted or pasted text only. They look for readable characters, conventional headings, and short lines and bullets.",
      concerns: checks
        .filter((check) => check.category === "ats" && !check.passed)
        .map((check) => check.evidence),
      limitations:
        "This does not inspect fonts, margins, columns, page count, spelling, grammar, or a real employer’s applicant tracking system. Document extraction can change the reading order. Review the original file yourself.",
    },
    jobMatch: {
      score: jobScore,
      summary: `${matched.length} of ${keywords.length} selected posting terms were found, including supported related phrases. This is text coverage, not a suitability score. Keyword repetition does not add points.`,
      relevantStrengths: matched.map((item) => `Text match: ${item.label}.`),
      emphasizedSkills: matched
        .map(
          (item) =>
            `If relevant, connect ${item.label} to something you actually did.`,
        )
        .slice(0, 5),
      highlightExperience: contextBullets.slice(0, 3),
      potentialGaps: missing.map(
        (item) =>
          `${item.label}: not found by this matcher. This does not establish that you lack it.`,
      ),
      topChanges: [
        "Use the posting’s wording only where it accurately fits your experience.",
        "Review mandatory certifications, age rules, schedules, and other eligibility requirements yourself. This checker does not verify them.",
      ],
    },
    topActions,
  };
}
