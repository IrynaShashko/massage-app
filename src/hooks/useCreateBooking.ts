import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";

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
  /** a free slot from free_slots(); the function holds it for this client */
  slotId?: string;
  /** site language, for the messages the bot later sends the client */
  lang?: "ua" | "en";
}

export interface BookingResult {
  /**
   * t.me link to the bot for a held slot: the client opens it to get the
   * confirmation in Telegram
   */
  telegramLink?: string | null;
}

/** Someone else booked the slot first, or the admin removed it */
export class SlotUnavailableError extends Error {
  constructor() {
    super("slot_unavailable");
    this.name = "SlotUnavailableError";
  }
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
): Promise<BookingResult> => {
  const { data, error } = await supabase.functions.invoke<BookingResult>(
    "booking-telegram",
    { body: booking },
  );
  if (error instanceof FunctionsHttpError && error.context.status === 409) {
    throw new SlotUnavailableError();
  }
  if (error) throw error;
  return data ?? {};
};

/**
 * Sends every booking both to Telegram and to Netlify Forms (email), so one
 * channel being down never loses a request. Fails only if both fail.
 *
 * With a slot, the function goes first: it holds the slot, and a taken slot
 * must stop the request instead of emailing a time that is no longer free.
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<
    BookingResult,
    Error,
    CreateBookingInput & { details?: BookingDetails }
  >({
    mutationFn: async ({ details, ...booking }) => {
      if (details?.slotId) {
        let result: BookingResult;
        try {
          result = await submitToTelegram({ ...booking, ...details });
        } catch (error) {
          if (error instanceof SlotUnavailableError) throw error;
          // the slot is not held, but the email still delivers the request
          console.warn("Booking via Telegram failed", error);
          await submitToNetlify(booking);
          return {};
        }
        submitToNetlify(booking).catch((error) =>
          console.warn("Booking via Netlify Forms failed", error),
        );
        return result;
      }

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
      return {};
    },
    onSettled: (_data, _error, variables) => {
      if (variables.details?.slotId) {
        queryClient.invalidateQueries({ queryKey: ["slots"] });
      }
    },
    onError: (error) => {
      console.error("Booking failed:", error.message);
    },
  });
};
