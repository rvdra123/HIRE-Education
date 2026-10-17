export const interviewTopics = [
  "Motivation",
  "Experience and strengths",
  "Teamwork",
  "Communication",
  "Reliability and school",
  "Learning and feedback",
  "Customer service",
  "Safety and boundaries",
  "Ethics and privacy",
  "Inclusion and accessibility",
  "Problem solving",
  "Interview preparation",
] as const;
export type InterviewTopic = (typeof interviewTopics)[number];
export type InterviewQuestion = {
  id: string;
  role: InterviewRole;
  topic: InterviewTopic;
  question: string;
  approach: string;
  /** Fictional teaching example, never a claim about the learner's experience. */
  example: string;
};

type QuestionDraft = Omit<InterviewQuestion, "id" | "role">;
const questionLibrary = {
  "General first job": [
    {
      topic: "Experience and strengths",
      question:
        "Tell me about yourself in a way that relates to this first job.",
      approach:
        "Give a short introduction with your current studies, one or two real strengths, and why the duties interest you. Avoid a full life story or private details unrelated to the role.",
      example:
        "I am a high-school student who enjoys organizing group work. In our school club I track materials and deadlines, and I want to learn customer service in a part-time role.",
    },
    {
      topic: "Motivation",
      question: "What interested you in this specific opening?",
      approach:
        "Mention a real duty from the current posting and a genuine connection to your interests or habits. Research the employer's official information rather than invent a personal story.",
      example:
        "The posting mentions preparing materials and welcoming visitors. I enjoyed both when helping with a school open house, so I would like to build those skills.",
    },
    {
      topic: "Experience and strengths",
      question: "What is one strength you could bring to a team?",
      approach:
        "Name a relevant strength and demonstrate it with one specific real action and result. Avoid unsupported labels such as always perfect or best at everything.",
      example:
        "I keep shared work organized. For a class project, I made a checklist and reminded our group about the draft deadline, which helped us submit on time.",
    },
    {
      topic: "Learning and feedback",
      question: "What is one skill you are still developing?",
      approach:
        "Choose a genuine manageable area, describe steps you are taking, and explain progress. Do not disguise a boast as a weakness or claim a safety-critical skill you lack.",
      example:
        "I used to speak too quickly in presentations. I now practise with a timer and pause after key points, and classmates find my explanations easier to follow.",
    },
    {
      topic: "Experience and strengths",
      question: "What school experience best shows you are ready to work?",
      approach:
        "Select an example matching the job's duties and explain your own contribution, reliability, and learning. Grades alone do not show every useful skill.",
      example:
        "I helped organize a school materials drive by sorting donations and checking our list. I completed my assigned section and told the teacher when a box needed review.",
    },
    {
      topic: "Teamwork",
      question: "Describe a time a group member was not completing their part.",
      approach:
        "Explain how you checked in, clarified responsibilities, and involved the appropriate teacher or leader when needed. Do not take credit for others or attack them.",
      example:
        "A classmate had missed a project checkpoint. I asked what was blocking them, helped split the task into smaller pieces, and checked the revised plan with our teacher.",
    },
    {
      topic: "Communication",
      question:
        "How do you ask for clarification without feeling you are bothering someone?",
      approach:
        "Ask a focused question after checking available instructions, repeat back the key step, and choose an appropriate time unless safety requires immediate help.",
      example:
        "I read the assignment first, then asked my teacher whether the final chart needed both data sets. Confirming that detail helped me complete the right work.",
    },
    {
      topic: "Reliability and school",
      question:
        "How many hours can you realistically work during a school week?",
      approach:
        "Prepare truthful availability including homework, transport, exams, and other commitments. Check age-related and employer requirements; do not promise any schedule just to get hired.",
      example:
        "I would bring a weekly schedule showing my classes, travel time, and club commitments, then explain the shifts I can reliably attend.",
    },
    {
      topic: "Reliability and school",
      question:
        "What would you do if a supervisor asked you to miss class for a shift?",
      approach:
        "Explain your school commitment respectfully, ask about another shift, and check applicable rules or get support when needed. Do not imply that a student must accept every request.",
      example:
        "I would say I am in class during that time and offer the hours I can work after school. If the situation remained unclear, I would ask a trusted adult or employment counsellor for advice.",
    },
    {
      topic: "Reliability and school",
      question: "How would you plan a reliable commute in the GTA or Peel?",
      approach:
        "Check the actual worksite, transit schedules, fare, walking connections, and return trip for the stated shifts. Be honest if the last bus makes a shift impractical.",
      example:
        "Before a school event in another neighbourhood, I checked the bus connections and return time. For a job I would do the same before confirming availability.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "What would you do if you noticed an error on your application?",
      approach:
        "Correct it promptly through the employer's approved contact method and state the accurate information. Do not hope an inaccurate qualification or date goes unnoticed.",
      example:
        "If I accidentally listed the wrong month for a school activity, I would send a brief correction before the interview and bring the updated version.",
    },
    {
      topic: "Safety and boundaries",
      question: "How would you respond to a task you believe could be unsafe?",
      approach:
        "Pause, explain the specific concern to the supervisor, and ask for training or a safe assignment. Ontario workers have safety rights with procedures and exceptions; seek official guidance rather than making an unsupported legal claim.",
      example:
        "In a school workshop, I told the teacher I had not been trained on a machine and waited for instructions instead of trying it to appear confident.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "What would you do if a coworker repeatedly made you uncomfortable?",
      approach:
        "Prioritize immediate safety, use the workplace's reporting process, and seek support from an appropriate supervisor, trusted adult, or official service. You do not need to handle threats or harassment alone.",
      example:
        "If a similar issue arose in a school club, I would note what happened and speak with the teacher rather than feel I had to resolve it privately.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How would you respond to an interview question about private information unrelated to the job?",
      approach:
        "You can ask how the question relates to essential duties and redirect to your ability and availability. Ontario human-rights protections are context-specific; use official guidance or an adviser rather than assume every question has the same legal answer.",
      example:
        "I would say, 'Could you explain how that relates to the role? I can describe my availability and how I would carry out the listed duties.'",
    },
    {
      topic: "Interview preparation",
      question: "How would you request an accommodation for an interview?",
      approach:
        "Contact the named recruiter through an official channel, explain the adjustment needed to participate, and ask about the process. You need not rehearse unnecessary personal medical details in practice.",
      example:
        "I would ask whether the interview questions could be provided in an accessible format and confirm the arrangement with the recruiter before the meeting.",
    },
    {
      topic: "Interview preparation",
      question:
        "What would you do if you did not understand an interview question?",
      approach:
        "Ask for repetition or clarification, take a short moment, and answer the question you understand. Do not invent an experience to fill the silence.",
      example:
        "I would say, 'Could you clarify whether you mean a team task or a task I completed alone?' Then I would choose a real school example that fits.",
    },
    {
      topic: "Interview preparation",
      question:
        "How would you answer a question when you have never faced that exact situation?",
      approach:
        "Say so clearly, use a relevant real example if available, and explain the safe steps you would take hypothetically. Keep past actions separate from proposed actions.",
      example:
        "I have not handled a workplace complaint. At a school event I helped a visitor find the organizer; at work I would listen and follow the supervisor's procedure.",
    },
    {
      topic: "Learning and feedback",
      question: "Tell me about learning something that was difficult at first.",
      approach:
        "Explain the specific challenge, practice or support you used, and what changed. A school, hobby, or club skill is suitable.",
      example:
        "I struggled with spreadsheet formulas in a class project. I used the teacher's examples, tested a small sheet, and asked one focused question before completing our chart.",
    },
    {
      topic: "Experience and strengths",
      question: "Describe a setback and what you learned from it.",
      approach:
        "Choose a real example you can discuss comfortably, take responsibility for your part, and explain a practical improvement. Avoid exposing another person's private information.",
      example:
        "I underestimated how long a poster would take and finished late. For the next club project I set an earlier draft deadline and checked progress halfway through.",
    },
    {
      topic: "Interview preparation",
      question:
        "How would you prepare your space and technology for a video interview?",
      approach:
        "Confirm the official meeting details, test sound and connection, choose a suitable accessible space, and arrange a contact method if the call fails. Avoid recording without permission.",
      example:
        "I would test my headset before the meeting, close unrelated tabs, and keep the recruiter's official contact details nearby in case the connection drops.",
    },
    {
      topic: "Interview preparation",
      question: "Your video interview connection drops. What would you do?",
      approach:
        "Try the agreed reconnection method and contact the recruiter through the confirmed channel. Briefly explain the problem and ask about continuing or rescheduling.",
      example:
        "If the call disconnected, I would rejoin once, then message the recruiter using their official address to explain and ask how they would like to continue.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How would you use AI tools while preparing an interview answer?",
      approach:
        "Use tools only to organize or practise your own experiences, follow any employer rules, and check the wording. Do not invent credentials, share private data, or secretly use prohibited assistance during an assessment.",
      example:
        "I could ask for a structure using an anonymous school example, then rewrite it in my own words and check that every action described really happened.",
    },
    {
      topic: "Interview preparation",
      question:
        "What would you do after an interview while waiting for a decision?",
      approach:
        "Note the stated timeline, send a brief appropriate thank-you if there is an official contact, and follow up politely after the agreed period. Continue other applications without assuming an offer.",
      example:
        "I would write down the recruiter's timeline and one point I learned, then send a short thank-you through the contact they provided rather than repeatedly message them.",
    },
    {
      topic: "Motivation",
      question: "What would a good first month at work look like to you?",
      approach:
        "Focus on learning duties, completing training, showing reliability, and getting feedback. Ask how the employer defines success instead of promising instant expertise.",
      example:
        "I would aim to learn the approved routines, arrive for my agreed shifts, ask clear questions, and check with my supervisor about what to improve.",
    },
  ],
  Retail: [
    {
      topic: "Customer service",
      question:
        "A customer asks you something you do not know. What would you do?",
      approach:
        "Explain how you would listen, be honest about what you know, and ask a trained teammate for help.",
      example:
        "At a school fundraiser, a visitor asked about an activity I was not running. I checked with the student in charge and brought back the correct information instead of guessing.",
    },
    {
      topic: "Teamwork",
      question: "Tell me about a time you worked well with other people.",
      approach:
        "Choose a real team project. Describe your contribution and how you helped the group finish.",
      example:
        "For a class presentation, I organized our shared slides and checked that everyone had time to practise. We finished the presentation by the deadline.",
    },
    {
      topic: "Customer service",
      question: "How would you handle a frustrated customer?",
      approach:
        "Listen without interrupting, stay calm, and involve a supervisor when a solution is outside your authority.",
      example:
        "At a school ticket table, a visitor was upset about a seating mix-up. I listened, checked the seating list with the teacher, and explained the options the teacher approved.",
    },
    {
      topic: "Motivation",
      question: "Why do you want to work at this store?",
      approach:
        "Research the actual store, connect a genuine interest to its work, and explain what you want to learn.",
      example:
        "I enjoy helping classmates find useful supplies. I would connect that interest to what this store sells and describe why its customer-service work appeals to me.",
    },
    {
      topic: "Ethics and privacy",
      question: "What would you do if you noticed a cash-handling mistake?",
      approach:
        "Stop, report the issue to the responsible supervisor, and follow the store’s procedure rather than hiding it.",
      example:
        "While collecting club payments, I noticed the total did not match my list. I told the teacher, checked the entries together, and corrected the record.",
    },
    {
      topic: "Problem solving",
      question: "A customer wants an item you cannot find. What would you do?",
      approach:
        "Check the tools and stock procedures you have been trained to use; offer only confirmed information.",
      example:
        "At a club sale, an item was missing from the table. I checked our supply list and asked the organizer whether we had more before giving the visitor an answer.",
    },
    {
      topic: "Safety and boundaries",
      question: "How would you respond if you suspected shoplifting?",
      approach:
        "Follow store policy and alert authorized staff. Do not confront, chase, or physically stop anyone.",
      example:
        "I have not handled that situation. I would explain that I would follow training and contact the supervisor rather than put myself or another person at risk.",
    },
    {
      topic: "Reliability and school",
      question: "What hours can you reliably work around school?",
      approach:
        "Give an honest schedule, include travel time, and explain how you communicate exam or activity commitments.",
      example:
        "I can prepare a schedule around my classes and team practice. I would give the manager the times I can consistently attend and discuss changes in advance.",
    },
    {
      topic: "Problem solving",
      question:
        "How would you prioritize a customer, a delivery, and a tidying task?",
      approach:
        "Consider safety and customer needs, communicate with the team, and follow the supervisor’s priorities.",
      example:
        "During a school event, I paused tidying to help a visitor, let another volunteer know supplies had arrived, and returned to cleanup when the visitor was helped.",
    },
    {
      topic: "Learning and feedback",
      question: "Tell me about feedback you received and used.",
      approach:
        "Choose a specific suggestion, explain how you changed your work, and describe what improved.",
      example:
        "A teacher said my presentation slides were too crowded. I shortened the text and practised explaining the ideas aloud. My next presentation was easier for classmates to follow.",
    },
    {
      topic: "Teamwork",
      question: "How would you handle a disagreement with a coworker?",
      approach:
        "Speak respectfully, focus on the task, and ask for guidance if the disagreement affects service or safety.",
      example:
        "My project partner and I wanted different slide designs. We compared both with the assignment criteria and chose one layout so we could finish the work.",
    },
    {
      topic: "Experience and strengths",
      question: "Why should we hire you if this is your first paid job?",
      approach:
        "Connect real habits and examples to the role. Be honest about what you still need to learn.",
      example:
        "I have not had a paid job, but I regularly help organize our club’s supplies and follow through on assigned tasks. I can bring that reliability and a willingness to learn.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A friend asks you to use your staff discount for them. How would you respond?",
      approach:
        "Check the actual discount policy. Do not promise an exception or share staff credentials; ask the supervisor when unsure.",
      example:
        "At a club sale, a friend asked me to give them a lower price. I explained that I needed to follow the organizer's pricing and asked the teacher about any approved discounts.",
    },
    {
      topic: "Customer service",
      question:
        "A customer disputes the price on a shelf label. What would you do?",
      approach:
        "Check the item and displayed price using the store's procedure, explain what you can confirm, and involve authorized staff for any adjustment.",
      example:
        "At a school book sale, I checked a visitor's book against the price list and asked the organizer to approve a correction rather than make up a price.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "You notice a spill near the entrance during a busy shift. What comes first?",
      approach:
        "Keep people away from the hazard, alert the responsible person, and follow the procedure and training for barriers or cleanup. Do not handle unknown substances.",
      example:
        "At a school event, I noticed a wet floor, warned the supervising teacher, and directed visitors to another doorway while staff arranged the cleanup.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "How would you help a customer who communicates differently from you?",
      approach:
        "Ask how you can help, allow time, use clear language, and offer approved written or accessible options. Do not assume what someone can understand.",
      example:
        "When a visitor had trouble hearing our school announcements, I asked if a written schedule would help and showed them the teacher-approved timetable.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A customer asks for another employee's schedule or phone number. What would you say?",
      approach:
        "Protect personal information. Offer an approved store contact or supervisor rather than reveal someone's location, schedule, or contact details.",
      example:
        "When someone asked me for a club member's phone number, I offered to pass a message through the teacher instead of sharing the number.",
    },
    {
      topic: "Learning and feedback",
      question:
        "How would you learn a new checkout system without pretending to know it?",
      approach:
        "Ask for supervised training, practise approved steps, and check before processing an unfamiliar transaction. Never use a coworker's login.",
      example:
        "I learned the sign-in system for a school event by watching the organizer, repeating the steps, and asking them to check my first entries.",
    },
    {
      topic: "Problem solving",
      question:
        "A payment does not go through. How would you explain the next step?",
      approach:
        "Be discreet, describe only what the terminal or procedure confirms, and ask authorized staff for help. Do not collect card details or speculate about finances.",
      example:
        "At a school fundraiser, I would quietly explain that the payment had not completed and ask the supervising adult to help with the approved payment options.",
    },
    {
      topic: "Ethics and privacy",
      question: "What would you do if you found a customer's wallet?",
      approach:
        "Follow lost-property procedures and hand it to authorized staff promptly. Do not search through it unnecessarily, photograph identification, or contact someone using a personal account.",
      example:
        "I found a pencil case after a club meeting and gave it to the teacher with the location where I found it instead of taking it home to find its owner.",
    },
    {
      topic: "Customer service",
      question:
        "How would you recommend a product when you are still learning the range?",
      approach:
        "Ask about the customer's needs, use approved product information, and admit limits. Avoid unsupported health, safety, or performance claims.",
      example:
        "At a school stationery table, I asked what the student needed and checked our item descriptions. I asked the organizer about a feature I could not confirm.",
    },
    {
      topic: "Teamwork",
      question:
        "Your shift ends but a task is unfinished. How would you hand it over?",
      approach:
        "Tell the supervisor what is complete, what remains, and any safety or customer concern. Ask how to hand over; do not assume permission to stay late or leave a hazard.",
      example:
        "Before leaving a club event, I told the organizer which boxes were packed and which were still open, then confirmed who would finish them.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "A task involves lifting a box that feels too heavy. What would you do?",
      approach:
        "Pause and ask about the safe method, help, or equipment. Use only equipment you are trained and authorized to use; do not prove yourself by risking injury.",
      example:
        "When a school supply box was too heavy for me, I told the teacher and helped divide the contents into smaller loads as directed.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "You are assigned closing duties for the first time. What would you check?",
      approach:
        "Ask for the approved checklist, training, supervision, and shift end time. Clarify who handles cash, alarms, and locking up; do not take on untrained or unauthorized duties.",
      example:
        "At a school club event, I checked the teacher's cleanup list and confirmed who would secure the room. I would ask a workplace supervisor to explain the closing responsibilities before doing them.",
    },
  ],
  "Food service": [
    {
      topic: "Problem solving",
      question: "How would you handle several tasks arriving at once?",
      approach:
        "Show that you can prioritize, communicate, and ask for help while following training and safety procedures.",
      example:
        "During a school event, I had to welcome visitors and restock supplies. I let a teammate know when supplies were low, finished helping the person in front of me, and then restocked.",
    },
    {
      topic: "Ethics and privacy",
      question: "What would you do if you made a mistake?",
      approach:
        "Take responsibility, tell the right person promptly, and explain how you would prevent it next time.",
      example:
        "I once put the wrong date in a club announcement. I told the club leader, corrected the post, and started checking dates against our calendar before sharing updates.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "A customer asks whether a meal is safe for their allergy. What would you do?",
      approach:
        "Treat allergies seriously, follow the restaurant’s procedure, and ask trained staff. Never guess or promise that food is safe.",
      example:
        "I would explain that I need to check the approved allergen information with the trained person in charge. I would not rely on my memory or make a guarantee.",
    },
    {
      topic: "Safety and boundaries",
      question: "What does good food hygiene mean to you?",
      approach:
        "Mention training, handwashing, clean equipment, cross-contamination prevention, and reporting concerns.",
      example:
        "At a school food event, I followed the teacher’s instructions for clean serving tools and asked before handling an unfamiliar task. At work I would follow the restaurant’s training.",
    },
    {
      topic: "Customer service",
      question: "How would you respond to a long queue?",
      approach:
        "Stay organized, communicate with teammates, and keep accuracy and safety ahead of rushing.",
      example:
        "At a school fundraiser, I greeted the next person while a teammate prepared supplies. We kept our tasks clear and checked orders instead of trying to do everything at once.",
    },
    {
      topic: "Safety and boundaries",
      question: "What would you do if you saw food being handled unsafely?",
      approach:
        "Report the concern promptly to the trained supervisor and follow the approved safety procedure.",
      example:
        "I would pause my own task if needed and tell the supervisor what I observed. I would not serve something I believed might be unsafe or pretend I knew how to fix it.",
    },
    {
      topic: "Reliability and school",
      question: "What would you do if you were going to be late?",
      approach:
        "Contact the workplace as early as possible, give a realistic update, and take steps to prevent a repeat.",
      example:
        "When a bus delay affected an after-school commitment, I messaged the organizer before the start time and gave an updated arrival estimate. I then planned an earlier bus for future meetings.",
    },
    {
      topic: "Problem solving",
      question: "How would you keep a workstation organized?",
      approach:
        "Follow the cleaning schedule, keep tools in their proper places, and reset the space between tasks.",
      example:
        "In science class, I return shared equipment to its labelled place and clean my work area as instructed. At a restaurant I would apply the same care using its specific procedures.",
    },
    {
      topic: "Customer service",
      question: "How would you handle a rude customer?",
      approach:
        "Keep your tone calm, focus on resolving the issue within your role, and get support if behaviour becomes unsafe.",
      example:
        "At an event, I would listen to the concern and explain what I could help with. If someone became threatening, I would contact the responsible staff member rather than argue.",
    },
    {
      topic: "Teamwork",
      question: "Tell me about a time your team was under pressure.",
      approach:
        "Explain how you divided work, communicated, and helped the team finish safely.",
      example:
        "Our class had limited time to set up a display. I checked which materials were missing, brought them to the group, and let the presenter focus on practising.",
    },
    {
      topic: "Motivation",
      question: "Why are you interested in food service?",
      approach:
        "Connect the work to a genuine interest in teamwork, service, or learning a fast-moving routine.",
      example:
        "I enjoy tasks where people work together and can see the result. Helping at school events showed me that I like welcoming people and keeping shared tasks organized.",
    },
    {
      topic: "Customer service",
      question: "A customer says their order is wrong. What would you do?",
      approach:
        "Confirm the problem, apologize appropriately, and follow the restaurant’s correction procedure.",
      example:
        "At a club pickup table, I checked a visitor’s request against our list and asked the organizer to approve a correction. I would use the same calm approach and follow workplace training.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "What would you do if you felt ill before a food-handling shift?",
      approach:
        "Tell the supervisor promptly and follow the workplace's illness-reporting and food-safety rules. Do not conceal symptoms or make your own decision that handling food is safe.",
      example:
        "Before a school food event, I would tell the teacher that I was unwell and ask how to follow the event's health rules rather than turn up and handle food without telling anyone.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A friend asks you to give them free food. How would you respond?",
      approach:
        "Follow the employer's payment, waste, and staff-meal policies. Do not give away items or alter records without authorization.",
      example:
        "At a club bake sale, I explained to a friend that I could not change the prices or give away the group's items without the teacher's approval.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "You are asked to use a slicer or hot equipment you have not been trained on. What would you say?",
      approach:
        "State that you need training and confirmation that the task is permitted for your age and role. Ask a trained supervisor to take over; do not experiment.",
      example:
        "In a school kitchen activity, I told the teacher I had not used the equipment before and waited for an approved demonstration and assignment.",
    },
    {
      topic: "Communication",
      question:
        "How would you check an order when background noise makes it hard to hear?",
      approach:
        "Ask the customer to repeat or confirm key details politely, then follow the order-checking procedure. Guessing creates avoidable mistakes, especially around dietary needs.",
      example:
        "At a noisy school ticket desk, I repeated the number of tickets back to the visitor and checked the list before marking the order complete.",
    },
    {
      topic: "Problem solving",
      question:
        "A delivery order is missing an item just before pickup. What would you do?",
      approach:
        "Confirm the missing item with the team and ask the authorized person how to correct or communicate the problem. Do not promise an unapproved refund or substitute.",
      example:
        "At a school supplies pickup, I noticed a missing notebook, told the organizer, and explained the replacement option only after the teacher approved it.",
    },
    {
      topic: "Inclusion and accessibility",
      question: "How would you serve someone who needs more time to order?",
      approach:
        "Be patient, ask what support is useful, and use approved accessible options. Do not rush, speak for them, or assume a companion should decide.",
      example:
        "At a school fundraiser, I gave a visitor time to read the options and asked whether they wanted me to explain anything instead of choosing for them.",
    },
    {
      topic: "Teamwork",
      question:
        "You finish your station while another teammate is falling behind. What would you do?",
      approach:
        "Check your own assigned duties, ask what help is needed, and assist only with tasks you are trained and authorized to do.",
      example:
        "After organizing our class display, I asked the group leader whether I could label materials for another table. I did not take over the unfamiliar equipment task.",
    },
    {
      topic: "Learning and feedback",
      question:
        "How would you remember a routine with several food-safety checks?",
      approach:
        "Use the employer's approved checklist and training, repeat important steps back, and ask when uncertain. Do not substitute memory tricks for required records or checks.",
      example:
        "In a school lab, I used the teacher's checklist and confirmed each required step. I would learn the restaurant's own checklist rather than assume the procedures were identical.",
    },
    {
      topic: "Safety and boundaries",
      question: "A cleaning chemical has no readable label. What would you do?",
      approach:
        "Do not use or mix it. Keep clear as needed and tell the trained supervisor so the approved chemical-safety procedure can be followed.",
      example:
        "When a bottle's label was unclear during classroom cleanup, I left it alone and told the teacher rather than smell it or try to identify it myself.",
    },
    {
      topic: "Customer service",
      question:
        "A customer asks for a change your kitchen cannot safely provide. How would you reply?",
      approach:
        "Explain only the confirmed limitation respectfully and involve the trained supervisor. Never agree to a preparation change that staff cannot safely guarantee.",
      example:
        "I would say I need the trained staff member to confirm what can be offered, rather than promise a food could be made safe for an allergy.",
    },
    {
      topic: "Reliability and school",
      question:
        "How would you handle an exam-week schedule conflict in a restaurant job?",
      approach:
        "Give truthful availability early, follow the scheduling process, and ask about approved changes. Do not promise open availability and plan to cancel later.",
      example:
        "I put exam dates in my calendar before agreeing to club duties. For a job, I would share those limits when scheduling and ask how far ahead to request changes.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "Someone asks you to skip an order check to make the queue move faster. What would you do?",
      approach:
        "Keep required safety and accuracy checks, explain the concern calmly, and ask the supervisor about an approved way to manage the queue.",
      example:
        "When our school table got busy, I kept checking names against the pickup list and asked a teammate to organize the line instead of handing out unchecked orders.",
    },
  ],
  Recreation: [
    {
      topic: "Inclusion and accessibility",
      question: "How would you help someone who feels left out of an activity?",
      approach:
        "Describe how you would listen, offer an appropriate way to join, and follow the program’s supervision and safety rules.",
      example:
        "In a group project, a quieter classmate was not getting a chance to contribute. I asked which task they wanted to try and made space for them to explain their idea.",
    },
    {
      topic: "Reliability and school",
      question: "How do you show that people can rely on you?",
      approach:
        "Use a regular commitment and describe how you prepare and communicate when plans change.",
      example:
        "I help set up equipment for team practices. I arrive early enough to do it, and if I cannot attend, I let the coach know in advance.",
    },
    {
      topic: "Safety and boundaries",
      question: "What would you do if a participant was injured?",
      approach:
        "Alert qualified staff, follow emergency procedures, and stay within your training. Never claim medical skills you do not have.",
      example:
        "I would contact the trained staff member immediately, follow their directions, and help keep other participants clear. I would not attempt treatment outside my training.",
    },
    {
      topic: "Communication",
      question: "How would you handle two children arguing?",
      approach:
        "Follow the program’s behaviour and safeguarding procedures, use calm language, and involve supervising staff.",
      example:
        "During a school group activity, two classmates disagreed about turns. I helped clarify the turn order and asked the teacher for help when the disagreement continued.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "An unfamiliar adult asks to pick up a child. What would you do?",
      approach:
        "Follow authorized pickup and identity-check procedures. Do not release a participant based on a claim alone.",
      example:
        "I would ask the responsible supervisor to verify the pickup using the program’s records. I would keep following the supervision procedure until the pickup was approved.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "How would you adapt an outdoor activity when the weather changes?",
      approach:
        "Follow safety instructions, check with supervising staff, and use an approved alternative.",
      example:
        "When rain changed a school event, I helped move materials to the indoor location chosen by the teacher. I would follow a recreation program’s weather and emergency procedures.",
    },
    {
      topic: "Inclusion and accessibility",
      question: "How would you make an activity more accessible?",
      approach:
        "Ask about preferences respectfully, offer approved options, and work with trained staff rather than make assumptions.",
      example:
        "In a class activity, I asked which part a classmate wanted to take on and offered a seated task that still contributed. In a program I would check adaptations with the supervisor.",
    },
    {
      topic: "Safety and boundaries",
      question: "How would you stay focused while supervising?",
      approach:
        "Follow supervision ratios and assigned duties, put distractions away, and communicate before leaving a post.",
      example:
        "When I help run a school station, I keep my phone away and tell the organizer before stepping out. I would follow the program’s supervision rules rather than leave a group unattended.",
    },
    {
      topic: "Problem solving",
      question: "Describe how you would plan a short activity.",
      approach:
        "Start with the age group and goal, check safety and equipment, and have an approved backup.",
      example:
        "For a class icebreaker, I chose simple instructions, prepared materials, and asked the teacher to review the plan. I also prepared a shorter version in case we ran out of time.",
    },
    {
      topic: "Teamwork",
      question:
        "Tell me about a time you took responsibility for a group task.",
      approach:
        "Explain the responsibility, the action you took, and how you kept others informed.",
      example:
        "I coordinated our group’s project checklist. I checked in with each person, flagged missing materials early, and let the teacher know when we needed advice.",
    },
    {
      topic: "Learning and feedback",
      question:
        "What would you say if a role required a certificate you do not have?",
      approach:
        "Be direct about your current qualifications. Ask about approved training and do not imply you are already certified.",
      example:
        "I would say that I do not currently hold that certificate and ask whether I need it before applying. I would only list training after completing the required course and assessment.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "How would you respond when a participant does not enjoy your activity?",
      approach:
        "Listen, avoid taking it personally, and offer a suitable alternative within program rules.",
      example:
        "A classmate did not enjoy the first task in our group activity. I asked what they preferred and helped them take on another useful role without excluding them.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "A child is missing from the expected group. What would you do first?",
      approach:
        "Immediately alert the designated supervisor and follow the program's missing-person and supervision procedures. Do not leave the remaining children unsupervised or improvise a search alone.",
      example:
        "I would tell the responsible staff member straight away and follow my assigned role in the emergency plan, keeping the rest of the group supervised as directed.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A participant wants to follow your personal social-media account. How would you respond?",
      approach:
        "Follow safeguarding and communication policies. Keep participant contact on approved organizational channels and ask the supervisor about any uncertainty.",
      example:
        "For a school club activity, I would direct questions to the teacher-managed group channel rather than accept personal messages from younger participants.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "A young participant tells you something that makes you concerned for their safety. What would you do?",
      approach:
        "Listen calmly, do not promise secrecy, and follow safeguarding and reporting requirements promptly with designated staff or authorities as appropriate. Do not investigate or question them repeatedly.",
      example:
        "I would thank them for telling me, explain that I need to get help from the appropriate responsible person, and follow the program's safeguarding procedure without trying to investigate.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "How would you include a beginner in a group with experienced players?",
      approach:
        "Ask about comfort and interests, use approved ability-appropriate options, and avoid public labels or embarrassment. Check adaptations and supervision with staff.",
      example:
        "In a school games club, I explained one rule at a time and offered a practice round so a new member could join without being singled out.",
    },
    {
      topic: "Problem solving",
      question:
        "An activity has fewer supplies than expected. How would you adapt?",
      approach:
        "Check with staff, choose an approved alternative or rotation, and keep safety, inclusion, and supervision intact. Do not use unsuitable equipment.",
      example:
        "When our class had fewer art kits than expected, I suggested a teacher-approved rotation and prepared a second activity using the materials we already had.",
    },
    {
      topic: "Communication",
      question:
        "How would you explain game rules to a group that is not listening?",
      approach:
        "Use a short clear explanation, demonstrate safely if approved, check understanding, and follow the program's behaviour procedures. Avoid shouting threats.",
      example:
        "I paused a school club game, gave three simple rules, and asked a volunteer to explain the turn order back before we restarted.",
    },
    {
      topic: "Reliability and school",
      question:
        "This role may involve early starts at different recreation sites. How would you plan travel?",
      approach:
        "Confirm the actual site and shift times, check realistic transit and backup options, and state any limits before accepting shifts. Do not promise transport you do not have.",
      example:
        "I checked bus times before joining a weekend school event and told the teacher the earliest time I could reliably arrive.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A parent asks you to change a participant's attendance record. What would you do?",
      approach:
        "Keep records accurate and refer corrections or disputes to authorized staff. Do not alter attendance just to satisfy someone or reveal other participants' information.",
      example:
        "At a school club, I would ask the teacher to review a disputed attendance entry and record only the correction they authorized.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "You notice damaged sports equipment before an activity. What would you do?",
      approach:
        "Keep it out of use according to training, alert staff, and use only an approved safe replacement. Do not attempt an untrained repair or let the activity continue with the hazard.",
      example:
        "Before a school activity, I noticed a cracked handle and showed the teacher. We used the teacher's alternative equipment instead.",
    },
    {
      topic: "Teamwork",
      question:
        "How would you handle conflicting directions from two program staff members?",
      approach:
        "Clarify the immediate priority and who is responsible, repeat back the agreed plan, and pause unsafe or unclear tasks. Avoid choosing based only on who spoke last.",
      example:
        "Two classmates asked me to bring different supplies for an event. I checked the plan with our teacher and confirmed which station needed help first.",
    },
    {
      topic: "Learning and feedback",
      question:
        "You receive feedback that your instructions are too complicated. What would you change?",
      approach:
        "Ask which part was unclear, shorten the steps, use an approved demonstration or visual, and check understanding. Describe how you would test the improvement.",
      example:
        "After classmates found my game explanation confusing, I rewrote it as three steps and asked one person to try the instructions before the next club meeting.",
    },
    {
      topic: "Motivation",
      question:
        "Why does supporting children or community recreation appeal to you?",
      approach:
        "Connect a genuine interest to the program's actual duties and responsibilities, including preparation, inclusion, and safety. Do not claim qualifications you do not hold.",
      example:
        "I enjoy helping classmates feel comfortable joining activities. I would like to learn program support while following the staff's training and supervision expectations.",
    },
  ],
  Volunteering: [
    {
      topic: "Motivation",
      question: "Why do you want to volunteer with this organization?",
      approach:
        "Mention something specific from the organization’s official website and connect it to a real interest.",
      example:
        "I enjoy helping other students learn, so I would like a role that supports learning activities. I would first check the program’s goals and training requirements.",
    },
    {
      topic: "Experience and strengths",
      question: "Tell me about a time you helped someone.",
      approach:
        "A school or community example works. Explain what the person needed, what you did, and what happened.",
      example:
        "A classmate missed a lesson before a quiz. I shared my notes and worked through a few practice questions with them. I also encouraged them to ask our teacher about anything still unclear.",
    },
    {
      topic: "Ethics and privacy",
      question: "How would you protect someone’s personal information?",
      approach:
        "Only access information needed for your role, follow privacy rules, and ask staff before sharing anything.",
      example:
        "When helping with a class contact list, I only used it for the assigned task and did not share it with friends. I would follow the organization’s privacy training in a volunteer role.",
    },
    {
      topic: "Reliability and school",
      question: "What would you do if you could not attend a shift?",
      approach:
        "Give early notice using the approved contact method and avoid promising a replacement without permission.",
      example:
        "When I could not attend a club setup session, I told the organizer early and sent my preparation notes. I would follow the volunteer coordinator’s cancellation procedure.",
    },
    {
      topic: "Motivation",
      question: "How would you stay motivated during repetitive tasks?",
      approach:
        "Connect the task to the organization’s purpose and maintain care and consistency.",
      example:
        "Sorting materials for a school event was repetitive, but it helped visitors find what they needed. I used a checklist to keep the sorting accurate through the whole task.",
    },
    {
      topic: "Motivation",
      question: "What do you know about our organization?",
      approach:
        "Use its official mission and current program information, then connect one detail to your interest.",
      example:
        "Before applying, I would read the organization’s own website and identify a service I care about. I would explain that connection using my own interest rather than repeat a slogan.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "What would you do if someone asked you to perform a task outside your training?",
      approach:
        "Explain your limits and ask the coordinator for instruction or a trained person to take over.",
      example:
        "At a school event, I was asked to use equipment I had not been shown. I told the organizer and waited for instructions rather than try to operate it alone.",
    },
    {
      topic: "Communication",
      question: "How would you handle instructions you did not understand?",
      approach:
        "Ask a focused question, repeat back the task, and confirm before starting.",
      example:
        "When a project instruction was unclear, I summarized what I thought was required and asked the teacher to confirm. That helped me correct the plan before doing the work.",
    },
    {
      topic: "Experience and strengths",
      question: "Tell me about a task you completed independently.",
      approach:
        "Choose a real responsibility, explain how you organized it, and show when you checked your work.",
      example:
        "I prepared the supplies list for a class activity, checked it against the plan, and gave the teacher the list before the deadline. I asked for help only where I needed a decision.",
    },
    {
      topic: "Motivation",
      question: "Are you volunteering only to complete school hours?",
      approach:
        "Be honest about the requirement and explain a genuine reason you want to contribute to this particular role.",
      example:
        "I do need community involvement hours, and I also want experience supporting a cause I care about. I would explain the connection and commit to the agreed responsibilities.",
    },
    {
      topic: "Customer service",
      question:
        "How would you respond to a difficult interaction with a member of the public?",
      approach:
        "Stay respectful, follow boundaries, and involve staff if you cannot resolve the issue safely.",
      example:
        "If someone was upset, I would listen and explain what my volunteer role allows me to do. I would contact the coordinator for concerns that need staff authority.",
    },
    {
      topic: "Reliability and school",
      question: "How will you balance volunteering with school?",
      approach:
        "Choose a realistic commitment and communicate changes before they affect others.",
      example:
        "I check my class schedule and major deadlines before agreeing to a commitment. I would choose a shift I can maintain and talk with the coordinator early if exams change my availability.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A volunteer application asks for a reference. Who would you choose?",
      approach:
        "Ask a real teacher, coach, or other suitable person for permission first, check the organization's rules, and share their details only as agreed. Never invent a reference.",
      example:
        "I would ask the teacher who supervised our club project whether they could speak about my reliability and confirm which contact details I may provide.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "You are assigned a volunteer task involving tools you have never used. How would you respond?",
      approach:
        "Tell the coordinator, ask about age restrictions and training, and request a safe permitted task while the requirements are checked. Do not learn by trial and error.",
      example:
        "At a school garden activity, I told the supervising teacher which tools I had not used and worked on the hand-sorting task they approved.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A visitor asks you for advice that should come from a professional. What would you do?",
      approach:
        "Explain the limits of your volunteer role and connect them with authorized staff or an approved service. Do not provide medical, legal, immigration, or financial advice.",
      example:
        "At a community information table, I would show the approved service contact and ask the coordinator for help rather than answer a legal question from my own guesses.",
    },
    {
      topic: "Communication",
      question:
        "How would you welcome someone who is unfamiliar with the event?",
      approach:
        "Greet them respectfully, ask what they need, and explain confirmed information in plain language. Offer approved language or accessibility support when available.",
      example:
        "At a school open house, I asked visitors which room they were looking for and used the teacher-approved map to explain the route.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "What would you do if you heard another volunteer make an exclusionary comment?",
      approach:
        "Support a respectful environment, follow the reporting procedure, and involve the coordinator. Do not require the affected person to confront someone or explain their identity.",
      example:
        "In a school club, I would interrupt an exclusionary joke calmly if safe and tell the teacher so they could address it and support the student affected.",
    },
    {
      topic: "Reliability and school",
      question:
        "The organization wants a longer commitment than you can make. What would you say?",
      approach:
        "State your real availability and ask whether a shorter or different role is possible. Reliable limited participation is better than an unrealistic promise.",
      example:
        "I would explain that I can commit through the end of the term and ask whether the coordinator has a project that fits that period.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How would you make sure your community involvement hours are recorded honestly?",
      approach:
        "Confirm school and organization rules before starting, keep accurate dates and tasks, and obtain approval from the appropriate supervisor. Never add unworked hours.",
      example:
        "I would keep a dated record after each approved activity and ask the supervising teacher to confirm it rather than estimate extra hours at the end of the year.",
    },
    {
      topic: "Problem solving",
      question:
        "An event location changes and visitors arrive at the old entrance. What would you do?",
      approach:
        "Check the correct information with the coordinator, communicate an approved update, and keep assigned safety and access arrangements in place.",
      example:
        "When our school club moved rooms, I checked with the teacher and put an approved direction sign at the original door while another student welcomed arrivals.",
    },
    {
      topic: "Teamwork",
      question:
        "You disagree with how a volunteer task is divided. How would you raise it?",
      approach:
        "Describe the practical issue respectfully, suggest a fair workable adjustment, and let the coordinator decide where necessary. Avoid abandoning the task or blaming teammates.",
      example:
        "At a school fundraiser, I noticed one table had twice the packing work. I asked the organizer whether I could switch to help after finishing my own assigned tasks.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "Someone wants to photograph people receiving a service. What would you do?",
      approach:
        "Follow the organization's consent, privacy, and safeguarding rules and refer the request to authorized staff. Do not assume participation means consent to photos.",
      example:
        "At a school community event, I would ask the teacher to check the photo permissions before taking or sharing any image.",
    },
    {
      topic: "Experience and strengths",
      question:
        "What can you contribute if you are still learning about this cause?",
      approach:
        "Name a real transferable skill, show willingness to learn from staff and the community, and avoid claiming expertise. Connect your contribution to the posted duties.",
      example:
        "I can organize information and follow a checklist, as I did for our class supply drive. I would learn the organization's process before suggesting changes.",
    },
    {
      topic: "Learning and feedback",
      question:
        "How would you respond if a task differs from what you expected when applying?",
      approach:
        "Clarify the duties and training with the coordinator, explain any limits, and ask whether the assignment fits your role and school requirements. Do not assume every request must be accepted.",
      example:
        "If a volunteer assignment changed from sorting books to an unfamiliar activity, I would ask what training and supervision were provided before agreeing to do it.",
    },
  ],
  Tutoring: [
    {
      topic: "Motivation",
      question: "Why do you want to support younger students as a tutor?",
      approach:
        "Connect a genuine interest in learning with patient support and the centre's actual methods. Tutoring does not require pretending you already know every subject or curriculum.",
      example:
        "I enjoyed reviewing class notes with a friend and finding another way to explain a problem. I would like to learn the centre's approach to supporting students.",
    },
    {
      topic: "Experience and strengths",
      question: "Which subjects and grade levels can you honestly help with?",
      approach:
        "Name only subjects you can support, explain your recent relevant learning, and ask how the employer assesses readiness. Do not claim certification or teaching experience you do not have.",
      example:
        "I am comfortable with the algebra I have completed in school. I would tell the centre which courses I have taken and ask how they check a student tutor's subject knowledge.",
    },
    {
      topic: "Communication",
      question:
        "How would you explain a concept without simply giving the answer?",
      approach:
        "Ask what the learner already understands, break the task into steps, and use questions or a suitable example within the approved method. Check understanding before moving on.",
      example:
        "When a classmate asked about a fraction problem, I asked which step was confusing, worked through a different example, and let them try the original question.",
    },
    {
      topic: "Learning and feedback",
      question:
        "A student still does not understand after your first explanation. What would you try?",
      approach:
        "Stay patient, ask where understanding breaks down, try an approved alternative representation, and involve a trained instructor if needed. Repeating the same explanation louder is not a plan.",
      example:
        "In a study group, I replaced a long explanation with a simple diagram and asked my classmate to show the next step in their own words.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "How would you support a learner who is embarrassed about making mistakes?",
      approach:
        "Use respectful language, recognize effort and specific progress, and keep feedback private where appropriate. Do not compare students publicly or label ability.",
      example:
        "When a classmate hesitated to share an answer, I said we could check one step together and focused on the reasoning they had already got right.",
    },
    {
      topic: "Problem solving",
      question:
        "Two students need help at the same time. How would you manage it?",
      approach:
        "Follow the centre's supervision and lesson procedures, acknowledge both students, and give an approved independent step while helping one. Ask the lead instructor if support is insufficient.",
      example:
        "At a school study session, I checked which question each person was on, asked one to review a completed example, and helped the other with a short step before switching.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A student asks you to complete a graded assignment for them. What would you say?",
      approach:
        "Protect academic integrity: explain, guide practice, and follow school or centre rules without doing assessed work or impersonating the learner.",
      example:
        "I would say I can help them understand the method and practise a similar question, but they need to write and submit their own answer.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A parent asks you to guarantee a higher grade. How would you respond?",
      approach:
        "Do not promise results you cannot control. Explain your support role and refer progress plans or contractual questions to the qualified instructor or manager.",
      example:
        "I would explain that I can support practice and follow the learning plan, while the lead instructor can discuss progress expectations and the centre's services.",
    },
    {
      topic: "Ethics and privacy",
      question: "You notice you taught a step incorrectly. What would you do?",
      approach:
        "Acknowledge the error, verify the correct method with an approved source or instructor, and correct it clearly. Do not leave a wrong explanation to protect your image.",
      example:
        "In a study group, I realized I had copied a sign incorrectly. I told my classmate, checked the textbook example, and worked through the corrected step with them.",
    },
    {
      topic: "Safety and boundaries",
      question: "What boundaries would you follow when working with children?",
      approach:
        "Follow safeguarding, supervision, pickup, and approved communication policies. Ask for training and report concerns; do not arrange private contact or make promises of secrecy.",
      example:
        "I would use the centre's approved learning space and messages, keep the supervisor informed, and direct any personal contact request to the responsible staff member.",
    },
    {
      topic: "Inclusion and accessibility",
      question: "How would you support a student who needs an accommodation?",
      approach:
        "Ask the qualified instructor about the approved plan and the learner's preferences, provide permitted support, and protect privacy. Do not diagnose or decide accommodations alone.",
      example:
        "I would check whether the instructor wanted me to use larger print or shorter steps and follow that plan without discussing the student's needs with others.",
    },
    {
      topic: "Communication",
      question:
        "How would you check whether a learner understands rather than just agrees?",
      approach:
        "Invite them to explain a step or try a suitable new example without pressure. Use the centre's assessment method and avoid treating a nod as proof.",
      example:
        "After reviewing a school problem, I asked my classmate to talk through a similar one and explain why they chose the first step.",
    },
    {
      topic: "Reliability and school",
      question:
        "How would you balance regular tutoring shifts with your own homework?",
      approach:
        "Plan realistic hours, include preparation and travel, and communicate school deadlines early. Do not commit to sessions you cannot consistently attend.",
      example:
        "I would check my course workload before agreeing to a weekly shift and tell the manager about exam dates through the normal scheduling process.",
    },
    {
      topic: "Ethics and privacy",
      question: "What would you record in a student's progress note?",
      approach:
        "Use only the required factual learning observations in the approved system. Avoid diagnoses, personal opinions, unnecessary private details, or copying records to a personal account.",
      example:
        "For a supervised school activity, I would record that we practised multiplication and which step needed review, then give the note to the teacher through the approved process.",
    },
    {
      topic: "Customer service",
      question:
        "A parent is unhappy with a session. How would you handle the conversation?",
      approach:
        "Listen respectfully, describe only what you are authorized to discuss, and involve the lead instructor or manager. Protect other students' information and avoid arguing.",
      example:
        "I would hear the concern and ask the lead instructor to discuss the learning plan, rather than make a refund promise or compare the child with another learner.",
    },
    {
      topic: "Learning and feedback",
      question:
        "You are asked to tutor a topic you have not learned yet. What would you do?",
      approach:
        "Be honest about the gap and ask the qualified instructor for preparation or reassignment. Do not teach guesses or claim proficiency based on a quick search.",
      example:
        "I would explain that I have not covered that topic in school and ask whether I should observe training or support a different task first.",
    },
    {
      topic: "Problem solving",
      question: "How would you plan a short practice session?",
      approach:
        "Use the approved learning goal, check prior understanding, choose suitable practice, and allow time to review. Do not replace the centre's curriculum without permission.",
      example:
        "For a class study group, I planned one review example, a few practice questions, and a final check on the step people found hardest.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "A student finishes quickly while another needs more time. What would you do?",
      approach:
        "Offer approved extension or review work, keep attention respectful, and avoid publicly comparing speed or ability. Ask the lead instructor about the right balance.",
      example:
        "At a school revision session, I asked one classmate to check their reasoning on an extra example while I reviewed a step with another student.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "An online learner wants to move the lesson to your personal chat account. What would you say?",
      approach:
        "Keep sessions and records on approved platforms, follow guardian and safeguarding rules, and inform the supervisor of the request. Do not move private communication off-platform.",
      example:
        "I would say that lessons need to stay on the centre's approved system and ask the instructor to help with any access problem.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A student shares another student's test results with you. What would you do?",
      approach:
        "Do not spread, photograph, or use someone else's results for comparison. Follow privacy procedures and ask the instructor how to handle the information appropriately.",
      example:
        "In a school study group, I would return the paper to the teacher rather than show it around or discuss the other student's score.",
    },
    {
      topic: "Teamwork",
      question:
        "How would you work with a lead instructor whose teaching method differs from yours?",
      approach:
        "Learn the approved approach, ask about the reasoning, and discuss suggestions respectfully outside the learner's session. Do not undermine the instructor in front of students.",
      example:
        "For a peer-support activity, I asked the teacher how they wanted us to show a calculation and used that method so classmates received consistent guidance.",
    },
    {
      topic: "Communication",
      question: "A learner says they hate the subject. How would you respond?",
      approach:
        "Acknowledge the frustration, ask about one specific difficulty, and work on a manageable step. Do not dismiss feelings or promise they will love the subject immediately.",
      example:
        "A classmate said maths felt impossible. I asked which part of the current problem was hardest and suggested we check just that step before doing more.",
    },
    {
      topic: "Interview preparation",
      question:
        "How would you prepare for a tutoring interview's subject exercise?",
      approach:
        "Review the stated subjects and format, practise explaining reasoning aloud, and use only permitted aids. Be honest about questions you cannot solve.",
      example:
        "I would revise the course topics I listed on my application, practise a clear explanation, and say where I am unsure rather than hide an answer source.",
    },
    {
      topic: "Motivation",
      question:
        "What does successful tutoring look like beyond finishing worksheets?",
      approach:
        "Discuss understanding, learner confidence, appropriate independence, and honest progress within the centre's methods. Do not equate speed or perfect marks with all learning.",
      example:
        "In a study group, I felt the session helped when a classmate could explain the method and attempt the next question without me supplying each step.",
    },
  ],
  "Office and reception": [
    {
      topic: "Motivation",
      question:
        "Why are you interested in an office, library, or reception support role?",
      approach:
        "Connect the posted duties to real organization or communication habits and what you want to learn. Avoid assuming every office role has the same tasks.",
      example:
        "I enjoy organizing information for our school club and helping visitors find the right person. I would like to learn how your reception team handles those tasks.",
    },
    {
      topic: "Communication",
      question: "How would you answer a call when you do not know the answer?",
      approach:
        "Use the approved greeting, listen, note only necessary details, and transfer or ask authorized staff. Do not invent information or share private contact details.",
      example:
        "At a school event desk, I would write down the visitor's question and ask the teacher who should answer it rather than guess about the event's rules.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "An email contains personal information you do not need. What would you do?",
      approach:
        "Follow the organization's privacy and incident procedures, restrict access, and ask authorized staff what to do. Do not forward it to friends or move it to a personal account.",
      example:
        "If a school club message accidentally included private student details, I would tell the teacher and follow their instructions rather than copy it into our group chat.",
    },
    {
      topic: "Problem solving",
      question: "How would you check a spreadsheet for entry errors?",
      approach:
        "Use the approved source and checking process, compare small batches, and flag unclear entries. Do not silently guess missing facts or overwrite records without authorization.",
      example:
        "For a club inventory, I compared our sheet with the labelled boxes and asked the teacher about two unclear entries before changing them.",
    },
    {
      topic: "Reliability and school",
      question:
        "Several people give you tasks with the same deadline. What would you do?",
      approach:
        "Write down the requests, clarify urgency and ownership with the supervisor, and communicate realistic completion times. Do not promise all tasks without checking the workload.",
      example:
        "When two teachers needed club materials on the same day, I explained both requests to our organizer and confirmed the order in which I should prepare them.",
    },
    {
      topic: "Customer service",
      question:
        "A visitor arrives for an appointment that is not on the schedule. What would you do?",
      approach:
        "Check the approved system discreetly and contact authorized staff. Avoid blaming the visitor, announcing private details, or granting access without approval.",
      example:
        "At a school open house, I would check the sign-in list with the teacher and ask them to confirm the visitor's next step.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "Someone wants to enter a staff-only area without checking in. What would you do?",
      approach:
        "Follow visitor and access procedures, contact responsible staff, and avoid physical confrontation. Do not let confidence or familiarity replace authorization.",
      example:
        "At a school event, I would direct the visitor to the teacher responsible for check-in instead of letting them into a restricted room on my own authority.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "You send a document to the wrong recipient. What would you do?",
      approach:
        "Report the error promptly through the approved privacy or incident process and follow instructions to contain it. Do not conceal it or assume deleting your copy fixes the disclosure.",
      example:
        "If I sent a school club file to the wrong address, I would tell the supervising teacher immediately and follow their directions before sending further messages.",
    },
    {
      topic: "Learning and feedback",
      question: "How would you learn an unfamiliar booking or filing system?",
      approach:
        "Ask for training and approved examples, take permitted notes without sensitive data, and check early work. Use your own authorized account and ask before changing settings.",
      example:
        "I learned our club's shared folder system by following the teacher's naming rules and asking them to check the first file I added.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "How would you help a visitor who needs information in another format?",
      approach:
        "Ask what format or support would help, use approved accessible materials, and involve the appropriate staff. Do not assume everyone can use a phone, read small print, or hear announcements.",
      example:
        "At a school information desk, I would ask whether a printed larger-text schedule would help and check with the teacher about available formats.",
    },
    {
      topic: "Communication",
      question: "How would you write a short professional email?",
      approach:
        "Use a clear subject, a polite greeting, the purpose and necessary details, and a specific next step. Check names, dates, recipient, and attachments before sending.",
      example:
        "For a club meeting, I would write the date and location clearly, ask members to confirm attendance, and recheck the teacher-approved details before sending.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A friend asks you to look up someone's contact information in the system. How would you respond?",
      approach:
        "Access records only for authorized work and refuse personal searches. Refer legitimate requests to the proper staff process.",
      example:
        "I would say that I cannot use the organization's records for personal reasons and point my friend to the public contact channel if appropriate.",
    },
    {
      topic: "Problem solving",
      question:
        "You find two versions of a document with different instructions. What would you do?",
      approach:
        "Check the approved owner, date, and version-control process, then ask which version is current. Do not combine conflicting directions by guessing.",
      example:
        "Our school club had two event schedules. I asked the teacher which one was approved and shared only the confirmed version with volunteers.",
    },
    {
      topic: "Teamwork",
      question: "How would you hand over a task to someone on the next shift?",
      approach:
        "Summarize completed work, pending steps, deadlines, and approved access to necessary information. Keep private details within authorized channels.",
      example:
        "Before leaving a school sign-in table, I told the next helper which pages were checked and asked the teacher to handle the one unresolved entry.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How would you take meeting notes without recording more than necessary?",
      approach:
        "Confirm what notes are required, record decisions and assigned actions accurately, and follow privacy and storage rules. Do not secretly record audio or add personal judgments.",
      example:
        "For a class project meeting, I wrote the agreed tasks and due dates in our approved shared document rather than include unrelated comments about classmates.",
    },
    {
      topic: "Customer service",
      question:
        "A caller is upset about waiting for a response. How would you help?",
      approach:
        "Listen, confirm the issue without exposing records, explain only approved timelines, and escalate when needed. Do not guarantee a response time you cannot control.",
      example:
        "I would acknowledge the concern, ask the responsible staff member for the correct next step, and share only the information they authorize.",
    },
    {
      topic: "Reliability and school",
      question:
        "You realize a task will take longer than promised. What would you do?",
      approach:
        "Tell the supervisor early, explain the remaining work, and ask about revised priorities or support. Avoid hiding the delay until the deadline.",
      example:
        "When our club inventory took longer than expected, I told the teacher which section remained and asked whether to finish it first or prepare the meeting materials.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A manager asks you to sign or approve a document outside your role. How would you respond?",
      approach:
        "Clarify your authority and direct the document to an authorized person. Do not sign for someone else or imply approval you cannot give.",
      example:
        "If a school form needed a teacher's signature, I would bring it to the teacher instead of copying their name to keep the process moving.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "What would you do if you noticed a suspicious attachment or login request?",
      approach:
        "Do not open unknown attachments, enter credentials, or approve unexpected access. Verify using a known official channel and follow the organization's security reporting process.",
      example:
        "If a club email unexpectedly asked for our password, I would stop and check with the teacher through our usual contact method rather than reply with the password.",
    },
    {
      topic: "Experience and strengths",
      question:
        "What experience shows attention to detail without a previous office job?",
      approach:
        "Choose a real task involving names, dates, quantities, or instructions and explain how you checked it. Do not invent a professional administration role.",
      example:
        "For a school trip list, I checked the teacher's approved names against our club count and flagged an entry that needed clarification.",
    },
    {
      topic: "Communication",
      question:
        "How would you explain a routine process to a new student helper?",
      approach:
        "Give clear steps using approved instructions, check understanding, and identify where they should ask for authorization. Keep passwords and private records out of practice examples.",
      example:
        "I showed a new club helper how to label supply boxes, watched them try one, and explained which questions needed the teacher's decision.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "A visitor struggles with an online form. How would you assist while protecting privacy?",
      approach:
        "Offer approved instructions or accessibility support and let the person control their personal answers. Do not request passwords, take over consent, or save private information.",
      example:
        "At a school information table, I would point out the form's help instructions and ask the teacher about support rather than ask the visitor to tell me their password.",
    },
    {
      topic: "Interview preparation",
      question:
        "How would you prepare for a short typing or spreadsheet assessment?",
      approach:
        "Check the announced format, practise relevant basic skills, and ask about permitted tools or accommodations. Accuracy and honest independent work matter more than exaggerated speed claims.",
      example:
        "I would practise entering a small sample table and checking totals, then complete the employer's assessment using only the tools they allow.",
    },
    {
      topic: "Learning and feedback",
      question:
        "What would you do if you were corrected about an office procedure?",
      approach:
        "Listen, confirm the correct method, update permitted notes, and apply the change. Ask whether earlier work also needs review rather than assume the correction affects only future tasks.",
      example:
        "After my teacher explained the folder naming rule, I repeated it back and asked whether the files I had already added needed to be renamed.",
    },
  ],
  "Technology internship": [
    {
      topic: "Motivation",
      question: "Why are you interested in this beginner technology placement?",
      approach:
        "Connect a real project or learning interest to the posted duties and explain what you want to learn. Distinguish school or hobby experience from professional experience.",
      example:
        "I enjoyed building a small class website and checking how people used it. Your posting's testing tasks interest me because I want to learn a more structured process.",
    },
    {
      topic: "Experience and strengths",
      question: "Walk me through a small project you actually made.",
      approach:
        "Explain the goal, your own contribution, tools used, and one limitation or lesson. Credit teammates, tutorials, libraries, and AI assistance honestly where relevant.",
      example:
        "For a class project, I built the navigation on a simple website while my partner wrote the content. I learned to test links and explain which parts I had completed.",
    },
    {
      topic: "Problem solving",
      question:
        "Your code does not behave as expected. How would you investigate?",
      approach:
        "Reproduce a small example, read the error, check recent changes and documentation, then ask a focused question. Do not run unknown commands or expose private data in public help requests.",
      example:
        "In a school coding exercise, I reduced the problem to one function and checked its inputs. I then showed my teacher the error and the steps I had tried.",
    },
    {
      topic: "Learning and feedback",
      question:
        "You are assigned a tool you have never used. What would you do?",
      approach:
        "State the gap, ask about approved training and a small safe task, and check understanding early. Do not claim proficiency after only watching a video.",
      example:
        "I would say I have not used that tool yet, review the team's approved introduction, and ask someone to check my first practice task before using it on real work.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How would you handle a password or API key found in a project file?",
      approach:
        "Do not use, copy, share, or test the secret. Report it promptly through the approved security process so authorized staff can contain the exposure.",
      example:
        "If I noticed a key in a school project, I would stop sharing the file and tell the teacher. I would not post the key in a help forum to ask whether it worked.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "You are asked to change a live system without supervision. What would you do?",
      approach:
        "Clarify authorization, training, testing, review, and rollback procedures. Do not experiment in production or exceed the access assigned to a student role.",
      example:
        "I would ask to practise in the approved test environment and have the responsible staff member review the change before any live update.",
    },
    {
      topic: "Teamwork",
      question:
        "How would you explain a technical problem to a teammate who is not a coder?",
      approach:
        "Describe the visible problem and impact in plain language, show a safe example, and explain the next step. Avoid jargon or making them feel at fault.",
      example:
        "For our class website, I explained that one navigation link opened the wrong page and showed the two steps that reproduced it instead of listing code terms.",
    },
    {
      topic: "Learning and feedback",
      question: "Tell me about useful feedback on a project.",
      approach:
        "Choose a real suggestion and explain the revision and what you learned. Do not describe all feedback as criticism to overcome.",
      example:
        "A classmate said our buttons were hard to read. I checked the colours with the teacher's guidance, increased contrast, and asked them to try the page again.",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "How would you consider accessibility in a simple digital project?",
      approach:
        "Use approved accessibility guidance, test basic tasks such as keyboard navigation, and ask for review. Do not claim that one automated check proves a product is accessible to everyone.",
      example:
        "For a class page, I checked that links had clear names and could be reached with the keyboard, then asked the teacher what else we should test.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How would you use AI assistance during a technical internship?",
      approach:
        "Follow the employer's policy, keep confidential information out of unapproved tools, review generated work, and disclose assistance where required. You remain responsible for understanding your contribution.",
      example:
        "On a permitted school task, I used a tool to explain an error, checked the suggestion against our lesson, and could describe the final code myself.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "A teammate suggests copying code with unclear permission. How would you respond?",
      approach:
        "Check the source, licence, attribution, and team rules before reuse; ask the supervisor if uncertain. Publicly viewable code is not automatically unrestricted.",
      example:
        "For a school website, I asked the teacher whether an image and code sample could be reused, then used materials with suitable permission and kept the required credit.",
    },
    {
      topic: "Problem solving",
      question: "How would you turn a vague feature request into a clear task?",
      approach:
        "Ask who needs the feature, what problem it solves, the expected behaviour, constraints, and how completion will be checked. Confirm the scope before building.",
      example:
        "When our club wanted a better sign-up page, I asked which information was needed and what should happen after submission, then wrote a short plan for the teacher to review.",
    },
    {
      topic: "Teamwork",
      question: "Two teammates changed the same file. What would you do?",
      approach:
        "Use the team's version-control process, inspect both intended changes, and ask for review before resolving a conflict. Do not overwrite another person's work without checking.",
      example:
        "In a class shared document, I compared the two versions with my partner and asked the teacher about the conflicting instruction before we agreed on a combined update.",
    },
    {
      topic: "Reliability and school",
      question:
        "You are stuck on a task near the end of a remote work session. How would you update the team?",
      approach:
        "Send a concise update through approved channels stating progress, the blocker, what you tried, and a focused question. Respect the agreed hours rather than disappear or promise an all-night fix.",
      example:
        "I would write that the test case works for one input but fails for another, include a safe example, and ask when a teammate can review it during our agreed hours.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "What would you do if a test data set contained real personal information?",
      approach:
        "Stop unnecessary access or copying and tell the supervisor through the approved privacy process. Do not upload it to personal tools or assume test data is safe to publish.",
      example:
        "If a school practice sheet unexpectedly included private contact details, I would tell the teacher and use an approved anonymized sample instead.",
    },
    {
      topic: "Problem solving",
      question:
        "How would you decide what to test before calling a small task complete?",
      approach:
        "Check the agreed requirements, normal use, reasonable edge cases, and any relevant safety or accessibility checks. Ask what review is required; do not invent passing results.",
      example:
        "For our class calculator, I tried the examples in the instructions and a blank input, recorded the actual results, and told the teacher about the case that still failed.",
    },
    {
      topic: "Experience and strengths",
      question:
        "What would you say if asked about a programming language you do not know?",
      approach:
        "State your actual level and describe relevant learning habits or related experience without implying equivalence. Ask what beginner knowledge the placement expects.",
      example:
        "I would say I have used introductory Python at school but have not used Java, then explain how I learned the basics and ask about the placement's training.",
    },
    {
      topic: "Ethics and privacy",
      question:
        "You accidentally delete or overwrite a shared file. What would you do?",
      approach:
        "Report it promptly, stop actions that could worsen the problem, and follow approved recovery steps with authorized staff. Do not hide the error or try risky recovery commands.",
      example:
        "I would tell the project lead exactly what I changed and ask them to guide recovery from the approved version history rather than keep experimenting.",
    },
    {
      topic: "Communication",
      question: "How would you ask a technical mentor for help effectively?",
      approach:
        "Summarize the goal, a small safe example, the exact error, and what you already tried. Remove secrets and private data and respect the agreed communication channel.",
      example:
        "I would show my teacher a short sample that reproduces the issue, describe the expected result, and ask which part of my reasoning I should check next.",
    },
    {
      topic: "Reliability and school",
      question: "How would you manage remote work alongside high school?",
      approach:
        "Agree on realistic hours, communication windows, supervision, and deliverables. Check eligibility and school commitments before accepting; remote does not mean available all day.",
      example:
        "I would explain that classes occupy my weekday mornings and ask whether the placement's meetings and tasks fit the hours I can consistently provide.",
    },
    {
      topic: "Safety and boundaries",
      question:
        "Someone asks you to test another organization's website without clear permission. What would you do?",
      approach:
        "Do not probe, bypass controls, scan, or access data without explicit authorized scope. Ask the supervisor to clarify and use approved training environments for practice.",
      example:
        "I would ask for the written approved scope and a training environment rather than try techniques on a public site to demonstrate enthusiasm.",
    },
    {
      topic: "Inclusion and accessibility",
      question: "How would you respond when a user reports a confusing design?",
      approach:
        "Listen to their experience, ask about the task they were trying to complete, and reproduce it safely. Avoid blaming them or assuming one person's needs represent everyone.",
      example:
        "A classmate could not find our project menu. I asked what they expected to click, watched the steps with permission, and brought the observation to our group.",
    },
    {
      topic: "Ethics and privacy",
      question: "Would you put an internship project in your public portfolio?",
      approach:
        "Ask about confidentiality, ownership, permissions, and attribution before sharing. Use approved public descriptions or personal practice work when private material cannot be shown.",
      example:
        "I would ask the supervisor which parts, if any, I may show and credit collaborators. If permission was not given, I would describe the skill using my own school project instead.",
    },
    {
      topic: "Motivation",
      question:
        "What would you hope to learn from a supervised beginner placement?",
      approach:
        "Name specific realistic goals such as reading tasks, testing, asking good questions, or using team tools. Avoid claiming you can replace trained staff immediately.",
      example:
        "I would like to learn how a team reviews small changes and documents test results, building on the simple projects I have completed at school.",
    },
  ],
  "Questions to ask": [
    {
      topic: "Learning and feedback",
      question: "What could you ask about training before your first shift?",
      approach:
        "Ask what orientation covers, who supervises new students, and how unfamiliar tasks are practised safely. Use the answer to understand support, not to suggest you already need no training.",
      example:
        "'What training and supervised practice would I receive before doing these tasks on my own?'",
    },
    {
      topic: "Reliability and school",
      question: "What could you ask about scheduling around classes and exams?",
      approach:
        "Explain your real availability and ask how far ahead schedules and change requests are handled. Do not hide school commitments until after accepting.",
      example:
        "'How far in advance are shifts posted, and what is the process for sharing exam-week availability?'",
    },
    {
      topic: "Motivation",
      question: "How could you ask what success in the role looks like?",
      approach:
        "Ask about concrete duties and realistic expectations for a beginner's first weeks. This helps you understand the job without promising results before training.",
      example:
        "'What would you want a new student employee to learn or do well during the first month?'",
    },
    {
      topic: "Teamwork",
      question: "What could you ask about who would support you at work?",
      approach:
        "Ask who sets priorities, answers questions, and supervises your shift, especially during evenings or remote work. Avoid assuming a manager is always on site.",
      example:
        "'Who would I check with if I am unsure about a task during my shift?'",
    },
    {
      topic: "Safety and boundaries",
      question: "What could you ask about safety equipment and task training?",
      approach:
        "Ask what hazards, approved equipment, training, and supervision apply to the actual duties and your age. Check official Ontario guidance when requirements are unclear.",
      example:
        "'What safety training and equipment are provided, and which tasks would I be authorized to do?'",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How could you ask about pay without making an unsupported assumption?",
      approach:
        "Politely confirm the pay rate, pay schedule, and how hours are recorded. Where rules or exceptions are unclear, check current official guidance rather than rely on a practice example.",
      example:
        "'Could you confirm the hourly pay for this role and how employees record their hours?'",
    },
    {
      topic: "Ethics and privacy",
      question:
        "What could you ask about whether a trial shift or training is paid?",
      approach:
        "Ask before agreeing to attend or perform work, and request clear written details. Whether a situation counts as employment depends on the facts; seek official advice if uncertain.",
      example:
        "'Before I confirm, could you explain what the trial involves and whether that time and required training are paid?'",
    },
    {
      topic: "Reliability and school",
      question: "How could you ask about the actual worksite and late shifts?",
      approach:
        "Confirm the address, whether sites change, shift end times, and any approved transport arrangements. Do not assume a posted city identifies every shift location.",
      example:
        "'Would all my shifts be at this location, and what time do evening shifts normally end?'",
    },
    {
      topic: "Inclusion and accessibility",
      question:
        "What could you ask about an accommodation needed to participate in the role?",
      approach:
        "Use the employer's official accommodation process and describe the adjustment needed rather than unnecessary personal details. Do not assume a practice example determines your rights or eligibility.",
      example:
        "'Who should I contact to discuss an accommodation for the hiring process or the duties of this role?'",
    },
    {
      topic: "Customer service",
      question:
        "What could you ask about handling difficult customer interactions?",
      approach:
        "Ask about training, your authority, and when a supervisor takes over. This is especially useful for a first public-facing role.",
      example:
        "'What should a new student employee do when a customer issue needs a supervisor's help?'",
    },
    {
      topic: "Ethics and privacy",
      question: "How could you ask about handling personal information?",
      approach:
        "Ask what information you would access, which approved systems to use, and how privacy incidents are reported. Do not request real customer records during the interview.",
      example:
        "'What privacy training is provided for staff who handle bookings or customer information?'",
    },
    {
      topic: "Interview preparation",
      question: "What could you ask about the next stage after the interview?",
      approach:
        "Ask about the expected timeline, any assessment, and the approved contact for follow-up. Do not treat an estimate as a guaranteed offer.",
      example:
        "'What are the next steps in the process, and when would you expect to contact applicants?'",
    },
    {
      topic: "Learning and feedback",
      question: "What could you ask about feedback during a first job?",
      approach:
        "Ask how and when new employees receive feedback and whom to approach with a question. Choose a question that helps you learn, not one seeking constant praise.",
      example:
        "'How do you check in with new student employees and help them improve during the first few weeks?'",
    },
    {
      topic: "Safety and boundaries",
      question:
        "What could you ask about supervision when working with children?",
      approach:
        "Ask about safeguarding, authorized pickup, communication, and who handles concerns. Do not assume a student helper can supervise alone or set their own rules.",
      example:
        "'What safeguarding training and supervision would I have when supporting children in this program?'",
    },
    {
      topic: "Ethics and privacy",
      question:
        "What could you ask before providing a police or vulnerable-sector check?",
      approach:
        "Ask which check is actually required, for what stage, who provides instructions, and what age or process rules apply. Do not obtain or send sensitive documents through an unverified request.",
      example:
        "'Which check, if any, is required for this role, and would you provide the official instructions if I am selected?'",
    },
    {
      topic: "Learning and feedback",
      question: "What could you ask about a certificate listed in the posting?",
      approach:
        "Clarify whether it must be completed before applying, before starting, or through approved employer training, and who covers any cost. Do not imply you already hold it.",
      example:
        "'I do not currently hold that certificate. At what stage is it required, and is there an approved training pathway?'",
    },
    {
      topic: "Reliability and school",
      question: "What could you ask before accepting a volunteer commitment?",
      approach:
        "Confirm actual duties, minimum time commitment, supervision, cancellation process, and any costs. Volunteering is still a commitment you need to fit around school.",
      example:
        "'What weekly commitment is expected, and whom would I contact if a school obligation affects a shift?'",
    },
    {
      topic: "Ethics and privacy",
      question:
        "How could you ask whether volunteer activities qualify for school hours?",
      approach:
        "Ask what tasks and supervision records the organization provides, then confirm eligibility with your own school before starting. An organization's claim does not replace school approval.",
      example:
        "'Can your supervisor confirm dates and tasks for my school's review, and who should my school contact about the activity?'",
    },
    {
      topic: "Safety and boundaries",
      question: "What could you ask about reporting harassment or unsafe work?",
      approach:
        "Ask which official contacts and reporting channels are available, including when the immediate supervisor is involved. Avoid trying to resolve a legal question in the interview alone.",
      example:
        "'What is the reporting process if a student worker has a safety concern or experiences harassment?'",
    },
    {
      topic: "Ethics and privacy",
      question:
        "What could you ask about using personal devices or accounts for work?",
      approach:
        "Clarify approved tools, costs, privacy, and whether personal social media or phone numbers are expected. Do not hand over passwords or private-account access.",
      example:
        "'Would I use organization-provided accounts and equipment, and what is the policy on personal devices?'",
    },
    {
      topic: "Reliability and school",
      question:
        "What could you ask about a remote student program's time zone and meetings?",
      approach:
        "Confirm live meeting times, expected independent hours, supervision, and location eligibility before committing. A remote program may still have fixed attendance requirements.",
      example:
        "'Which time zone are meetings scheduled in, and what hours would a high-school participant need to attend live?'",
    },
    {
      topic: "Ethics and privacy",
      question: "What could you ask about fees in a student program?",
      approach:
        "Ask for the complete current cost, any required supplies or travel, refund terms, and aid process through official channels. Do not assume a course, certificate, or placement is free because applying is free.",
      example:
        "'Could you confirm all required fees and extra costs, and whether financial assistance is available?'",
    },
    {
      topic: "Learning and feedback",
      question:
        "What could you ask to distinguish a course from an accredited qualification?",
      approach:
        "Ask who issues the credential, what assessment is required, and how recognition can be checked. A completion badge does not automatically grant a regulated licence or job qualification.",
      example:
        "'What exactly is awarded on completion, and where can I verify what that credential is recognized for?'",
    },
    {
      topic: "Interview preparation",
      question:
        "How would you choose which questions to ask at the end of an interview?",
      approach:
        "Pick a few questions that matter to your decision and have not already been answered. Listen to the responses and avoid reading a long list without context.",
      example:
        "'You explained the duties clearly. My main remaining questions are how training works and how shifts are arranged around school.'",
    },
  ],
} satisfies Record<string, QuestionDraft[]>;

