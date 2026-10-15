import { strFromU8, unzipSync } from "fflate";

export async function readResumeFile(file: File): Promise<string> {
  if (!file.size || file.size > 4 * 1024 * 1024)
    throw new Error("Choose a non-empty PDF, DOCX, or TXT file up to 4 MB.");
  const extension = file.name.toLowerCase().split(".").pop();
  if (!["pdf", "docx", "txt"].includes(extension || ""))
    throw new Error(
      "Choose a PDF, DOCX, or TXT resume. Older .doc files are not supported.",
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text = "";
  if (extension === "txt") {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (text.includes("\0"))
      throw new Error("Export this document as UTF-8 text, PDF, or DOCX.");
  } else if (extension === "docx") {
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b)
      throw new Error(
        "This DOCX file could not be read. Export it again or paste your text.",
      );
    let total = 0;
    let entries = 0;
    const archive = unzipSync(bytes, {
      filter(entry) {
        entries++;
        total += entry.originalSize;
        if (
          entries > 300 ||
          total > 20 * 1024 * 1024 ||
          entry.originalSize > 2 * 1024 * 1024
        )
          throw new Error(
            "This document is too complex. Paste your resume text instead.",
          );
        return entry.name === "word/document.xml";
      },
    });
    const document = archive["word/document.xml"];
    if (!document)
      throw new Error(
        "Choose a valid DOCX document or paste your resume text.",
      );
    const xml = strFromU8(document);
    if (/<!DOCTYPE|<!ENTITY/i.test(xml))
      throw new Error(
        "This document format is not supported. Paste your resume text instead.",
      );
    const parsed = new DOMParser().parseFromString(xml, "application/xml");
    if (parsed.querySelector("parsererror"))
      throw new Error(
        "This DOCX document could not be read. Paste your resume text instead.",
      );
    const paragraphs = [...parsed.getElementsByTagNameNS("*", "p")];
    text = paragraphs
      .map((paragraph) =>
        [...paragraph.getElementsByTagNameNS("*", "t")]
          .map((run) => run.textContent || "")
          .join(""),
      )
      .join("\n");
  } else {
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-")
      throw new Error(
        "This PDF could not be read. Export it again or paste your text.",
      );
    const pdfjs = await import("pdfjs-dist");
    // This worker is bundled with the website. No document is sent to a CDN.
    if (!pdfjs.GlobalWorkerOptions.workerPort) {
      pdfjs.GlobalWorkerOptions.workerPort = new Worker(
        new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
        { type: "module" },
      );
    }
    const loading = pdfjs.getDocument({
      data: bytes,
      disableFontFace: true,
      useSystemFonts: true,
      useWorkerFetch: false,
      useWasm: false,
      enableXfa: false,
    });
    const timeout = setTimeout(() => void loading.destroy(), 20000);
    try {
      const pdf = await loading.promise;
      if (pdf.numPages > 10)
        throw new Error(
          "Choose a resume with 10 pages or fewer, or paste its relevant text.",
        );
      const pages: string[] = [];
      for (let number = 1; number <= pdf.numPages; number++) {
        const page = await pdf.getPage(number);
        const content = await page.getTextContent();
        let line = "";
        const lines: string[] = [];
        let previousY: number | undefined;
        for (const item of content.items) {
          if (!("str" in item)) continue;
          const y = item.transform[5];
          if (
            previousY !== undefined &&
            Math.abs(y - previousY) > 3 &&
            line.trim()
          ) {
            lines.push(line.trim());
            line = "";
          }
          line += `${item.str} `;
          previousY = y;
          if (item.hasEOL) {
            lines.push(line.trim());
            line = "";
            previousY = undefined;
          }
        }
        if (line.trim()) lines.push(line.trim());
        pages.push(lines.join("\n"));
        if (pages.join("\n").length > 50000)
          throw new Error("Use no more than 50,000 characters of resume text.");
        page.cleanup();
      }
      text = pages.join("\n\n");
    } catch (error) {
      if (error instanceof Error && error.name === "PasswordException")
        throw new Error(
          "This PDF is password protected. Remove the password or paste your resume text.",
        );
      throw new Error(
        error instanceof Error && /pages|characters/.test(error.message)
          ? error.message
          : "This PDF could not be read. It may be scanned, damaged, or too complex. Paste your resume text instead.",
      );
    } finally {
      clearTimeout(timeout);
      await loading.destroy();
    }
  }
  text = text.replace(/\r\n?/g, "\n").trim();
  if (!text || text.length < 40)
    throw new Error(
      "Not enough text was found. Scanned images need OCR, which this checker does not provide. Paste your resume text instead.",
    );
  if (text.length > 50000)
    throw new Error("Use no more than 50,000 characters of resume text.");
  return text;
}
