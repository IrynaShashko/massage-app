// Sends a booking request from the site to Telegram.
//
// Secrets (Supabase Dashboard -> Edge Functions -> Secrets):
//   TELEGRAM_BOT_TOKEN  token from @BotFather
//   TELEGRAM_CHAT_IDS   comma-separated chat ids that receive bookings
//
// Deploy without JWT verification: the site calls it with the publishable
// key, which is not a JWT. Abuse is limited by the checks below instead.
//
// When the request carries a slotId, the slot is first held in the database
// (book_slot, migration 0007) with the service role key that Supabase gives
// every function. A taken slot answers 409 { error: "slot_unavailable" }.
// Its message gets "Confirm / Decline" buttons, handled by telegram-webhook,
// and the answer carries telegramLink: t.me/<bot>?start=<token>, which the
// site offers the client to get the confirmation in Telegram.
//
// Only signed-in clients with a confirmed email may book: the request must
// carry their session (supabase.functions.invoke adds it). Without one it
// answers 401 { error: "auth_required" }, with an unconfirmed email
// 403 { error: "email_not_verified" }. The booking is linked to the account
// so it shows in their profile, and uses the account's (verified) email
// rather than one typed in the request.

import { createClient } from "npm:@supabase/supabase-js@2";

const MAX = {
  name: 80,
  phone: 20,
  email: 120,
  service: 200,
  comment: 1000,
  time: 40,
  note: 1000,
};
const RATE_LIMIT = 5; // requests per IP
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes

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

// Best effort: an instance keeps this only while it is warm
const hits = new Map<string, number[]>();
const isRateLimited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const field = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type HeldSlot = {
  bookingId: string;
  telegramToken: string;
  date: string;
  time: string;
};

const serviceClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

type Caller = { id: string; email: string; verified: boolean };

/** The signed-in caller, or null for guests and invalid sessions */
const getCaller = async (req: Request): Promise<Caller | null> => {
  const jwt = (req.headers.get("authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  // the publishable key is not a JWT; skip the round trip for guests
  if (jwt.split(".").length !== 3) return null;
  try {
    const { data, error } = await serviceClient().auth.getUser(jwt);
    const user = data.user;
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email ?? "",
      verified: !!user.email_confirmed_at,
    };
  } catch (error) {
    console.warn("getUser failed", error);
    return null;
  }
};

/** Holds the slot; returns the booking and the slot's date and "HH:MM", or null when it is taken */
const bookSlot = async (
  slotId: string,
  booking: Record<string, string>,
  userId: string | null,
): Promise<HeldSlot | null> => {
  const { data, error } = await serviceClient()
    .rpc("book_slot", {
      p_slot_id: slotId,
      p_name: booking.name,
      p_phone: booking.phone,
      p_email: booking.email,
      p_service: booking.service,
      p_note: booking.note,
      p_lang: booking.lang,
      p_user_id: userId,
    })
    .single<{
      booking_id: string;
      telegram_token: string;
      day: string;
      time: string;
    }>();
  if (error) {
    if (error.message.includes("slot_unavailable")) return null;
    throw error;
  }
  return {
    bookingId: data.booking_id,
    telegramToken: data.telegram_token,
    date: data.day,
    time: data.time.slice(0, 5),
  };
};

/** The bot's @username, for t.me links; asked from Telegram once per instance */
let botUsername: string | null = null;
const getBotUsername = async (token: string) => {
  if (botUsername) return botUsername;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const body = await res.json();
    botUsername = body?.result?.username ?? null;
  } catch (error) {
    console.warn("getMe failed", error);
  }
  return botUsername;
};

