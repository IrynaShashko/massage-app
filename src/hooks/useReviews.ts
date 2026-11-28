import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  /** null for reviews the admin added for clients without an account */
  userId: string | null;
  /** name typed by the admin; overrides the profile name when set */
  authorName: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}

export type CreateReviewInput = {
  comment: string;
  rating: number;
};

export type AdminReviewInput = {
  authorName: string;
  comment: string;
  rating: number;
  /** ISO timestamp */
  createdAt: string;
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  user_id: string | null;
  author_name: string | null;
  created_at: string;
  author: { name: string } | { name: string }[] | null;
};

const REVIEWS_KEY = ["reviews"];
const COLUMNS =
  "id, rating, comment, user_id, author_name, created_at, author:profiles(name)";

const toReview = (row: ReviewRow): Review => {
  const profile = Array.isArray(row.author) ? row.author[0] : row.author;
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    userId: row.user_id,
    authorName: row.author_name,
    createdAt: row.created_at,
    user: { name: row.author_name?.trim() || profile?.name || "" },
  };
};

export const useReviews = () =>
  useQuery<Review[], Error>({
    queryKey: REVIEWS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ReviewRow[]).map(toReview);
    },
  });

export const useReviewById = (id: string | undefined) =>
  useQuery<Review | null, Error>({
    queryKey: [...REVIEWS_KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? toReview(data as ReviewRow) : null;
    },
  });

/** user_id defaults to auth.uid() in the database */
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreateReviewInput>({
    mutationFn: async ({ comment, rating }) => {
      const { error } = await supabase
        .from("reviews")
        .insert({ comment, rating });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_KEY });
    },
  });
};

/**
 * Admin only (enforced by RLS). Creates a review with no linked account when
 * `id` is missing, otherwise updates the review.
 */
export const useSaveReview = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id?: string; input: AdminReviewInput }>({
    mutationFn: async ({ id, input }) => {
      const row = {
        author_name: input.authorName.trim() || null,
        comment: input.comment,
        rating: input.rating,
        created_at: input.createdAt,
      };
      const { error } = id
        ? await supabase.from("reviews").update(row).eq("id", id)
        : // explicit null: otherwise the review would be linked to the admin
          await supabase.from("reviews").insert({ ...row, user_id: null });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REVIEWS_KEY }),
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REVIEWS_KEY }),
  });
};
