import { useMutation } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";

export interface CreateBookingInput {
  name: string;
  phone: string;
  email: string;
  service: string;
  /** date, time and note in one text, for the Netlify email */
  comment: string;
}

/** The same details as separate fields, so Telegram can label each one */
export interface BookingDetails {
  /** yyyy-mm-dd */
  date?: string;
  /** "Morning" / "Ранок", already translated */
  time?: string;
  note?: string;
}

/** Must match the hidden form in public/index.html that Netlify detects at deploy time */
export const NETLIFY_FORM_NAME = "booking";

/**
 * Sends the booking through Netlify Forms (no backend, no login needed).
 * Netlify emails every submission to the site owner.
 */
const submitToNetlify = async (booking: CreateBookingInput) => {
  const body = new URLSearchParams({
    "form-name": NETLIFY_FORM_NAME,
    ...booking,
  }).toString();

  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Netlify form submission failed: ${response.status}`);
  }
};

/** Telegram message to Maria via the booking-telegram Supabase function */
const submitToTelegram = async (
  booking: CreateBookingInput & BookingDetails,
) => {
  const { error } = await supabase.functions.invoke("booking-telegram", {
    body: booking,
  });
  if (error) throw error;
};

/**
 * Sends every booking both to Telegram and to Netlify Forms (email), so one
 * channel being down never loses a request. Fails only if both fail.
 */
export const useCreateBooking = () =>
  useMutation({
    mutationFn: async ({
      details,
      ...booking
    }: CreateBookingInput & { details?: BookingDetails }) => {
      const results = await Promise.allSettled([
        submitToTelegram({ ...booking, ...details }),
        submitToNetlify(booking),
      ]);
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          const channel = i === 0 ? "Telegram" : "Netlify Forms";
          console.warn(`Booking via ${channel} failed`, result.reason);
        }
      });
      if (results.every((result) => result.status === "rejected")) {
        throw new Error("Booking could not be sent");
      }
    },
    onError: (error: Error) => {
      console.error("Booking failed:", error.message);
    },
  });
