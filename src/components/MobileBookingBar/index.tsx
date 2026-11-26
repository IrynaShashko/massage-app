import { FC, useEffect, useState } from "react";

import styled from "@emotion/styled";
import { CalendarCheck, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { BOOKING_SECTION_ID, useBooking } from "../../context/BookingContext";
import { ThemeType } from "../../theme/theme";

const PHONE_HREF = "tel:+380936193616";
const HIDDEN_ON = ["/auth"];

/**
 * Sticky bottom bar on mobile/tablet with the two main actions.
 * Hides itself while the booking form is on screen so it never covers it.
 */
export const MobileBookingBar: FC = () => {
  const [t] = useTranslation();
  const { startBooking } = useBooking();
  const { pathname } = useLocation();
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    setIsFormVisible(false);
    let observer: IntersectionObserver | undefined;
    let timer: number | undefined;

    // Pages are lazy-loaded, so wait for the form to appear before observing it
    const attach = (attemptsLeft = 40) => {
      const section = document.getElementById(BOOKING_SECTION_ID);
      if (!section) {
        if (attemptsLeft > 0) {
          timer = window.setTimeout(() => attach(attemptsLeft - 1), 100);
        }
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => setIsFormVisible(entry.isIntersecting),
        { threshold: 0.15 },
      );
      observer.observe(section);
    };

    attach();

    return () => {
      observer?.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <Bar $hidden={isFormVisible} aria-hidden={isFormVisible}>
      <CallLink href={PHONE_HREF} tabIndex={isFormVisible ? -1 : 0}>
        <Phone size={20} />
        {t("call")}
      </CallLink>
      <BookButton
        type="button"
        onClick={() => startBooking()}
        tabIndex={isFormVisible ? -1 : 0}
      >
        <CalendarCheck size={20} />
        {t("bookNow")}
      </BookButton>
    </Bar>
  );
};

/** Space reserved at the bottom of the page so the bar never hides content */
export const MOBILE_BAR_SPACE = "88px";

const Bar = styled.div<{ $hidden: boolean; theme?: ThemeType }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
  background: ${(props) => props.theme.colors.headerBg};
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 -4px 16px ${(props) => props.theme.colors.boxShadow};
  transform: translateY(${(props) => (props.$hidden ? "110%" : "0")});
  transition: transform 0.35s var(--ease-out);

  @media screen and (min-width: 1080px) {
    display: none;
  }
`;

const actionStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 48px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: var(--text-base);
  transition:
    background-color 0.2s ease,
    transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }
`;

const CallLink = styled.a<{ theme?: ThemeType }>`
  ${actionStyles}
  color: ${(props) => props.theme.colors.text};
  border: 1.5px solid
    color-mix(in srgb, ${(props) => props.theme.colors.text} 25%, transparent);
`;

const BookButton = styled.button`
  ${actionStyles}
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 6px 16px -6px var(--color-primary-shadow);
`;
