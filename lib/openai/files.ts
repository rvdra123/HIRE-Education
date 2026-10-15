import { unzipSync, strFromU8 } from "fflate";
import { XMLParser } from "fast-xml-parser";
// Stay below Vercel's 4.5 MB request limit, including the form fields.
export const MAX_RESUME_BYTES = 4 * 1024 * 1024;
export class UploadError extends Error {}
export async function validateResume(file: File) {
  if (file.size === 0 || file.size > MAX_RESUME_BYTES)
    throw new UploadError("Choose a PDF or DOCX file smaller than 4 MB.");
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension !== "pdf" && extension !== "docx")
    throw new UploadError("Only PDF and DOCX resumes are supported.");
  const mime =
    extension === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (file.type !== mime)
    throw new UploadError(
      "The file type does not match its extension. Export a new PDF or DOCX file.",
    );
  const buffer = Buffer.from(await file.arrayBuffer());
  if (extension === "pdf") {
    if (
      buffer.subarray(0, 5).toString() !== "%PDF-" ||
      !buffer.subarray(-2048).toString().includes("%%EOF")
    )
      throw new UploadError(
        "This PDF could not be read. Please export it again.",
      );
    if (/\/Encrypt\b/.test(buffer.toString("latin1")))
      throw new UploadError("Remove the PDF password before uploading.");
    return { buffer, name: "student-resume.pdf", mime, format: "pdf" as const };
  }
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b)
    throw new UploadError("This DOCX file could not be read.");
  let expanded = 0;
  let entries = 0;
  let archive: ReturnType<typeof unzipSync>;
  try {
    archive = unzipSync(buffer, {
      filter: (entry) => {
        entries++;
        expanded += entry.originalSize;
        if (
          entries > 300 ||
          expanded > 20 * 1024 * 1024 ||
          entry.originalSize > 8 * 1024 * 1024
        )
          throw new UploadError(
            "This document is too complex. Export a short PDF instead.",
          );
        return (
          entry.name === "word/document.xml" ||
          entry.name === "[Content_Types].xml"
        );
      },
    });
  } catch (e) {
    if (e instanceof UploadError) throw e;
    throw new UploadError(
      "This DOCX file could not be read. Please export it again.",
    );
  }
  if (!archive["word/document.xml"] || !archive["[Content_Types].xml"])
    throw new UploadError("Choose a valid DOCX document.");
  const xml = strFromU8(archive["word/document.xml"]);
  if (/<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new UploadError("This document format is not supported.");
  const parser = new XMLParser({
    ignoreAttributes: true,
    processEntities: false,
    removeNSPrefix: true,
  });
  let parsed: unknown;
  try {
    parsed = parser.parse(xml);
  } catch {
    throw new UploadError("This document could not be read.");
  }
  const collect = (v: unknown): string => {
    if (Array.isArray(v)) return v.map(collect).join("\n");
    if (v && typeof v === "object")
      return Object.entries(v)
        .map(([k, x]) => (k === "t" ? String(x) : collect(x)))
        .filter(Boolean)
        .join("\n");
    return "";
  };
  const plain = collect(parsed).trim();
  if (plain.length < 80 || plain.length > 50000)
    throw new UploadError(
      "Use a readable student resume of up to about three pages.",
    );
  return {
    buffer: Buffer.from(plain),
    name: "student-resume.txt",
    mime: "text/plain",
    format: "docx" as const,
  };
}
export async function boundedForm(request: Request) {
  if (
    !/^multipart\/form-data;.*boundary=/i.test(
      request.headers.get("content-type") || "",
    )
  )
    throw new UploadError("Send the resume using the upload form.");
  const max = MAX_RESUME_BYTES + 100000;
  if (Number(request.headers.get("content-length") || 0) > max)
    throw new UploadError(
      "The upload is too large. Maximum resume size is 4 MB.",
    );
  if (!request.body) throw new UploadError("Choose a resume to upload.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max)
        throw new UploadError(
          "The upload is too large. Maximum resume size is 4 MB.",
        );
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return new Response(Buffer.concat(chunks), {
    headers: { "content-type": request.headers.get("content-type") || "" },
  }).formData();
}
