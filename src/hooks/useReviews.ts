import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../api/axios";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export interface ReviewsResponse {
  status: string;
  results: number;
  data: {
    reviews: Review[];
  };
}

export type CreateReviewInput = {
  name: string;
  comment: string;
  rating: number;
  userId: string;
};

export const useReviews = () => {
  return useQuery<ReviewsResponse, Error, Review[]>({
    queryKey: ["reviews"],
    queryFn: () => api.get("/api/reviews").then((res) => res.data.data.reviews),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, CreateReviewInput>({
    mutationFn: (reviewData) => api.post("/api/reviews", reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};
