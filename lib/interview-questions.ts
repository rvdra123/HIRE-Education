export type InterviewRole =
  "Retail" | "Food service" | "Recreation" | "Volunteering";
export type InterviewQuestion = {
  question: string;
  approach: string;
  example: string;
};
const starterQuestions = {
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
export const interviewQuestions: Record<InterviewRole, InterviewQuestion[]> = {
  Retail: [
    ...starterQuestions["Retail"],
    ...[
      {
        question: "How would you handle a frustrated customer?",
        approach:
          "Listen without interrupting, stay calm, and involve a supervisor when a solution is outside your authority.",
        example:
          "At a school ticket table, a visitor was upset about a seating mix-up. I listened, checked the seating list with the teacher, and explained the options the teacher approved.",
      },
      {
        question: "Why do you want to work at this store?",
        approach:
          "Research the actual store, connect a genuine interest to its work, and explain what you want to learn.",
        example:
          "I enjoy helping classmates find useful supplies. I would connect that interest to what this store sells and describe why its customer-service work appeals to me.",
      },
      {
        question: "What would you do if you noticed a cash-handling mistake?",
        approach:
          "Stop, report the issue to the responsible supervisor, and follow the store’s procedure rather than hiding it.",
        example:
          "While collecting club payments, I noticed the total did not match my list. I told the teacher, checked the entries together, and corrected the record.",
      },
      {
        question:
          "A customer wants an item you cannot find. What would you do?",
        approach:
          "Check the tools and stock procedures you have been trained to use; offer only confirmed information.",
        example:
          "At a club sale, an item was missing from the table. I checked our supply list and asked the organizer whether we had more before giving the visitor an answer.",
      },
      {
        question: "How would you respond if you suspected shoplifting?",
        approach:
          "Follow store policy and alert authorized staff. Do not confront, chase, or physically stop anyone.",
        example:
          "I have not handled that situation. I would explain that I would follow training and contact the supervisor rather than put myself or another person at risk.",
      },
      {
        question: "What hours can you reliably work around school?",
        approach:
          "Give an honest schedule, include travel time, and explain how you communicate exam or activity commitments.",
        example:
          "I can prepare a schedule around my classes and team practice. I would give the manager the times I can consistently attend and discuss changes in advance.",
      },
      {
        question:
          "How would you prioritize a customer, a delivery, and a tidying task?",
        approach:
          "Consider safety and customer needs, communicate with the team, and follow the supervisor’s priorities.",
        example:
          "During a school event, I paused tidying to help a visitor, let another volunteer know supplies had arrived, and returned to cleanup when the visitor was helped.",
      },
      {
        question: "Tell me about feedback you received and used.",
        approach:
          "Choose a specific suggestion, explain how you changed your work, and describe what improved.",
        example:
          "A teacher said my presentation slides were too crowded. I shortened the text and practised explaining the ideas aloud. My next presentation was easier for classmates to follow.",
      },
      {
        question: "How would you handle a disagreement with a coworker?",
        approach:
          "Speak respectfully, focus on the task, and ask for guidance if the disagreement affects service or safety.",
        example:
          "My project partner and I wanted different slide designs. We compared both with the assignment criteria and chose one layout so we could finish the work.",
      },
      {
        question: "Why should we hire you if this is your first paid job?",
        approach:
          "Connect real habits and examples to the role. Be honest about what you still need to learn.",
        example:
          "I have not had a paid job, but I regularly help organize our club’s supplies and follow through on assigned tasks. I can bring that reliability and a willingness to learn.",
      },
    ],
  ],
  "Food service": [
    ...starterQuestions["Food service"],
    ...[
      {
        question:
          "A customer asks whether a meal is safe for their allergy. What would you do?",
        approach:
          "Treat allergies seriously, follow the restaurant’s procedure, and ask trained staff. Never guess or promise that food is safe.",
        example:
          "I would explain that I need to check the approved allergen information with the trained person in charge. I would not rely on my memory or make a guarantee.",
      },
      {
        question: "What does good food hygiene mean to you?",
        approach:
          "Mention training, handwashing, clean equipment, cross-contamination prevention, and reporting concerns.",
        example:
          "At a school food event, I followed the teacher’s instructions for clean serving tools and asked before handling an unfamiliar task. At work I would follow the restaurant’s training.",
      },
      {
        question: "How would you respond to a long queue?",
        approach:
          "Stay organized, communicate with teammates, and keep accuracy and safety ahead of rushing.",
        example:
          "At a school fundraiser, I greeted the next person while a teammate prepared supplies. We kept our tasks clear and checked orders instead of trying to do everything at once.",
      },
      {
        question: "What would you do if you saw food being handled unsafely?",
        approach:
          "Report the concern promptly to the trained supervisor and follow the approved safety procedure.",
        example:
          "I would pause my own task if needed and tell the supervisor what I observed. I would not serve something I believed might be unsafe or pretend I knew how to fix it.",
      },
      {
        question: "What would you do if you were going to be late?",
        approach:
          "Contact the workplace as early as possible, give a realistic update, and take steps to prevent a repeat.",
        example:
          "When a bus delay affected an after-school commitment, I messaged the organizer before the start time and gave an updated arrival estimate. I then planned an earlier bus for future meetings.",
      },
      {
        question: "How would you keep a workstation organized?",
        approach:
          "Follow the cleaning schedule, keep tools in their proper places, and reset the space between tasks.",
        example:
          "In science class, I return shared equipment to its labelled place and clean my work area as instructed. At a restaurant I would apply the same care using its specific procedures.",
      },
      {
        question: "How would you handle a rude customer?",
        approach:
          "Keep your tone calm, focus on resolving the issue within your role, and get support if behaviour becomes unsafe.",
        example:
          "At an event, I would listen to the concern and explain what I could help with. If someone became threatening, I would contact the responsible staff member rather than argue.",
      },
      {
        question: "Tell me about a time your team was under pressure.",
        approach:
          "Explain how you divided work, communicated, and helped the team finish safely.",
        example:
          "Our class had limited time to set up a display. I checked which materials were missing, brought them to the group, and let the presenter focus on practising.",
      },
      {
        question: "Why are you interested in food service?",
        approach:
          "Connect the work to a genuine interest in teamwork, service, or learning a fast-moving routine.",
        example:
          "I enjoy tasks where people work together and can see the result. Helping at school events showed me that I like welcoming people and keeping shared tasks organized.",
      },
      {
        question: "A customer says their order is wrong. What would you do?",
        approach:
          "Confirm the problem, apologize appropriately, and follow the restaurant’s correction procedure.",
        example:
          "At a club pickup table, I checked a visitor’s request against our list and asked the organizer to approve a correction. I would use the same calm approach and follow workplace training.",
      },
    ],
  ],
  Recreation: [
    ...starterQuestions["Recreation"],
    ...[
      {
        question: "What would you do if a participant was injured?",
        approach:
          "Alert qualified staff, follow emergency procedures, and stay within your training. Never claim medical skills you do not have.",
        example:
          "I would contact the trained staff member immediately, follow their directions, and help keep other participants clear. I would not attempt treatment outside my training.",
      },
      {
        question: "How would you handle two children arguing?",
        approach:
          "Follow the program’s behaviour and safeguarding procedures, use calm language, and involve supervising staff.",
        example:
          "During a school group activity, two classmates disagreed about turns. I helped clarify the turn order and asked the teacher for help when the disagreement continued.",
      },
      {
        question:
          "An unfamiliar adult asks to pick up a child. What would you do?",
        approach:
          "Follow authorized pickup and identity-check procedures. Do not release a participant based on a claim alone.",
        example:
          "I would ask the responsible supervisor to verify the pickup using the program’s records. I would keep following the supervision procedure until the pickup was approved.",
      },
      {
        question:
          "How would you adapt an outdoor activity when the weather changes?",
        approach:
          "Follow safety instructions, check with supervising staff, and use an approved alternative.",
        example:
          "When rain changed a school event, I helped move materials to the indoor location chosen by the teacher. I would follow a recreation program’s weather and emergency procedures.",
      },
      {
        question: "How would you make an activity more accessible?",
        approach:
          "Ask about preferences respectfully, offer approved options, and work with trained staff rather than make assumptions.",
        example:
          "In a class activity, I asked which part a classmate wanted to take on and offered a seated task that still contributed. In a program I would check adaptations with the supervisor.",
      },
      {
        question: "How would you stay focused while supervising?",
        approach:
          "Follow supervision ratios and assigned duties, put distractions away, and communicate before leaving a post.",
        example:
          "When I help run a school station, I keep my phone away and tell the organizer before stepping out. I would follow the program’s supervision rules rather than leave a group unattended.",
      },
      {
        question: "Describe how you would plan a short activity.",
        approach:
          "Start with the age group and goal, check safety and equipment, and have an approved backup.",
        example:
          "For a class icebreaker, I chose simple instructions, prepared materials, and asked the teacher to review the plan. I also prepared a shorter version in case we ran out of time.",
      },
      {
        question:
          "Tell me about a time you took responsibility for a group task.",
        approach:
          "Explain the responsibility, the action you took, and how you kept others informed.",
        example:
          "I coordinated our group’s project checklist. I checked in with each person, flagged missing materials early, and let the teacher know when we needed advice.",
      },
      {
        question:
          "What would you say if a role required a certificate you do not have?",
        approach:
          "Be direct about your current qualifications. Ask about approved training and do not imply you are already certified.",
        example:
          "I would say that I do not currently hold that certificate and ask whether I need it before applying. I would only list training after completing the required course and assessment.",
      },
      {
        question:
          "How would you respond when a participant does not enjoy your activity?",
        approach:
          "Listen, avoid taking it personally, and offer a suitable alternative within program rules.",
        example:
          "A classmate did not enjoy the first task in our group activity. I asked what they preferred and helped them take on another useful role without excluding them.",
      },
    ],
  ],
  Volunteering: [
    ...starterQuestions["Volunteering"],
    ...[
      {
        question: "How would you protect someone’s personal information?",
        approach:
          "Only access information needed for your role, follow privacy rules, and ask staff before sharing anything.",
        example:
          "When helping with a class contact list, I only used it for the assigned task and did not share it with friends. I would follow the organization’s privacy training in a volunteer role.",
      },
      {
        question: "What would you do if you could not attend a shift?",
        approach:
          "Give early notice using the approved contact method and avoid promising a replacement without permission.",
        example:
          "When I could not attend a club setup session, I told the organizer early and sent my preparation notes. I would follow the volunteer coordinator’s cancellation procedure.",
      },
      {
        question: "How would you stay motivated during repetitive tasks?",
        approach:
          "Connect the task to the organization’s purpose and maintain care and consistency.",
        example:
          "Sorting materials for a school event was repetitive, but it helped visitors find what they needed. I used a checklist to keep the sorting accurate through the whole task.",
      },
      {
        question: "What do you know about our organization?",
        approach:
          "Use its official mission and current program information, then connect one detail to your interest.",
        example:
          "Before applying, I would read the organization’s own website and identify a service I care about. I would explain that connection using my own interest rather than repeat a slogan.",
      },
      {
        question:
          "What would you do if someone asked you to perform a task outside your training?",
        approach:
          "Explain your limits and ask the coordinator for instruction or a trained person to take over.",
        example:
          "At a school event, I was asked to use equipment I had not been shown. I told the organizer and waited for instructions rather than try to operate it alone.",
      },
      {
        question: "How would you handle instructions you did not understand?",
        approach:
          "Ask a focused question, repeat back the task, and confirm before starting.",
        example:
          "When a project instruction was unclear, I summarized what I thought was required and asked the teacher to confirm. That helped me correct the plan before doing the work.",
      },
      {
        question: "Tell me about a task you completed independently.",
        approach:
          "Choose a real responsibility, explain how you organized it, and show when you checked your work.",
        example:
          "I prepared the supplies list for a class activity, checked it against the plan, and gave the teacher the list before the deadline. I asked for help only where I needed a decision.",
      },
      {
        question: "Are you volunteering only to complete school hours?",
        approach:
          "Be honest about the requirement and explain a genuine reason you want to contribute to this particular role.",
        example:
          "I do need community involvement hours, and I also want experience supporting a cause I care about. I would explain the connection and commit to the agreed responsibilities.",
      },
      {
        question:
          "How would you respond to a difficult interaction with a member of the public?",
        approach:
          "Stay respectful, follow boundaries, and involve staff if you cannot resolve the issue safely.",
        example:
          "If someone was upset, I would listen and explain what my volunteer role allows me to do. I would contact the coordinator for concerns that need staff authority.",
      },
      {
        question: "How will you balance volunteering with school?",
        approach:
          "Choose a realistic commitment and communicate changes before they affect others.",
        example:
          "I check my class schedule and major deadlines before agreeing to a commitment. I would choose a shift I can maintain and talk with the coordinator early if exams change my availability.",
      },
    ],
  ],
};