export type InterviewRole = keyof typeof questionLibrary;
export const interviewRoles = Object.keys(questionLibrary) as InterviewRole[];
const stableQuestionId = (role: string, question: string) =>
  `${role}-${question}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const interviewQuestions = Object.fromEntries(
  interviewRoles.map((role) => [
    role,
    questionLibrary[role].map((item) => ({
      ...item,
      role,
      id: stableQuestionId(role, item.question),
    })),
  ]),
) as Record<InterviewRole, InterviewQuestion[]>;
export const allInterviewQuestions = interviewRoles.flatMap(
  (role) => interviewQuestions[role],
);
export const interviewQuestionCount = allInterviewQuestions.length;

/** Search only static teaching content; drafts never enter search, storage, or a network request. */
export function filterInterviewQuestions({
  role = "All roles",
  topic = "All topics",
  search = "",
}: {
  role?: InterviewRole | "All roles";
  topic?: InterviewTopic | "All topics";
  search?: string;
} = {}): InterviewQuestion[] {
  const terms = search
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return allInterviewQuestions.filter((item) => {
    if (role !== "All roles" && item.role !== role) return false;
    if (topic !== "All topics" && item.topic !== topic) return false;
    const searchable =
      `${item.role} ${item.topic} ${item.question} ${item.approach}`
        .normalize("NFKC")
        .toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}
