import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

export const BOOKING_SECTION_ID = "booking-section";
/** Heading above the booking form ("Contacts & booking"), also the #contacts anchor */
export const BOOKING_HEADING_ID = "contacts";

export interface BookingPreset {
  /** Category key from price.json: women | men | children | body | else */
  category: string;
  /** Service name exactly as in price.json */
  service?: string;
  /** Changes on every request so the same service can be picked twice */
  nonce: number;
}

interface BookingContextType {
  preset: BookingPreset | null;
  /** Scrolls to the booking form (navigating home if the page has none), optionally preselecting a service */
  startBooking: (selection?: { category: string; service?: string }) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const scrollToBookingForm = (attemptsLeft = 40) => {
  const section = document.getElementById(BOOKING_SECTION_ID);
  if (section) {
    // Land on the section heading so the title is visible above the form
    const target = document.getElementById(BOOKING_HEADING_ID) ?? section;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  // The target page is lazy-loaded, so wait for the form to mount
  if (attemptsLeft > 0) {
    window.setTimeout(() => scrollToBookingForm(attemptsLeft - 1), 50);
  }
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [preset, setPreset] = useState<BookingPreset | null>(null);

  const startBooking = useCallback<BookingContextType["startBooking"]>(
    (selection) => {
      if (selection) {
        setPreset({ ...selection, nonce: Date.now() });
      }
      if (!document.getElementById(BOOKING_SECTION_ID)) {
        navigate("/");
      }
      scrollToBookingForm();
    },
    [navigate],
  );

  const value = useMemo(
    () => ({ preset, startBooking }),
    [preset, startBooking],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context)
    throw new Error("useBooking must be used within BookingProvider");
  return context;
};
