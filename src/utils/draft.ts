/**
 * Unsent form drafts, so a form survives a trip to sign in: the same tab,
 * the confirmation link's new tab, or the Google redirect. localStorage
 * access can throw (private mode, blocked storage); then nothing is kept.
 */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const BOOKING_DRAFT_KEY = "booking_draft";
export const REVIEW_DRAFT_KEY = "review_draft";

/**
 * Removes every form draft. Called on logout, so the next person on a shared
 * computer does not see someone else's name, phone or review.
 */
export const clearDrafts = () => {
  [BOOKING_DRAFT_KEY, REVIEW_DRAFT_KEY].forEach((key) => saveDraft(key, null));
};

/** The saved draft, or null when there is none or it is older than a day */
export const loadDraft = (key: string): Record<string, unknown> | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { values, savedAt } = JSON.parse(raw);
    if (
      typeof savedAt !== "number" ||
      Date.now() - savedAt > MAX_AGE_MS ||
      typeof values !== "object" ||
      values === null
    ) {
      localStorage.removeItem(key);
      return null;
    }
    return values;
  } catch {
    return null;
  }
};

/** Saves the draft; null removes it (an empty or sent form) */
export const saveDraft = (key: string, values: object | null) => {
  try {
    if (values === null) localStorage.removeItem(key);
    else
      localStorage.setItem(
        key,
        JSON.stringify({ values, savedAt: Date.now() }),
      );
  } catch {
    // storage blocked: the form just is not restored
  }
};
