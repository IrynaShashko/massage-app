import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

interface CreateBookingInput {
  name: string;
  phone: string;
  email: string;
  service: string;
  comment: string;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingInput) => {
      console.log("Відправляємо на бекенд:", bookingData);
      const response = await api.post("/api/book-service", bookingData);
      console.info("response", response);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      console.error("Помилка запиту:", error.response?.data || error.message);
    },
  });
};
