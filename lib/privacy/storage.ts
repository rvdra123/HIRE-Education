export const PRIVACY_KEY = "hire-privacy-choice-v1";
export const PRIVACY_EVENT = "hire-privacy-change";
export type PrivacyChoice = "accepted" | "denied";
let visitChoice: PrivacyChoice | null = null;
export function privacyChoice(): PrivacyChoice | null {
  if (visitChoice) return visitChoice;
  try {
    const value = localStorage.getItem(PRIVACY_KEY);
    return value === "accepted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}
export function readOptional(key: string) {
  try {
    return privacyChoice() === "accepted" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}
export function writeOptional(key: string, value: string) {
  try {
    if (privacyChoice() !== "accepted") return false;
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function savePrivacyChoice(choice: PrivacyChoice) {
  visitChoice = choice;
  try {
    localStorage.setItem(PRIVACY_KEY, choice);
    if (choice === "denied") {
      for (const key of Object.keys(localStorage))
        if (key.startsWith("hire-") && key !== PRIVACY_KEY)
          localStorage.removeItem(key);
    }
  } catch {
    /* Privacy choices still apply to this visit. */
  }
  window.dispatchEvent(new CustomEvent(PRIVACY_EVENT, { detail: choice }));
}

if (typeof window !== "undefined")
  window.addEventListener("storage", (event) => {
    if (event.key === PRIVACY_KEY || event.key === null) {
      visitChoice = null;
      window.dispatchEvent(
        new CustomEvent(PRIVACY_EVENT, { detail: privacyChoice() }),
      );
    }
  });
