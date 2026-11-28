import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import { MY_BOOKINGS_KEY } from "./useMyBookings";

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

/** Booking needs an account: the visitor is not signed in */
export class AuthRequiredError extends Error {
  constructor() {
    super("auth_required");
    this.name = "AuthRequiredError";
  }
}

/** Booking needs a confirmed email; this account has not confirmed it yet */
export class EmailNotVerifiedError extends Error {
  constructor() {
    super("email_not_verified");
    this.name = "EmailNotVerifiedError";
  }
}

const isAccessError = (error: unknown) =>
  error instanceof AuthRequiredError || error instanceof EmailNotVerifiedError;

/** Must match the hidden form in public/index.html that Netlify detects at deploy time */
export const NETLIFY_FORM_NAME = "booking";

/**
 * Sends the booking through Netlify Forms. Netlify emails every submission
 * to the site owner. It is only a backup channel, used after the function
 * has accepted the client (signed in, email confirmed).
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
  if (error instanceof FunctionsHttpError) {
    const status = error.context.status;
    if (status === 409) throw new SlotUnavailableError();
    if (status === 401) throw new AuthRequiredError();
    if (status === 403) throw new EmailNotVerifiedError();
  }
  if (error) throw error;
  return data ?? {};
};

/** Only signed-in clients with a confirmed email may book */
const ensureCanBook = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new AuthRequiredError();
  if (!session.user.email_confirmed_at) throw new EmailNotVerifiedError();
};

/**
 * Sends every booking to Telegram and, as a backup, to Netlify Forms
 * (email), so one channel being down never loses a request.
 *
 * The function goes first: it checks the client's account (signed in, email
 * confirmed), and with a slot it holds that slot. A refused account or a
 * taken slot stops the request; any other failure falls back to the email.
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<
    BookingResult,
    Error,
    CreateBookingInput & { details?: BookingDetails }
  >({
    mutationFn: async ({ details, ...booking }) => {
      await ensureCanBook();

      let result: BookingResult;
      try {
        result = await submitToTelegram({ ...booking, ...details });
      } catch (error) {
        if (error instanceof SlotUnavailableError || isAccessError(error)) {
          throw error;
        }
        // a slot is not held then, but the email still delivers the request
        console.warn("Booking via Telegram failed", error);
        await submitToNetlify(booking);
        return {};
      }
      submitToNetlify(booking).catch((error) =>
        console.warn("Booking via Netlify Forms failed", error),
      );
      return result;
    },
    onSettled: (_data, _error, variables) => {
      if (variables.details?.slotId) {
        queryClient.invalidateQueries({ queryKey: ["slots"] });
        queryClient.invalidateQueries({ queryKey: MY_BOOKINGS_KEY });
      }
    },
    onError: (error) => {
      console.error("Booking failed:", error.message);
      // the session changed since the form loaded: show the sign-in prompt
      if (isAccessError(error)) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });
};
