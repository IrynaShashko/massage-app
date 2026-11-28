// Changes a booking's status from the site's admin page and tells the client
// in Telegram, like the buttons in the admin's Telegram chat do.
//
// POST { id: <booking uuid>, action: "confirm" | "decline" | "cancel" }
// -> { ok, notified, whatsappUrl }   or 409 { error: "stale", status }
//
// The caller must be signed in as an admin: the request carries the user's
// session (supabase.functions.invoke adds it), checked with is_admin().
// Deployed without the gateway's JWT check, which does not accept every key
// format; the check below is the one that matters.

import { createClient } from "npm:@supabase/supabase-js@2";

import { Action, ACTIONS, changeStatus } from "../_shared/booking.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
  const authorization = req.headers.get("authorization") ?? "";
  const apikey = req.headers.get("apikey") ?? "";
  if (!authorization || !apikey) return json(401, { error: "Sign in first" });

  // is_admin() reads auth.uid() from the caller's own session
  const asCaller = createClient(url, apikey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: isAdmin, error: adminError } = await asCaller.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    return json(403, { error: "Admins only" });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const action = body.action as Action;
  if (!UUID.test(id) || !(action in ACTIONS)) {
    return json(400, { error: "Invalid booking or action" });
  }

  const supabase = createClient(
    url,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    const result = await changeStatus(supabase, botToken, id, action);
    if (!result.changed) {
      return json(409, {
        error: "stale",
        status: result.booking?.status ?? null,
      });
    }
    return json(200, {
      ok: true,
      notified: result.notified,
      whatsappUrl: result.whatsappUrl,
    });
  } catch (error) {
    console.error("status change failed", error);
    return json(500, { error: "Could not save the change" });
  }
});
