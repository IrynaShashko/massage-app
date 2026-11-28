// Sends a booking request from the site to Telegram.
//
// Secrets (Supabase Dashboard -> Edge Functions -> Secrets):
//   TELEGRAM_BOT_TOKEN  token from @BotFather
//   TELEGRAM_CHAT_IDS   comma-separated chat ids that receive bookings
//
// Deploy without JWT verification: the site calls it with the publishable
// key, which is not a JWT. Abuse is limited by the checks below instead.

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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) return json(429, { error: "Too many requests" });

  const name = field(body.name, MAX.name);
  const phone = field(body.phone, MAX.phone);
  const email = field(body.email, MAX.email);
  const service = field(body.service, MAX.service);
  const comment = field(body.comment, MAX.comment);
  const date = formatDate(field(body.date, 10));
  const time = field(body.time, MAX.time);
  const note = field(body.note, MAX.note);
  // the site sends date/time/note separately; older pages only send comment
  const hasDetails = "date" in body || "time" in body || "note" in body;

  const digits = phone.replace(/\D/g, "");
  if (!name || digits.length < 10 || digits.length > 13) {
    return json(400, { error: "Name and a valid phone are required" });
  }

  // "" is a blank line between blocks; empty fields are simply not added
  const lines = [
    "🗓 <b>Нова заявка з сайту</b>",
    `👤 <b>Ім'я:</b> ${escapeHtml(name)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(phone)}`,
  ];
  if (service) lines.push(`💆 <b>Послуга:</b> ${escapeHtml(service)}`);
  if (email) lines.push(`✉️ <b>Пошта:</b> ${escapeHtml(email)}`);

  if (hasDetails) {
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
        }),
      }).then((res) => res.ok),
    ),
  );

  // Success if at least one recipient got it
  if (!results.some(Boolean)) {
    return json(502, { error: "Telegram did not accept the message" });
  }
  return json(200, { ok: true });
});
