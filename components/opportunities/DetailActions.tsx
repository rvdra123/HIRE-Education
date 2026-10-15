"use client";
import { useEffect, useState } from "react";
import { Bookmark, Copy } from "lucide-react";
import { readOptional, writeOptional } from "@/lib/privacy/storage";
export default function DetailActions({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      setSaved(
        JSON.parse(readOptional("hire-catalogue-saved") || "[]").includes(id),
      );
    } catch {}
  }, [id]);
  function toggle() {
    let current: string[] = [];
    try {
      current = JSON.parse(readOptional("hire-catalogue-saved") || "[]");
    } catch {}
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    const persisted = writeOptional(
      "hire-catalogue-saved",
      JSON.stringify(next),
    );
    setSaved(next.includes(id));
    setNotice(
      persisted
        ? "Bookmarks updated."
        : "Saved for this page visit. Allow optional storage to keep bookmarks.",
    );
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Opportunity link copied.");
    } catch {
      setNotice("Copy this page’s address from your browser to share it.");
    }
  }
  return (
    <>
      <div className="detail-actions">
        <button className="btn btn-outline" onClick={toggle}>
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          {saved ? "Remove bookmark" : "Save opportunity"}
        </button>
        <button className="btn btn-outline" onClick={share}>
          <Copy size={17} />
          Copy link
        </button>
      </div>
      <p role="status" className="small-note">
        {notice}
      </p>
    </>
  );
}
