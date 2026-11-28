import { useQuery } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { BookingStatus } from "./useSlots";

/** A booking of the signed-in user; day/time are Kyiv wall-clock, as in useSlots */
export interface MyBooking {
  id: string;
  /** yyyy-mm-dd */
  day: string;
  /** HH:MM */
  time: string;
  service: string;
  note: string | null;
  status: BookingStatus;
  createdAt: string;
}

type Row = Omit<MyBooking, "createdAt"> & { created_at: string };

export const MY_BOOKINGS_KEY = ["my-bookings"];

/**
 * Bookings made while signed in (migration 0010). Guests' bookings and ones
 * made before that migration are not linked to an account.
 */
export const useMyBookings = (userId: string | undefined) =>
  useQuery<MyBooking[], Error>({
    queryKey: [...MY_BOOKINGS_KEY, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_bookings");
      if (error) throw error;
      return (data as Row[]).map(({ created_at, time, ...row }) => ({
        ...row,
        time: time.slice(0, 5),
        createdAt: created_at,
      }));
    },
  });
