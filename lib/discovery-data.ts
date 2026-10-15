export type OpportunityKind = "Volunteer" | "Student jobs" | "Career programs";

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  description: string;
  url: string;
  kind: OpportunityKind;
  category: string;
  location: "Brampton" | "Peel Region" | "Ontario" | "Greater Toronto Area";
  compensation: "Volunteer" | "Paid roles" | "Varies by program";
  season: "Varies" | "Summer";
  grades?: number[];
  tags: string[];
  logo: string;
  color: string;
};

export const opportunities: Opportunity[] = [
  {
    id: "brampton-volunteer",
    title: "Give back. Build your experience.",
    organization: "City of Brampton",
    description:
      "Explore city volunteer programs, support your community, and discover where your interests can make a difference.",
    url: "https://www.brampton.ca/EN/City-Hall/Employment/Volunteer-Opportunities/Pages/Welcome.aspx",
    kind: "Volunteer",
    category: "Community",
    location: "Brampton",
    compensation: "Volunteer",
    season: "Varies",
    tags: ["Community involvement", "Local impact"],
    logo: "B",
    color: "brampton",
  },
  {
    id: "brampton-library",
    title: "Make your next chapter count.",
    organization: "Brampton Library",
    description:
      "Find out about library volunteering, teen opportunities, and ways to help people learn and connect in Brampton.",
    url: "https://www.bramptonlibrary.ca/",
    kind: "Volunteer",
    category: "Education",
    location: "Brampton",
    compensation: "Volunteer",
    season: "Varies",
    tags: ["Communication", "Community involvement"],
    logo: "bl",
    color: "library",
  },
  {
    id: "volunteer-mbc",
    title: "Find a cause you care about.",
    organization: "Volunteer MBC",
    description:
      "Explore the regional volunteer directory for opportunities with community organizations across Brampton and Peel.",
    url: "https://volunteermbc.org/",
    kind: "Volunteer",
    category: "Community",
    location: "Peel Region",
    compensation: "Volunteer",
    season: "Varies",
    tags: ["Explore causes", "Peel community"],
    logo: "V",
    color: "mbc",
  },
  {
    id: "job-bank",
    title: "Start your local job search.",
    organization: "Government of Canada · Job Bank",
    description:
      "Search for work in Brampton. Read each employer’s requirements and look for roles that fit your school schedule.",
    url: "https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=student&locationstring=Brampton%2C+ON",
    kind: "Student jobs",
    category: "General employment",
    location: "Brampton",
    compensation: "Paid roles",
    season: "Varies",
    tags: ["Student job search", "Official job board"],
    logo: "CA",
    color: "canada",
  },
  {
    id: "brampton-careers",
    title: "Explore work in your city.",
    organization: "City of Brampton · Careers",
    description:
      "Browse the city’s careers portal for student, recreation, and seasonal positions. Availability and requirements vary.",
    url: "https://www.brampton.ca/EN/City-Hall/Employment/Pages/Welcome.aspx",
    kind: "Student jobs",
    category: "Recreation & public service",
    location: "Brampton",
    compensation: "Paid roles",
    season: "Varies",
    tags: ["Public service", "Seasonal possibilities"],
    logo: "B",
    color: "brampton",
  },
  {
    id: "mcdonalds-careers",
    title: "Build skills with your first team.",
    organization: "McDonald’s Canada",
    description:
      "Use the official careers site to explore local restaurant roles and learn about teamwork and customer service.",
    url: "https://careers.mcdonalds.ca/",
    kind: "Student jobs",
    category: "Customer service",
    location: "Brampton",
    compensation: "Paid roles",
    season: "Varies",
    tags: ["Customer service", "Teamwork"],
    logo: "M",
    color: "mcdonalds",
  },
  {
    id: "ontario-summer",
    title: "Put your summer to work.",
    organization: "Ontario Public Service",
    description:
      "Learn about the Summer Employment Opportunities program, its eligibility rules, and how the application process works.",
    url: "https://www.ontario.ca/page/careers-summer-employment-opportunities",
    kind: "Career programs",
    category: "Recreation & public service",
    location: "Ontario",
    compensation: "Paid roles",
    season: "Summer",
    tags: ["Summer program", "Public service"],
    logo: "ON",
    color: "ontario",
  },
  {
    id: "oyap",
    title: "Discover the skilled trades.",
    organization: "Ontario Youth Apprenticeship Program",
    description:
      "Explore skilled trades through high school co-op. Ask your guidance counsellor about local OYAP pathways and eligibility.",
    url: "https://www.ontario.ca/page/prepare-apprenticeship",
    kind: "Career programs",
    category: "Skilled trades",
    location: "Ontario",
    compensation: "Varies by program",
    season: "Varies",
    grades: [11, 12],
    tags: ["Co-op pathways", "Hands-on learning"],
    logo: "OY",
    color: "oyap",
  },
  {
    id: "ja-central-ontario",
    title: "Turn your ideas into something.",
    organization: "JA Central Ontario",
    description:
      "Explore youth programs in entrepreneurship, financial health, and work readiness, with school and community pathways.",
    url: "https://www.jacentralontario.org/",
    kind: "Career programs",
    category: "Business & leadership",
    location: "Greater Toronto Area",
    compensation: "Varies by program",
    season: "Varies",
    tags: ["Entrepreneurship", "Financial literacy"],
    logo: "JA",
    color: "ja",
  },
];