/** "2026-11-30" -> "пн, 30.11.2026"; anything else is dropped */
const formatDate = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const [, y, m, d] = match;
  const weekday = new Intl.DateTimeFormat("uk-UA", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(+y, +m - 1, +d)));
  return `${weekday}, ${d}.${m}.${y}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatIds = (Deno.env.get("TELEGRAM_CHAT_IDS") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!token || chatIds.length === 0) {
    return json(500, { error: "Telegram is not configured" });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  // Honeypot: a hidden field people never fill in, bots usually do.
  // Answer "ok" so the bot does not learn it was caught.
  if (field(body.website, 200)) return json(200, { ok: true });

  const caller = await getCaller(req);
  if (!caller) return json(401, { error: "auth_required" });
  if (!caller.verified) return json(403, { error: "email_not_verified" });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) return json(429, { error: "Too many requests" });

  const name = field(body.name, MAX.name);
  const phone = field(body.phone, MAX.phone);
  const email = field(caller.email, MAX.email);
  const service = field(body.service, MAX.service);
  const comment = field(body.comment, MAX.comment);
  let date = formatDate(field(body.date, 10));
  let time = field(body.time, MAX.time);
  const note = field(body.note, MAX.note);
  const slotId = field(body.slotId, 36);
  const lang = body.lang === "en" ? "en" : "ua";
  // the site sends date/time/note separately; older pages only send comment
  const hasDetails = "date" in body || "time" in body || "note" in body;

  const digits = phone.replace(/\D/g, "");
  if (!name || digits.length < 10 || digits.length > 13) {
    return json(400, { error: "Name and a valid phone are required" });
  }

  if (slotId && !UUID.test(slotId)) {
    return json(400, { error: "Invalid slot" });
  }

  // With a slot, the date and time come from the database, not the request
  let bookingId = "";
  let telegramToken = "";
  if (slotId) {
    let slot: HeldSlot | null;
    try {
      slot = await bookSlot(
        slotId,
        { name, phone, email, service, note, lang },
        caller.id,
      );
    } catch (error) {
      console.error("book_slot failed", error);
      return json(500, { error: "Could not save the booking" });
    }
    if (!slot) return json(409, { error: "slot_unavailable" });
    date = formatDate(slot.date);
    time = slot.time;
    bookingId = slot.bookingId;
    telegramToken = slot.telegramToken;
  }

  // "" is a blank line between blocks; empty fields are simply not added
  const lines = [
    slotId ? "🗓 <b>Новий запис на час</b>" : "🗓 <b>Нова заявка з сайту</b>",
    `👤 <b>Ім'я:</b> ${escapeHtml(name)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(phone)}`,
  ];
  if (service) lines.push(`💆 <b>Послуга:</b> ${escapeHtml(service)}`);
  if (email) lines.push(`✉️ <b>Пошта:</b> ${escapeHtml(email)}`);

  if (slotId) {
    lines.push(
      "",
      `📅 <b>Дата:</b> ${escapeHtml(date)}`,
      `🕐 <b>Час:</b> ${escapeHtml(time)}`,
    );
    if (note) lines.push("", "💬 <b>Коментар:</b>", escapeHtml(note));
    // Keep this the last line, plain text: telegram-webhook swaps it for the
    // new status after a button press
    lines.push("", "⏳ Чекає підтвердження");
  } else if (hasDetails) {
    if (date || time) lines.push("");
    if (date) lines.push(`📅 <b>Бажана дата:</b> ${escapeHtml(date)}`);
    if (time) lines.push(`🕐 <b>Зручний час:</b> ${escapeHtml(time)}`);
    if (note) lines.push("", "💬 <b>Коментар:</b>", escapeHtml(note));
  } else if (comment) {
    lines.push("", `📝 ${escapeHtml(comment)}`);
  }

  const results = await Promise.all(
    chatIds.map((chatId) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          parse_mode: "HTML",
          ...(bookingId && {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Підтвердити", callback_data: `c:${bookingId}` },
                  { text: "❌ Відхилити", callback_data: `d:${bookingId}` },
                ],
              ],
            },
          }),
        }),
      }).then((res) => res.ok),
    ),
  );

  // A held slot is already saved and visible on the admin page, so it counts
  // as success even if no admin got the message
  if (slotId) {
    const username = await getBotUsername(token);
    return json(200, {
      ok: true,
      telegram: results.some(Boolean),
      telegramLink: username
        ? `https://t.me/${username}?start=${telegramToken}`
        : null,
    });
  }
  // Success if at least one recipient got it
  if (!results.some(Boolean)) {
    return json(502, { error: "Telegram did not accept the message" });
  }
  return json(200, { ok: true });
});
