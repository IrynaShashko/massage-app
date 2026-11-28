import { useMutation } from "@tanstack/react-query";

export interface CreateBookingInput {
  name: string;
  phone: string;
  email: string;
  service: string;
  comment: string;
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

/** Bookings go to Netlify Forms, which emails each one to the site owner */
export const useCreateBooking = () =>
  useMutation({
    mutationFn: submitToNetlify,
    onError: (error: Error) => {
      console.error("Booking failed:", error.message);
    },
  });
