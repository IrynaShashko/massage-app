/**
 * Google sign-in goes through Supabase Auth: the client id and secret live in
 * Supabase Dashboard -> Authentication -> Providers -> Google, not in this app.
 * Set REACT_APP_GOOGLE_AUTH_ENABLED=true once the provider is switched on.
 */
export const isGoogleAuthEnabled =
  (process.env.REACT_APP_GOOGLE_AUTH_ENABLED ?? "").trim() === "true";
