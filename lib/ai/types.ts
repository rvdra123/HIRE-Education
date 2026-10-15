export type ResumeInput = {
  buffer: Buffer;
  name: string;
  mime: string;
  format: "pdf" | "docx" | "text";
};
export type ReviewContext = {
  grade: string;
  kind: string;
  title: string;
  description: string;
};
