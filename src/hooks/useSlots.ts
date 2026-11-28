import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

/**
 * Times are the studio's wall-clock time (Europe/Kyiv): `day` is yyyy-mm-dd,
 * `time` is HH:MM. They are shown as they are, never converted.
 */
export interface FreeSlot {
  id: string;
  day: string;
  time: string;
}

export type BookingStatus = "pending" | "confirmed" | "declined";

export interface SlotBooking {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  note: string | null;
  status: BookingStatus;
  createdAt: string;
  /** the client opened the bot from the site and gets updates in Telegram */
  telegram: boolean;
}

export interface AdminSlot extends FreeSlot {
  /** the pending or confirmed booking holding this slot, if any */
  booking: SlotBooking | null;
}

const SLOTS_KEY = ["slots"];
const FREE_KEY = [...SLOTS_KEY, "free"];
const ADMIN_KEY = [...SLOTS_KEY, "admin"];

/** "10:00:00" -> "10:00" */
const hhmm = (time: string) => time.slice(0, 5);

/** Today in Kyiv as yyyy-mm-dd (en-CA formats dates that way) */
export const kyivToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Kiev" }).format(
    new Date(),
  );

/** Free future times for the booking form */
export const useFreeSlots = () =>
  useQuery<FreeSlot[], Error>({
    queryKey: FREE_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("free_slots");
      if (error) throw error;
      return (data as FreeSlot[]).map((slot) => ({
        ...slot,
        time: hhmm(slot.time),
      }));
    },
    staleTime: 60 * 1000,
  });

type SlotRow = {
  id: string;
  day: string;
  time: string;
  bookings: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    service: string;
    note: string | null;
    status: BookingStatus;
    created_at: string;
    client_chat_id: number | null;
  }[];
};

/** Admin only (RLS): slots from today on, with the booking holding each one */
export const useAdminSlots = () =>
  useQuery<AdminSlot[], Error>({
    queryKey: ADMIN_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slots")
        .select(
          "id, day, time, bookings(id, name, phone, email, service, note, status, created_at, client_chat_id)",
        )
        .gte("day", kyivToday())
        .order("day")
        .order("time");
      if (error) throw error;
      return (data as SlotRow[]).map((row) => {
        const active = row.bookings.find((b) => b.status !== "declined");
        return {
          id: row.id,
          day: row.day,
          time: hhmm(row.time),
          booking: active
            ? {
                id: active.id,
                name: active.name,
                phone: active.phone,
                email: active.email,
                service: active.service,
                note: active.note,
                status: active.status,
                createdAt: active.created_at,
                telegram: active.client_chat_id !== null,
              }
            : null,
        };
      });
    },
  });

const useInvalidateSlots = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
};

/** Adds times to one day; times that already exist are skipped */
export const useAddSlots = () => {
  const invalidate = useInvalidateSlots();
  return useMutation<void, Error, { day: string; times: string[] }>({
    mutationFn: async ({ day, times }) => {
      const { error } = await supabase.from("slots").upsert(
        times.map((time) => ({ day, time })),
        { onConflict: "day,time", ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
};

/** Deleting a slot also deletes its bookings */
export const useDeleteSlot = () => {
  const invalidate = useInvalidateSlots();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
};

/**
 * confirm: pending -> confirmed; decline: pending -> declined;
 * cancel: confirmed -> declined. Declining or cancelling frees the slot.
 */
export type BookingAction = "confirm" | "decline" | "cancel";

export interface StatusChangeResult {
  /** the client got the news from the Telegram bot */
  notified: boolean;
  /** WhatsApp draft for the client when they could not be told in Telegram */
  whatsappUrl: string | null;
}

/** The booking was already changed elsewhere (e.g. from Telegram) */
export class StaleBookingError extends Error {
  constructor() {
    super("stale");
    this.name = "StaleBookingError";
  }
}

/** Goes through the booking-status function, which also tells the client */
export const useSetBookingStatus = () => {
  const invalidate = useInvalidateSlots();
  return useMutation<
    StatusChangeResult,
    Error,
    { id: string; action: BookingAction }
  >({
    mutationFn: async ({ id, action }) => {
      const { data, error } =
        await supabase.functions.invoke<StatusChangeResult>("booking-status", {
          body: { id, action },
        });
      if (error instanceof FunctionsHttpError && error.context.status === 409) {
        throw new StaleBookingError();
      }
      if (error) throw error;
      return data ?? { notified: false, whatsappUrl: null };
    },
    onSettled: invalidate,
  });
};

/**
 * Times from `from` to `to` (inclusive) every `stepMinutes`; just `from`
 * when `to` is empty. All values are HH:MM.
 */
export const timeRange = (from: string, to: string, stepMinutes: number) => {
  const toMinutes = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  const start = toMinutes(from);
  const end = to ? toMinutes(to) : start;
  if (!(stepMinutes > 0) || end < start) return [from];
  const times: string[] = [];
  for (let t = start; t <= end; t += stepMinutes) {
    times.push(
      `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
    );
  }
  return times;
};
