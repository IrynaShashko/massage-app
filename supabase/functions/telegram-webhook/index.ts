// Telegram webhook for the booking bot. Handles two things:
//
// 1. Admin buttons under booking messages that booking-telegram sends for a
//    held slot: Confirm / Decline / Cancel. The client is then told in
//    Telegram if they subscribed; otherwise the admin gets a WhatsApp button
//    with the message ready to send.
// 2. Clients opening the bot from the site's link (/start <token>): their
//    chat is saved on the booking so later status changes reach them.
//
// Secrets (Supabase Dashboard -> Edge Functions -> Secrets):
//   TELEGRAM_BOT_TOKEN       same as for booking-telegram
//   TELEGRAM_CHAT_IDS        same as for booking-telegram; button presses
//                            from other chats are ignored
//   TELEGRAM_WEBHOOK_SECRET  any long random string (letters, digits, _ and -),
//                            also given to Telegram as secret_token below
//
// Point the bot at this function (again after adding "message" updates):
//   curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//     -d "url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook" \
//     -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
//     -d 'allowed_updates=["callback_query","message"]'
//
// Deploy without JWT verification: Telegram sends no Supabase JWT. Requests
// are checked against TELEGRAM_WEBHOOK_SECRET instead.

import { createClient } from "npm:@supabase/supabase-js@2";

import {
  Action,
  changeStatus,
  clientText,
  messageFor,
  Status,
  telegramApi,
} from "../_shared/booking.ts";

/** button code -> action and the status line it leaves in the admin message */
const BUTTONS: Record<string, { action: Action; line: string }> = {
  c: { action: "confirm", line: "✅ Підтверджено" },
  d: { action: "decline", line: "❌ Відхилено, час знову вільний" },
  x: { action: "cancel", line: "🚫 Запис скасовано, час знову вільний" },
};

