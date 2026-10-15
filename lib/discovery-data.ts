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

export {
  certifications,
  type Certification,
  type CertificationCategory,
} from "./certificates";
