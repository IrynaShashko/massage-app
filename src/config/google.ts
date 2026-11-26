/**
 * Google sign-in is optional: without a client id the Google SDK throws
 * "Missing required parameter client_id" and breaks the page, so the
 * provider and the button are only rendered when the id is configured.
 */
export const GOOGLE_CLIENT_ID = (
  process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ""
).trim();

export const isGoogleAuthEnabled = GOOGLE_CLIENT_ID.length > 0;

if (!isGoogleAuthEnabled && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "REACT_APP_GOOGLE_CLIENT_ID is not set: Google sign-in is hidden. " +
      "Add it to .env and restart the dev server.",
  );
}
