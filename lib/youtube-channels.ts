import { educationalChannels } from "./career-resources-data";

const featuredChannels = [
  {
    name: "Vinh Giang",
    id: "youtube-vinhgiang",
    topic: "Communication",
    description:
      "Practise speaking clearly, using your voice, and feeling more comfortable in a conversation.",
    initials: "VG",
    color: "amber",
  },
  {
    name: "CareerVidz",
    id: "youtube-careervidz",
    topic: "Interviews",
    description:
      "Work through common interview questions and use the examples to plan your own answers.",
    initials: "CV",
    color: "blue",
  },
  {
    name: "Self Made Millennial",
    id: "youtube-selfmade",
    topic: "Job applications",
    description:
      "Get tips on preparing for interviews, looking for work, and talking about your experience.",
    initials: "SM",
    color: "rose",
  },
  {
    name: "Jeff Su",
    id: "youtube-jeffsu",
    topic: "Work & digital skills",
    description:
      "Learn practical ways to write a resume, send a clear email, and use everyday digital tools.",
    initials: "JS",
    color: "mint",
  },
] as const;

export const youtubeChannels = featuredChannels.flatMap((channel) => {
  const resource = educationalChannels.find((entry) => entry.id === channel.id);
  return resource ? [{ ...channel, url: resource.url }] : [];
});
