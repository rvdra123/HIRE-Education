import { zipSync, strToU8 } from "fflate";
export const studentResume = `TEST FIXTURE ONLY: Avery Example
Brampton, Ontario
Education
Example Secondary School, Ontario Secondary School Diploma expected June 2028
Relevant courses: business, English, computer studies
Projects and Volunteering
School fundraiser helper, September 2026
• Responsible for organizing materials for a school fundraising event with classmates.
• Prepared registration lists using Google Sheets for the school event team.
• Helped customers find books during a community book sale with volunteers.
• Created posters using Canva to explain the event schedule to visitors.
Skills
Communication, teamwork, organization, customer service, Google Sheets, Canva
Activities
School art club and student volunteer group`;
export const studentPosting = `TEST FIXTURE ONLY: Retail assistant. Help customers with questions, work as part of a team, and use communication and organization skills. Duties include cash handling, stocking, and cleaning. Check the actual employer’s instructions and required availability before applying.`;

export function docxResumeBytes(text = studentResume) {
  const escape = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  return zipSync({
    "word/document.xml": strToU8(
      `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${text
        .split("\n")
        .map((line) => `<w:p><w:r><w:t>${escape(line)}</w:t></w:r></w:p>`)
        .join("")}</w:body></w:document>`,
    ),
    "[Content_Types].xml": strToU8("<Types/>"),
  });
}
export function pdfResumeBytes(text = studentResume) {
  const escape = (value) =>
    value
      .replaceAll("\\", "\\\\")
      .replaceAll("(", "\\(")
      .replaceAll(")", "\\)")
      .replace(/[^\x20-\x7e]/g, "-");
  const content = `BT /F1 9 Tf 40 790 Td 13 TL ${text
    .split("\n")
    .map((line, index) => `${index ? "T* " : ""}(${escape(line)}) Tj`)
    .join("\n")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
