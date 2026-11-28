import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { scrollToBookingForm } from "../context/BookingContext";
import { useProfile } from "./useAuth";

/**
 * Where to bring the visitor back after they sign in. Passed as router state
 * on every link to /auth; the auth page saves it until a sign-in happens.
 */
export interface AuthReturnState {
  /** path + query + hash of the page the visitor came from */
  from?: string;
  /** they came to book: scroll to the booking form on return */
  booking?: boolean;
}

/**
 * localStorage, not sessionStorage: the email confirmation link opens in a
 * new tab, and Google sign-in leaves the site and comes back to "/"
 */
const STORAGE_KEY = "auth_return";
/** a forgotten value must not move a later, unrelated sign-in */
const MAX_AGE_MS = 60 * 60 * 1000;

export const saveAuthReturn = (state: AuthReturnState) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, savedAt: Date.now() }),
    );
  } catch {
    // storage blocked (private mode): the visitor just lands on the home page
  }
};

const readAuthReturn = (): AuthReturnState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { from, booking, savedAt } = JSON.parse(raw);
    if (typeof savedAt !== "number" || Date.now() - savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // only paths inside the site
    const path =
      typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
        ? from
        : "/";
    return { from: path, booking: booking === true };
  } catch {
    return null;
  }
};

export const hasAuthReturn = () => readAuthReturn() !== null;

const takeAuthReturn = () => {
  const state = readAuthReturn();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clean up
  }
  return state;
};

/** Router state for a link to /auth that brings the visitor back here */
export const useAuthLinkState = (
  extra?: Omit<AuthReturnState, "from">,
): AuthReturnState => {
  const { pathname, search, hash } = useLocation();
  // never return to the auth page itself
  const from = pathname === "/auth" ? "/" : `${pathname}${search}${hash}`;
  return { from, ...extra };
};

/**
 * Once someone signs in (password, Google or the confirmation link), sends
 * them back to the page saved by the auth page. Mount once, inside the router
 * and BookingProvider.
 */
export const useAuthReturnRedirect = () => {
  const { data: user } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const state = takeAuthReturn();
    if (!state) return;
    navigate(state.from ?? "/", { replace: true });
    if (state.booking) scrollToBookingForm();
  }, [user, navigate]);
};
