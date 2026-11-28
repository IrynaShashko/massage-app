import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

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

/**
 * The backend only accepts bookings from signed-in users, so guests go
 * through Netlify Forms. A signed-in booking that the backend rejects
 * (e.g. an expired session) falls back to Netlify too, so no request is lost.
 */
export const useCreateBooking = ({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: CreateBookingInput) => {
      if (isAuthenticated) {
        try {
          const response = await api.post("/api/book-service", booking);
          return response.data;
        } catch (error) {
          console.warn("Backend booking failed, using Netlify Forms", error);
        }
      }
      await submitToNetlify(booking);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      console.error("Booking failed:", error.response?.data || error.message);
    },
  });
};
