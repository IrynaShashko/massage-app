// Booking status changes and the messages clients get about them.
// Used by telegram-webhook (admin presses a button in Telegram) and
// booking-status (admin changes the status on the site).

import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type Status = "pending" | "confirmed" | "declined";
export type Lang = "ua" | "en";

/**
 * confirm: pending -> confirmed
 * decline: pending -> declined (the client is told the time is not available)
 * cancel:  confirmed -> declined (the client is told the booking is cancelled)
 */
export type Action = "confirm" | "decline" | "cancel";

export const ACTIONS: Record<Action, { from: Status; to: Status }> = {
  confirm: { from: "pending", to: "confirmed" },
  decline: { from: "pending", to: "declined" },
  cancel: { from: "confirmed", to: "declined" },
};

export type BookingRow = {
  id: string;
  status: Status;
  phone: string;
  lang: Lang;
  client_chat_id: number | null;
  slot: { day: string; time: string } | null;
};

const BOOKING_COLUMNS =
  "id, status, phone, lang, client_chat_id, slot:slots(day, time)";

const PHONE_DISPLAY = "+38 093 619 36 16";
const ADDRESS: Record<Lang, string> = {
  ua: "Київ, Берестейський проспект, 121а",
  en: "Kyiv, Beresteiskyi Avenue, 121a",
};

/** "2026-12-07" -> "пн, 07.12.2026" / "Mon, 07.12.2026" */
export const formatDay = (iso: string, lang: Lang = "ua") => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, y, m, d] = match;
  const weekday = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "uk-UA", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(+y, +m - 1, +d)));
  return `${weekday}, ${d}.${m}.${y}`;
};

export type ClientMessage = "pending" | "confirmed" | "declined" | "cancelled";

/** Plain text (no HTML), so it also works as a WhatsApp draft */
export const clientText = (
  kind: ClientMessage,
  lang: Lang,
  day: string,
  time: string,
) => {
  const date = formatDay(day, lang);
  if (lang === "en") {
    switch (kind) {
      case "pending":
        return `Thank you! Your booking for ${date} at ${time} is awaiting confirmation. We'll message you here as soon as it's confirmed.`;
      case "confirmed":
        return `✅ Your booking is confirmed!\n\n📅 ${date}\n🕐 ${time}\n📍 ${ADDRESS.en}\n\nSee you soon! If your plans change, please let us know in advance: ${PHONE_DISPLAY}.`;
      case "declined":
        return `Unfortunately, ${date} at ${time} is no longer available. Please pick another time on the website or contact us: ${PHONE_DISPLAY}.`;
      case "cancelled":
        return `Your booking for ${date} at ${time} has been cancelled. To pick another time, please contact us: ${PHONE_DISPLAY}.`;
    }
  }
  switch (kind) {
    case "pending":
      return `Дякуємо! Ваш запис на ${date} о ${time} чекає підтвердження. Щойно його підтвердять, ми напишемо вам тут.`;
    case "confirmed":
      return `✅ Ваш запис підтверджено!\n\n📅 ${date}\n🕐 ${time}\n📍 ${ADDRESS.ua}\n\nЧекаємо на вас! Якщо плани зміняться, будь ласка, повідомте заздалегідь: ${PHONE_DISPLAY}.`;
    case "declined":
      return `На жаль, час ${date} о ${time} уже недоступний. Оберіть, будь ласка, інший час на сайті або зв'яжіться з нами: ${PHONE_DISPLAY}.`;
    case "cancelled":
      return `Ваш запис на ${date} о ${time} скасовано. Щоб обрати інший час, зв'яжіться з нами: ${PHONE_DISPLAY}.`;
  }
};

/** The message a client should get for a booking in this status */
export const messageFor = (status: Status, action?: Action): ClientMessage =>
  status === "confirmed"
    ? "confirmed"
    : status === "pending"
      ? "pending"
      : action === "cancel"
        ? "cancelled"
        : "declined";

/** wa.me link with the message ready to send; "0XX..." numbers get +38 */
export const whatsappUrl = (phone: string, text: string) => {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) digits = `38${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

export const telegramApi = (token: string, method: string, body: unknown) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const fetchBooking = async (
  supabase: SupabaseClient,
  bookingId: string,
): Promise<BookingRow | null> => {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw error;
  return data as BookingRow | null;
};

export type ChangeResult = {
  /** false when the booking was not in the expected status (stale button) */
  changed: boolean;
  /** null when the booking no longer exists (its slot was deleted) */
  booking: BookingRow | null;
  /** the client got the news in Telegram */
  notified: boolean;
  /** a WhatsApp draft for the admin when the client was not notified */
  whatsappUrl: string | null;
};

/**
 * Changes the status only from the expected one, so a stale button does
 * nothing, then tells the client in Telegram if they subscribed.
 */
export const changeStatus = async (
  supabase: SupabaseClient,
  botToken: string,
  bookingId: string,
  action: Action,
): Promise<ChangeResult> => {
  const { from, to } = ACTIONS[action];
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({ status: to })
    .eq("id", bookingId)
    .eq("status", from)
    .select("id");
  if (error) throw error;

  const changed = !!updated && updated.length > 0;
  const booking = await fetchBooking(supabase, bookingId);
  if (!booking?.slot || booking.status === "pending") {
    return { changed, booking, notified: false, whatsappUrl: null };
  }

  const text = clientText(
    messageFor(booking.status, changed ? action : undefined),
    booking.lang,
    booking.slot.day,
    booking.slot.time.slice(0, 5),
  );

  let notified = false;
  if (changed && booking.client_chat_id) {
    const res = await telegramApi(botToken, "sendMessage", {
      chat_id: booking.client_chat_id,
      text,
    });
    notified = res.ok;
    if (!res.ok) console.warn("client message failed", await res.text());
  }

  // A stale press for a subscribed client: they got the news back when the
  // status actually changed
  const toldBefore = !changed && !!booking.client_chat_id;
  return {
    changed,
    booking,
    notified,
    whatsappUrl:
      notified || toldBefore ? null : whatsappUrl(booking.phone, text),
  };
};
