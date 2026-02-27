import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

// Описуємо, що чекає бекенд
interface CreateBookingInput {
  name: string;
  phone: string; // на фронті це 'tel'
  service: string; // назва послуги + підпослуга
  comment: string; // на фронті це 'text'
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingInput) => {
      console.log("Відправляємо на бекенд:", bookingData); // Перевірка даних перед відправкою
      const response = await api.post("/api/book-service", bookingData);
      console.info("response", response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Сервер відповів успіхом:", data);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      // Тут ми побачимо, якщо сервер вибив помилку (наприклад, 404 або 500)
      console.error("Помилка запиту:", error.response?.data || error.message);
    },
  });
};
