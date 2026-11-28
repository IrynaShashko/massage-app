import { createClient } from "@supabase/supabase-js";

const url = (process.env.REACT_APP_SUPABASE_URL ?? "").trim();
const anonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY ?? "").trim();

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY are not set: " +
      "sign-in, reviews and articles will not load. Add them to .env and " +
      "restart the dev server.",
  );
}

/**
 * The anon key is public by design: every table is protected by Row Level
 * Security (see supabase/migrations), not by hiding the key.
 * createClient throws on an empty url, so a placeholder keeps the site up.
 */
export const supabase = createClient(
  url || "http://localhost:54321",
  anonKey || "missing-anon-key",
);