/** How the last line reads when the status was changed elsewhere */
const CURRENT_LINE: Record<Status, string> = {
  pending: "⏳ Чекає підтвердження",
  confirmed: "✅ Підтверджено",
  declined: "❌ Відхилено або скасовано, час вільний",
};
const DELETED_LINE = "🗑 Цей час видалено з розкладу";
const STATUS_PREFIXES = ["⏳", "✅", "❌", "🚫", "🗑"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const START = /^\/start(?:\s+([0-9a-f]{32}))?\s*$/i;

const HELP_TEXT =
  "Цей бот надсилає підтвердження записів із сайту. Щоб зв'язатися з нами: +38 093 619 36 16.\n\n" +
  "This bot sends booking confirmations from the website. To contact us: +38 093 619 36 16.";
const LINK_EXPIRED_TEXT =
  "Не вдалося знайти запис за цим посиланням. Зв'яжіться, будь ласка, з нами: +38 093 619 36 16.\n\n" +
  "We couldn't find a booking for this link. Please contact us: +38 093 619 36 16.";

type Button = { text: string; callback_data?: string; url?: string };

const keyboardFor = (
  status: Status | null,
  bookingId: string,
  whatsappUrl: string | null,
) => {
  const rows: Button[][] = [];
  if (status === "pending") {
    rows.push([
      { text: "✅ Підтвердити", callback_data: `c:${bookingId}` },
      { text: "❌ Відхилити", callback_data: `d:${bookingId}` },
    ]);
  }
  if (whatsappUrl) {
    rows.push([{ text: "💬 Повідомити клієнта у WhatsApp", url: whatsappUrl }]);
  }
  if (status === "confirmed") {
    rows.push([
      { text: "🚫 Скасувати запис", callback_data: `x:${bookingId}` },
    ]);
  }
  return { inline_keyboard: rows };
};

/** Replaces the status line at the end of the message, or adds one */
const withStatusLine = (text: string, line: string) => {
  const cut = text.lastIndexOf("\n");
  const last = text.slice(cut + 1);
  const hasStatus = STATUS_PREFIXES.some((prefix) => last.startsWith(prefix));
  return hasStatus ? `${text.slice(0, cut + 1)}${line}` : `${text}\n\n${line}`;
};

const ok = () => new Response("ok");

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const secret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  const chatIds = (Deno.env.get("TELEGRAM_CHAT_IDS") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!token || !secret) {
    return new Response("Not configured", { status: 500 });
  }
  if (req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("Forbidden", { status: 403 });
  }

  const telegram = (method: string, body: unknown) =>
    telegramApi(token, method, body);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // deno-lint-ignore no-explicit-any
  type Json = Record<string, any>;

  /* ---------- a client opens the bot ---------- */

  const handleMessage = async (message: Json) => {
    // only private chats with clients; the admin group stays quiet
    if (message.chat?.type !== "private") return;
    const reply = (text: string) =>
      telegram("sendMessage", { chat_id: message.chat.id, text });

    const match = START.exec(String(message.text ?? ""));
    if (!match?.[1]) {
      await reply(HELP_TEXT);
      return;
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ client_chat_id: message.chat.id })
      .eq("telegram_token", match[1].toLowerCase())
      .select("status, lang, slot:slots(day, time)")
      .maybeSingle();
    if (error) throw error;
    const slot = (booking?.slot ?? null) as {
      day: string;
      time: string;
    } | null;
    if (!booking || !slot) {
      await reply(LINK_EXPIRED_TEXT);
      return;
    }

    await reply(
      clientText(
        messageFor(booking.status as Status),
        booking.lang === "en" ? "en" : "ua",
        slot.day,
        slot.time.slice(0, 5),
      ),
    );
  };

  /* ---------- the admin presses a button ---------- */

  const handleButton = async (query: Json) => {
    const answer = (text: string) =>
      telegram("answerCallbackQuery", { callback_query_id: query.id, text });

    const message = query.message;
    if (!message || !chatIds.includes(String(message.chat?.id))) {
      await answer("Немає доступу");
      return;
    }

    const [code, bookingId] = String(query.data ?? "").split(":");
    const button = BUTTONS[code];
    if (!button || !UUID.test(bookingId ?? "")) {
      await answer("Невідома дія");
      return;
    }

    let result;
    try {
      result = await changeStatus(supabase, token, bookingId, button.action);
    } catch (error) {
      console.error("status update failed", error);
      await answer("Не вдалося зберегти, спробуйте ще раз");
      return;
    }

    const { changed, booking, notified, whatsappUrl } = result;
    const status = booking?.status ?? null;
    let line: string;
    if (changed) {
      const who = query.from?.first_name;
      line =
        button.action === "confirm" && who
          ? `${button.line} (${who})`
          : button.line;
      if (notified) line += " · клієнту надіслано в Telegram";
      else if (whatsappUrl) line += " · клієнт не підписаний на бота";
      await answer(button.line);
    } else {
      line = status ? CURRENT_LINE[status] : DELETED_LINE;
      await answer("Статус уже змінено");
    }

    // The status line is plain text at the very end, so the formatting
    // (entities) of everything above it stays valid
    const res = await telegram("editMessageText", {
      chat_id: message.chat.id,
      message_id: message.message_id,
      text: withStatusLine(message.text ?? "", line),
      entities: message.entities,
      reply_markup: keyboardFor(status, bookingId, whatsappUrl),
    });
    if (!res.ok) {
      // "message is not modified" when nothing changed; nothing to do then
      console.warn("editMessageText failed", await res.text());
    }
  };

  let update: Json;
  try {
    update = await req.json();
  } catch {
    return ok();
  }

  // Telegram retries on errors, so everything answers 200
  try {
    if (update.message) await handleMessage(update.message);
    else if (update.callback_query) await handleButton(update.callback_query);
  } catch (error) {
    console.error("update failed", error);
  }
  return ok();
});
