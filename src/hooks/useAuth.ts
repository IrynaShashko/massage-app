import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "../lib/supabase";
import { clearDrafts } from "../utils/draft";

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
  role: "user" | "admin";
  /** photo from the Google account; email sign-ups have none */
  avatarUrl?: string;
  /** the photo is shown next to the user's reviews */
  showAvatar?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

const PROFILE_KEY = ["profile"];

/**
 * Where Supabase sends people back after Google or the email link: the home
 * page, with the trailing slash so it matches the "https://site/**" patterns
 * in Supabase -> Authentication -> URL Configuration -> Redirect URLs.
 * useAuthReturnRedirect then takes them on to the page they came from.
 */
const AUTH_REDIRECT_URL = () => `${window.location.origin}/`;

/** Throws Supabase errors so react-query puts them in `error` */
const check = <R extends { error: unknown }>(result: R): R => {
  if (result.error) throw result.error;
  return result;
};

/** The signed-in user with their profile row, or null for guests */
const fetchProfile = async (): Promise<User | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const authUser = session?.user;
  if (!authUser) return null;

  const { data: profile } = check(
    await supabase
      .from("profiles")
      .select("name, role, created_at, show_avatar")
      .eq("id", authUser.id)
      .maybeSingle(),
  );

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name: profile?.name ?? "",
    role: profile?.role === "admin" ? "admin" : "user",
    avatarUrl:
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      undefined,
    showAvatar: profile?.show_avatar ?? true,
    isVerified: !!authUser.email_confirmed_at,
    createdAt: profile?.created_at,
  };
};

export const useProfile = () =>
  useQuery({
    queryKey: PROFILE_KEY,
    queryFn: fetchProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useIsAdmin = () => useProfile().data?.role === "admin";

/**
 * Refetches the profile whenever Supabase signs a user in or out, including
 * the return from Google and from the email confirmation link.
 * Mount once, inside QueryClientProvider.
 */
export const useAuthListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED") return;
      // run outside the auth callback: calling supabase inside it can deadlock
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
        queryClient.invalidateQueries({ queryKey: ["articles"] });
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);
};

export const useLogin = () =>
  useMutation<void, Error, LoginVariables>({
    mutationFn: async ({ email, password }) => {
      check(await supabase.auth.signInWithPassword({ email, password }));
    },
  });

export const useRegister = () =>
  useMutation<void, Error, RegisterVariables>({
    mutationFn: async ({ name, email, password }) => {
      check(
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: AUTH_REDIRECT_URL(),
          },
        }),
      );
    },
  });

/** Supabase refuses a password sign-in until the email is confirmed */
export const isEmailNotConfirmedError = (error: unknown) =>
  !!error &&
  typeof error === "object" &&
  ((error as { code?: string }).code === "email_not_confirmed" ||
    /email not confirmed/i.test((error as { message?: string }).message ?? ""));

/** Sends the sign-up confirmation link again */
export const useResendConfirmation = () =>
  useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      check(
        await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: AUTH_REDIRECT_URL() },
        }),
      );
    },
  });

/**
 * Reloads the session after the client confirmed their email in another tab:
 * the stored session still says "not confirmed" until it is refreshed.
 */
export const useRecheckVerification = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      check(await supabase.auth.refreshSession());
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
};

export const useGoogleLogin = () =>
  useMutation<void, Error, void>({
    mutationFn: async () => {
      check(
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: AUTH_REDIRECT_URL() },
        }),
      );
    },
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { name?: string; showAvatar?: boolean }>({
    mutationFn: async ({ name, showAvatar }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      check(
        await supabase
          .from("profiles")
          .update({
            ...(name !== undefined && { name }),
            ...(showAvatar !== undefined && { show_avatar: showAvatar }),
          })
          .eq("id", user.id),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      // the photo next to the user's reviews changes with the switch
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      check(await supabase.auth.signOut());
    },
    onSettled: () => {
      clearDrafts();
      queryClient.clear();
      window.location.href = "/";
    },
  });
};
