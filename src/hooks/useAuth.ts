import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../api/axios";

export interface RegisterVariables {
  name: string;
  email: string;
  password: string;
}

export interface LoginVariables {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface GoogleLoginVariables {
  idToken: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, LoginVariables>({
    mutationFn: async (credentials) => {
      const { data } = await api.post("/api/auth/login", credentials);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: any) => {
      console.error("Login error:", err.response?.data || err);
    },
  });
};

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, GoogleLoginVariables>({
    mutationFn: async ({ idToken }) => {
      const { data } = await api.post("/api/auth/google", { idToken });
      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: any) => {
      console.error("Google login error:", err.response?.data || err);
    },
  });
};

export const useRegister = () => {
  return useMutation<User, Error, RegisterVariables>({
    mutationFn: async (userData: RegisterVariables) => {
      const { data } = await api.post("/api/auth/register", userData);
      return data;
    },
    onError: (err: any) => {
      console.error("Register error:", err.response?.data || err);
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/api/auth/profile").then((res) => res.data),
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { name: string }>({
    mutationFn: async (data) => {
      const res = await api.put("/api/auth/profile", data);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["profile"], updatedUser);
    },
  });
};

export const useVerifyEmail = (token: string) => {
  return useQuery({
    queryKey: ["verify-email", token],
    queryFn: () =>
      api.get(`/api/auth/verify-email/${token}`).then((res) => res.data),
    enabled: !!token,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.post("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data) => api.post("/api/auth/forgot-password", data),
  });
};

export const useBookService = () => {
  return useMutation({
    mutationFn: (bookingData) => api.post("/api/book-service", bookingData),
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.get("/api/auth/health").then((res) => res.data),
    refetchInterval: 60000,
  });
};
