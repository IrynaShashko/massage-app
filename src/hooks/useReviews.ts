import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export type CreateReviewInput = {
  comment: string;
  rating: number;
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  user_id: string;
  created_at: string;
  author: { name: string } | { name: string }[] | null;
};

const toReview = (row: ReviewRow): Review => {
  const author = Array.isArray(row.author) ? row.author[0] : row.author;
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    userId: row.user_id,
    createdAt: row.created_at,
    user: { name: author?.name ?? "" },
  };
};

export const useReviews = () =>
  useQuery<Review[], Error>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, rating, comment, user_id, created_at, author:profiles(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ReviewRow[]).map(toReview);
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
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};
