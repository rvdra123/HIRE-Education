"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import {
  privacyChoice,
  savePrivacyChoice,
  PRIVACY_EVENT,
  type PrivacyChoice,
} from "@/lib/privacy/storage";
export default function PrivacyControls() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<PrivacyChoice | null>(null);
  useEffect(() => {
    const saved = privacyChoice();
    setChoice(saved);
    setOpen(!saved);
    const update = (event: Event) =>
      setChoice((event as CustomEvent<PrivacyChoice>).detail);
    window.addEventListener(PRIVACY_EVENT, update);
    return () => window.removeEventListener(PRIVACY_EVENT, update);
  }, []);
  const choose = (value: PrivacyChoice) => {
    savePrivacyChoice(value);
    setChoice(value);
    setOpen(false);
  };
  return (
    <>
      {!open && (
        <button
          type="button"
          className="privacy-settings"
          onClick={() => setOpen(true)}
        >
          Privacy settings
        </button>
      )}
      {open && (
        <aside
          className="privacy-banner"
          aria-labelledby="privacy-choice-title"
        >
          <div className="privacy-summary">
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <h2 id="privacy-choice-title">
                Choose what this browser remembers
              </h2>
              <p>
                We don’t use advertising or analytics trackers. Allow optional
                storage to keep bookmarks and checklist progress on this device.
                Declining won’t limit access.{" "}
                <Link href="/privacy" prefetch={false}>
                  Read our privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="privacy-actions">
            <button
              className="btn btn-outline"
              onClick={() => choose("denied")}
            >
              Decline optional storage
            </button>
            <button
              className="btn btn-outline"
              onClick={() => choose("accepted")}
            >
              Accept optional storage
            </button>
            {choice && (
              <button
                className="icon-button"
                aria-label="Close privacy preferences"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
