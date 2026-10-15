export type DirectoryGroup =
  "Jobs" | "Volunteering" | "Programs & competitions" | "Events & learning";
export type OpportunityDirectoryEntry = {
  id: string;
  name: string;
  url: string;
  group: DirectoryGroup;
  area: string;
  description: string;
};
// Official employer and program portals. These are not individual openings,
// have no invented application status, and are not included in live-listing totals.
export const opportunityDirectory: OpportunityDirectoryEntry[] = [
  {
    id: "city-of-brampton-careers",
    name: "City of Brampton careers",
    url: "https://www.brampton.ca/EN/City-Hall/Employment/Pages/Welcome.aspx",
    group: "Jobs",
    area: "Brampton",
    description:
      "Look for student, seasonal, recreation, and community-service positions.",
  },
  {
    id: "city-of-mississauga-careers",
    name: "City of Mississauga careers",
    url: "https://jobs.mississauga.ca/",
    group: "Jobs",
    area: "Mississauga",
    description:
      "Search municipal recreation, camp, library, and seasonal job postings.",
  },
  {
    id: "town-of-caledon-careers",
    name: "Town of Caledon careers",
    url: "https://www.caledon.ca/en/government/careers.aspx",
    group: "Jobs",
    area: "Caledon",
    description: "Check nearby municipal jobs and seasonal recruitment.",
  },
  {
    id: "region-of-peel-careers",
    name: "Region of Peel careers",
    url: "https://www.peelregion.ca/careers",
    group: "Jobs",
    area: "Peel Region",
    description:
      "Explore regional openings and check education requirements before applying.",
  },
  {
    id: "job-bank-student-search",
    name: "Job Bank student search",
    url: "https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=student&locationstring=Brampton%2C+ON",
    group: "Jobs",
    area: "Brampton",
    description:
      "Search the official federal job board for student work in Brampton.",
  },
  {
    id: "canada-summer-jobs-search",
    name: "Canada Summer Jobs search",
    url: "https://www.jobbank.gc.ca/youth",
    group: "Jobs",
    area: "Canada",
    description:
      "Find the official youth job-search tools and seasonal Canada Summer Jobs postings.",
  },
  {
    id: "mcdonald-s-canada",
    name: "McDonald’s Canada",
    url: "https://careers.mcdonalds.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Search local restaurant crew and guest-service positions.",
  },
  {
    id: "tim-hortons",
    name: "Tim Hortons",
    url: "https://careers.timhortons.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Find team-member roles and check the individual restaurant’s requirements.",
  },
  {
    id: "a-w-canada",
    name: "A&W Canada",
    url: "https://careers.aw.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Explore restaurant roles, shifts, and local franchise hiring.",
  },
  {
    id: "starbucks-canada",
    name: "Starbucks Canada",
    url: "https://careers.starbucks.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Look for barista openings and check availability expectations.",
  },
  {
    id: "walmart-canada",
    name: "Walmart Canada",
    url: "https://careers.walmart.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Search store roles such as stocking, customer service, and checkout.",
  },
  {
    id: "loblaw-companies",
    name: "Loblaw companies",
    url: "https://careers.loblaw.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Look across grocery-store banners for local entry-level roles.",
  },
  {
    id: "sobeys-and-freshco",
    name: "Sobeys and FreshCo",
    url: "https://jobs.sobeyscareers.com/",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Search grocery, front-end, and store-team positions by city.",
  },
  {
    id: "metro-and-food-basics",
    name: "Metro and Food Basics",
    url: "https://careers.metro.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Explore nearby grocery-store positions and department requirements.",
  },
  {
    id: "costco-canada",
    name: "Costco Canada",
    url: "https://www.costco.ca/jobs.html",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Use the official employment information to find warehouse opportunities.",
  },
  {
    id: "canadian-tire",
    name: "Canadian Tire",
    url: "https://careers.canadiantire.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Find retail roles across the company’s store banners and locations.",
  },
  {
    id: "the-home-depot-canada",
    name: "The Home Depot Canada",
    url: "https://careers.homedepot.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Search store service and merchandising roles; check minimum-age requirements.",
  },
  {
    id: "rona",
    name: "RONA",
    url: "https://www.ronainc.ca/en/careers",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Browse home-improvement retail roles and check physical and age requirements.",
  },
  {
    id: "cineplex",
    name: "Cineplex",
    url: "https://careers.cineplex.com/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Look for theatre, concession, and guest-experience positions.",
  },
  {
    id: "landmark-cinemas",
    name: "Landmark Cinemas",
    url: "https://www.landmarkcinemas.com/careers/",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Explore cinema team positions and local theatre recruitment.",
  },
  {
    id: "indigo",
    name: "Indigo",
    url: "https://careers.indigo.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Find bookstore customer-experience and seasonal retail openings.",
  },
  {
    id: "staples-canada",
    name: "Staples Canada",
    url: "https://careers.staples.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Explore sales, print-service, and store-support roles.",
  },
  {
    id: "best-buy-canada",
    name: "Best Buy Canada",
    url: "https://careers.bestbuy.ca/",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Search retail customer-service and product-advice positions.",
  },
  {
    id: "dollarama",
    name: "Dollarama",
    url: "https://www.dollarama.com/en-CA/corp/careers",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Check store-associate openings and the application instructions.",
  },
  {
    id: "dollar-tree-canada",
    name: "Dollar Tree Canada",
    url: "https://www.dollartreecanada.com/careers/",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Find store-team opportunities and local hiring information.",
  },
  {
    id: "bulk-barn",
    name: "Bulk Barn",
    url: "https://www.bulkbarn.ca/en/Careers",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Explore food-retail roles and customer-service work.",
  },
  {
    id: "petsmart",
    name: "PetSmart",
    url: "https://careers.petsmart.com/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Search Canadian retail roles and check training and age requirements.",
  },
  {
    id: "michaels",
    name: "Michaels",
    url: "https://careers.michaels.com/",
    group: "Jobs",
    area: "Brampton & nearby",
    description: "Look for arts-and-crafts retail and seasonal store roles.",
  },
  {
    id: "winners-marshalls-and-homesense",
    name: "Winners, Marshalls and HomeSense",
    url: "https://jobs.tjx.com/global/en/canada",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Search Canadian store-associate roles across the company’s banners.",
  },
  {
    id: "ikea",
    name: "IKEA",
    url: "https://jobs.ikea.com/",
    group: "Jobs",
    area: "GTA",
    description:
      "Filter Canadian store, customer-service, and food-service jobs by location.",
  },
  {
    id: "recipe-unlimited-restaurants",
    name: "Recipe Unlimited restaurants",
    url: "https://www.recipeunlimited.com/careers.html",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Explore restaurant careers across brands such as Harvey’s and Swiss Chalet.",
  },
  {
    id: "pizza-pizza",
    name: "Pizza Pizza",
    url: "https://www.pizzapizza.ca/careers/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Check restaurant and customer-service opportunities through the official site.",
  },
  {
    id: "booster-juice",
    name: "Booster Juice",
    url: "https://www.boosterjuice.com/careers/",
    group: "Jobs",
    area: "Brampton & nearby",
    description:
      "Find store-team hiring information and local application routes.",
  },
  {
    id: "bramalea-city-centre",
    name: "Bramalea City Centre",
    url: "https://bramaleacitycentre.ca/",
    group: "Jobs",
    area: "Brampton",
    description:
      "Check the shopping centre’s official site for retailer hiring notices.",
  },
  {
    id: "ymca-of-greater-toronto-careers",
    name: "YMCA of Greater Toronto careers",
    url: "https://ymcagta.org/join-our-team",
    group: "Jobs",
    area: "Peel Region & GTA",
    description:
      "Explore camp, recreation, child-care, and community positions; qualifications vary.",
  },
  {
    id: "city-of-brampton-volunteering",
    name: "City of Brampton volunteering",
    url: "https://www.brampton.ca/EN/City-Hall/Employment/Volunteer-Opportunities/Pages/Welcome.aspx",
    group: "Volunteering",
    area: "Brampton",
    description:
      "Explore municipal volunteer programs, training, and application requirements.",
  },
  {
    id: "volunteer-mbc",
    name: "Volunteer MBC",
    url: "https://volunteermbc.org/",
    group: "Volunteering",
    area: "Peel Region",
    description:
      "Search community organizations and regional volunteer opportunities.",
  },
  {
    id: "volunteer-toronto",
    name: "Volunteer Toronto",
    url: "https://www.volunteertoronto.ca/",
    group: "Volunteering",
    area: "GTA",
    description:
      "Use youth and virtual filters where available and check travel requirements.",
  },
  {
    id: "william-osler-health-system",
    name: "William Osler Health System",
    url: "https://www.williamoslerhs.ca/en/who-we-are/volunteering.aspx",
    group: "Volunteering",
    area: "Brampton & Etobicoke",
    description:
      "Check student volunteer intake periods, age rules, and required commitments.",
  },
  {
    id: "knights-table",
    name: "Knights Table",
    url: "https://knightstable.org/",
    group: "Volunteering",
    area: "Brampton",
    description:
      "Read the organization’s current volunteer instructions for food and community support.",
  },
  {
    id: "regeneration-outreach-community",
    name: "Regeneration Outreach Community",
    url: "https://regenbrampton.com/",
    group: "Volunteering",
    area: "Brampton",
    description:
      "Learn about community support work and current volunteer application routes.",
  },
  {
    id: "seva-food-bank",
    name: "Seva Food Bank",
    url: "https://www.sevafoodbank.com/",
    group: "Volunteering",
    area: "Mississauga & Peel",
    description:
      "Explore food-security volunteering and check age and shift requirements.",
  },
  {
    id: "food-banks-mississauga",
    name: "Food Banks Mississauga",
    url: "https://www.foodbanksmississauga.ca/",
    group: "Volunteering",
    area: "Mississauga",
    description:
      "Find food-bank volunteer information and youth participation requirements.",
  },
  {
    id: "habitat-for-humanity-gta",
    name: "Habitat for Humanity GTA",
    url: "https://habitatgta.ca/volunteer/",
    group: "Volunteering",
    area: "Peel Region & GTA",
    description:
      "Explore ReStore and other volunteer pathways; build-site age rules differ.",
  },
  {
    id: "toronto-and-region-conservation-authority",
    name: "Toronto and Region Conservation Authority",
    url: "https://trca.ca/get-involved/volunteer/",
    group: "Volunteering",
    area: "Peel Region & GTA",
    description:
      "Find environmental volunteering, community stewardship, and event opportunities.",
  },
  {
    id: "credit-valley-conservation",
    name: "Credit Valley Conservation",
    url: "https://cvc.ca/volunteer/",
    group: "Volunteering",
    area: "Peel Region",
    description:
      "Explore conservation activities and outdoor community programs.",
  },
  {
    id: "canadian-red-cross",
    name: "Canadian Red Cross",
    url: "https://www.redcross.ca/volunteer",
    group: "Volunteering",
    area: "Ontario & online",
    description:
      "Filter volunteer roles and check training, age, and screening requirements.",
  },
  {
    id: "canadian-blood-services",
    name: "Canadian Blood Services",
    url: "https://www.blood.ca/en/ways-donate/volunteering",
    group: "Volunteering",
    area: "Peel Region & GTA",
    description:
      "Read about volunteer support roles; eligibility differs from blood-donation rules.",
  },
  {
    id: "special-olympics-ontario",
    name: "Special Olympics Ontario",
    url: "https://www.specialolympicsontario.com/volunteer/",
    group: "Volunteering",
    area: "Ontario",
    description:
      "Explore local sport-support roles and check supervision and screening rules.",
  },
  {
    id: "ymca-of-greater-toronto-volunteering",
    name: "YMCA of Greater Toronto volunteering",
    url: "https://ymcagta.org/volunteer",
    group: "Volunteering",
    area: "Peel Region & GTA",
    description:
      "Find ways to support community programs and check each role’s eligibility.",
  },
  {
    id: "scouts-canada",
    name: "Scouts Canada",
    url: "https://www.scouts.ca/volunteer/",
    group: "Volunteering",
    area: "Brampton & nearby",
    description:
      "Explore leadership and volunteer pathways, with different rules for youth and adults.",
  },
  {
    id: "girl-guides-of-canada",
    name: "Girl Guides of Canada",
    url: "https://www.girlguides.ca/",
    group: "Volunteering",
    area: "Brampton & nearby",
    description:
      "Explore youth leadership and community involvement through local groups.",
  },
  {
    id: "ontario-summer-employment-opportunities",
    name: "Ontario Summer Employment Opportunities",
    url: "https://www.ontario.ca/page/careers-summer-employment-opportunities",
    group: "Programs & competitions",
    area: "Ontario",
    description:
      "Check the annual student employment program’s eligibility and recruitment dates.",
  },
  {
    id: "ontario-summer-company",
    name: "Ontario Summer Company",
    url: "https://www.ontario.ca/page/start-summer-company-students",
    group: "Programs & competitions",
    area: "Ontario",
    description:
      "Learn about the student entrepreneurship program, eligibility, and seasonal application window.",
  },
  {
    id: "ontario-youth-apprenticeship-program",
    name: "Ontario Youth Apprenticeship Program",
    url: "https://www.ontario.ca/page/prepare-apprenticeship",
    group: "Programs & competitions",
    area: "Ontario",
    description:
      "Ask your school about skilled-trades exploration through co-op and OYAP.",
  },
  {
    id: "ja-central-ontario",
    name: "JA Central Ontario",
    url: "https://www.jacentralontario.org/",
    group: "Programs & competitions",
    area: "GTA & online",
    description:
      "Explore student entrepreneurship, financial literacy, and work-readiness programs.",
  },
  {
    id: "skills-ontario",
    name: "Skills Ontario",
    url: "https://www.skillsontario.com/",
    group: "Programs & competitions",
    area: "Ontario",
    description:
      "Find skilled-trades discovery, school competitions, and youth events.",
  },
  {
    id: "deca-ontario",
    name: "DECA Ontario",
    url: "https://deca.ca/",
    group: "Programs & competitions",
    area: "Ontario",
    description:
      "Explore business competitions through a participating school chapter; fees may apply.",
  },
  {
    id: "hosa-canada",
    name: "HOSA Canada",
    url: "https://hosacanada.org/",
    group: "Programs & competitions",
    area: "Canada",
    description:
      "Explore health-science student events and chapter participation; fees may apply.",
  },
  {
    id: "first-robotics-canada",
    name: "FIRST Robotics Canada",
    url: "https://firstroboticscanada.org/",
    group: "Programs & competitions",
    area: "Ontario & Canada",
    description:
      "Find robotics teams and competition pathways; team participation costs vary.",
  },
  {
    id: "hack-club",
    name: "Hack Club",
    url: "https://hackclub.com/",
    group: "Programs & competitions",
    area: "Online & local clubs",
    description:
      "Explore a high-school coding community and student-led building opportunities.",
  },
  {
    id: "major-league-hacking",
    name: "Major League Hacking",
    url: "https://mlh.io/",
    group: "Programs & competitions",
    area: "Online & Canada",
    description:
      "Find hackathons and check event-specific age, travel, and registration rules.",
  },
  {
    id: "youth-employment-services-yes",
    name: "Youth Employment Services YES",
    url: "https://www.yes.on.ca/",
    group: "Programs & competitions",
    area: "GTA",
    description:
      "Explore youth employment support and check age and location eligibility.",
  },
  {
    id: "acces-employment",
    name: "ACCES Employment",
    url: "https://accesemployment.ca/",
    group: "Programs & competitions",
    area: "Peel Region & GTA",
    description:
      "Find employment support, workshops, and youth-focused programs where available.",
  },
  {
    id: "achēv",
    name: "Achēv",
    url: "https://achev.ca/",
    group: "Programs & competitions",
    area: "Brampton & Peel",
    description:
      "Explore local employment services, workshops, and youth supports.",
  },
  {
    id: "costi",
    name: "COSTI",
    url: "https://www.costi.org/",
    group: "Programs & competitions",
    area: "Peel Region & GTA",
    description:
      "Look for employment and newcomer supports with program-specific eligibility.",
  },
  {
    id: "newcomer-centre-of-peel",
    name: "Newcomer Centre of Peel",
    url: "https://www.ncpeel.ca/",
    group: "Programs & competitions",
    area: "Peel Region",
    description: "Explore settlement, youth, and employment support programs.",
  },
  {
    id: "brampton-library",
    name: "Brampton Library",
    url: "https://www.bramptonlibrary.ca/",
    group: "Events & learning",
    area: "Brampton",
    description:
      "Check the official calendar for teen programs, technology workshops, and volunteering.",
  },
  {
    id: "peel-art-gallery-museum-and-archives",
    name: "Peel Art Gallery, Museum and Archives",
    url: "https://www.pama.peelregion.ca/",
    group: "Events & learning",
    area: "Brampton",
    description:
      "Find creative workshops, community programs, and volunteer information.",
  },
  {
    id: "sheridan-college",
    name: "Sheridan College",
    url: "https://www.sheridancollege.ca/",
    group: "Events & learning",
    area: "Brampton & nearby",
    description:
      "Explore campus events, open houses, and pathways relevant to high school students.",
  },
  {
    id: "brampton-entrepreneur-centre",
    name: "Brampton Entrepreneur Centre",
    url: "https://www.brampton.ca/EN/Business/BEC/Pages/Welcome.aspx",
    group: "Events & learning",
    area: "Brampton",
    description:
      "Check local small-business workshops, youth entrepreneurship resources, and event dates.",
  },
];