export type CertificationCategory =
  "Business" | "Technology" | "Marketing" | "AI" | "Data" | "Career Skills";

export type Certification = {
  id: string;
  title: string;
  organization: string;
  description: string;
  url: string;
  categories: CertificationCategory[];
  difficulty: "Beginner" | "Mixed levels";
  format: string;
  credential: string;
  cost: string;
  tags: string[];
  logo: string;
  color: string;
};

export const certifications: Certification[] = [
  {
    id: "hp-life",
    title: "Business Communications",
    organization: "HP LIFE",
    description:
      "Practise communicating clearly at work through HP LIFE’s business learning. Find the course in the official catalogue.",
    url: "https://www.life-global.org/",
    categories: ["Business", "Career Skills"],
    difficulty: "Beginner",
    format: "Self-paced courses",
    credential: "Certificates of completion",
    cost: "Free courses and completion certificates",
    tags: ["Entrepreneurship", "Communication"],
    logo: "hp",
    color: "hp",
  },
  {
    id: "hubspot-academy",
    title: "Digital Marketing Certification",
    organization: "HubSpot Academy",
    description:
      "Explore the foundations of digital marketing, including content, search, and social media, through HubSpot Academy.",
    url: "https://academy.hubspot.com/courses/digital-marketing",
    categories: ["Marketing", "Business"],
    difficulty: "Mixed levels",
    format: "Courses & certifications",
    credential: "Selected course certifications",
    cost: "Free learning; check each credential",
    tags: ["Digital marketing", "Social media"],
    logo: "hub",
    color: "hubspot",
  },
  {
    id: "ibm-skillsbuild",
    title: "Artificial Intelligence Fundamentals",
    organization: "IBM SkillsBuild",
    description:
      "Explore introductory AI concepts through IBM SkillsBuild. Look for this pathway in the student learning catalogue.",
    url: "https://skillsbuild.org/students",
    categories: ["AI", "Data", "Technology", "Career Skills"],
    difficulty: "Beginner",
    format: "Learning pathways",
    credential: "Digital credentials on selected paths",
    cost: "Free learning; check credential requirements",
    tags: ["Artificial intelligence", "Career readiness"],
    logo: "IBM",
    color: "ibm",
  },
  {
    id: "cisco-networking",
    title: "Introduction to Cybersecurity",
    organization: "Cisco Networking Academy",
    description:
      "Start exploring cybersecurity, networking, and the digital world through introductory online learning.",
    url: "https://www.netacad.com/",
    categories: ["Technology", "Career Skills"],
    difficulty: "Beginner",
    format: "Self-paced learning",
    credential: "Course awards vary; exams are separate",
    cost: "Explore free courses; check exam costs",
    tags: ["Cybersecurity", "Networking"],
    logo: "cisco",
    color: "cisco",
  },
  {
    id: "openlearn",
    title: "Succeed in the workplace",
    organization: "The Open University · OpenLearn",
    description:
      "Explore your strengths, work interests, and next career steps with this Open University learning programme.",
    url: "https://www.open.edu/openlearn/money-business/succeed-the-workplace/content-section-overview",
    categories: ["Business", "Technology", "Career Skills"],
    difficulty: "Mixed levels",
    format: "Short online courses",
    credential: "Participation statements; some badges",
    cost: "Free learning and participation statements",
    tags: ["Explore interests", "Personal development"],
    logo: "OU",
    color: "openlearn",
  },
  {
    id: "microsoft-learn",
    title: "Introduction to AI concepts",
    organization: "Microsoft Learn",
    description:
      "Explore guided modules on AI, cloud, data, and digital tools. Start with a topic that sparks your curiosity.",
    url: "https://learn.microsoft.com/training/",
    categories: ["AI", "Data", "Technology"],
    difficulty: "Mixed levels",
    format: "Modules & learning paths",
    credential: "Learning achievements; certification separate",
    cost: "Free learning; certification exams may cost extra",
    tags: ["AI fundamentals", "Digital tools"],
    logo: "MS",
    color: "microsoft",
  },
  {
    id: "salesforce-trailhead",
    title: "CRM Basics",
    organization: "Salesforce Trailhead",
    description:
      "Try bite-sized learning on customer relationships, technology, data, and business skills.",
    url: "https://trailhead.salesforce.com/content/learn/modules/crm_basics",
    categories: ["Business", "Technology", "Data"],
    difficulty: "Mixed levels",
    format: "Interactive learning trails",
    credential: "Trailhead badges; certification separate",
    cost: "Free learning; certification costs vary",
    tags: ["Business technology", "Customer relationships"],
    logo: "sf",
    color: "salesforce",
  },
];
