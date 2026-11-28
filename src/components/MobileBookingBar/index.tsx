import { FC, useEffect, useRef, useState } from "react";

import styled from "@emotion/styled";
import { CalendarCheck, MessageCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { BOOKING_SECTION_ID, useBooking } from "../../context/BookingContext";
import { ThemeType } from "../../theme/theme";
import { IconStyled } from "../ConnectionButton";
import { CONTACTS, linkTarget, PHONE_DISPLAY } from "../../config/contacts";

const SHEET_ID = "mobile-contact-sheet";
const HIDDEN_ON = ["/auth"];

/** Hero "Book" button: while it is on screen the bar would only duplicate it */
export const HERO_CTA_ID = "hero-cta";

/**
 * Sticky bottom bar on mobile/tablet with the two main actions.
 * Hides itself while the hero CTA or the booking form is on screen,
 * so it never duplicates or covers them.
 * "Get in touch" opens a small sheet with the phone and messengers.
 */
export const MobileBookingBar: FC = () => {
  const [t] = useTranslation();
  const { startBooking } = useBooking();
  const { pathname } = useLocation();
  // Ids of on-screen elements that already offer booking (hero CTA, booking form)
  const [visibleTargets, setVisibleTargets] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    setVisibleTargets(new Set());
    const observers: IntersectionObserver[] = [];
    const timers: number[] = [];

    // Pages are lazy-loaded, so wait for each target to appear before observing it.
    // The hero CTA only exists on the home page, so it may never appear.
    const watch = (id: string, threshold: number, attemptsLeft = 40) => {
      const el = document.getElementById(id);
      if (!el) {
        if (attemptsLeft > 0) {
          timers.push(
            window.setTimeout(
              () => watch(id, threshold, attemptsLeft - 1),
              100,
            ),
          );
        }
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) =>
          setVisibleTargets((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) next.add(id);
            else next.delete(id);
            return next;
          }),
        { threshold },
      );
      observer.observe(el);
      observers.push(observer);
    };

    watch(HERO_CTA_ID, 0);
    watch(BOOKING_SECTION_ID, 0.15);

    return () => {
      observers.forEach((o) => o.disconnect());
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  const isFormVisible = visibleTargets.size > 0;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the sheet when the page changes or the bar slides away
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname, isFormVisible]);

  useEffect(() => {
    if (!isSheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSheetOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSheetOpen]);

  if (HIDDEN_ON.includes(pathname)) return null;

  const barTabIndex = isFormVisible ? -1 : 0;

  return (
    <>
      <Backdrop
        $open={isSheetOpen}
        aria-hidden="true"
        onClick={() => setIsSheetOpen(false)}
      />

      <Bar $hidden={isFormVisible} aria-hidden={isFormVisible}>
        <Sheet id={SHEET_ID} $open={isSheetOpen} aria-label={t("get_in_touch")}>
          {CONTACTS.map(({ id, icon, label, href }, index) => (
            <li key={id}>
              <SheetLink
                href={href}
                $open={isSheetOpen}
                $delay={isSheetOpen ? 60 + index * 40 : 0}
                tabIndex={isSheetOpen ? 0 : -1}
                onClick={() => setIsSheetOpen(false)}
                {...linkTarget(href)}
              >
                <SheetIcon>
                  <IconStyled as={icon} color="#fff" />
                </SheetIcon>
                <SheetText>
                  <SheetTitle>{id === "phone" ? t(label) : label}</SheetTitle>
                  <SheetHint>
                    {id === "phone" ? PHONE_DISPLAY : t("send_message")}
                  </SheetHint>
                </SheetText>
              </SheetLink>
            </li>
          ))}
        </Sheet>

        <ContactToggle
          ref={toggleRef}
          type="button"
          $open={isSheetOpen}
          aria-expanded={isSheetOpen}
          aria-controls={SHEET_ID}
          tabIndex={barTabIndex}
          onClick={() => setIsSheetOpen((prev) => !prev)}
        >
          <ToggleIcon $open={isSheetOpen}>
            <MessageCircle size={20} aria-hidden />
            <X size={20} aria-hidden />
          </ToggleIcon>
          {t("get_in_touch")}
        </ContactToggle>
        <BookButton
          type="button"
          onClick={() => {
            setIsSheetOpen(false);
            startBooking();
          }}
          tabIndex={barTabIndex}
        >
          <CalendarCheck size={20} />
          {t("bookNow")}
        </BookButton>
      </Bar>
    </>
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

const ContactToggle = styled.button<{ $open: boolean; theme?: ThemeType }>`
  ${actionStyles}
  color: ${(props) =>
    props.$open ? "var(--color-primary)" : props.theme.colors.text};
  border: 1.5px solid
    ${(props) =>
      props.$open
        ? "var(--color-primary)"
        : `color-mix(in srgb, ${props.theme.colors.text} 25%, transparent)`};
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
`;

/* Both icons are stacked; the message bubble turns into a cross */
const ToggleIcon = styled.span<{ $open: boolean }>`
  position: relative;
  display: inline-flex;
  width: 20px;
  height: 20px;

  svg {
    position: absolute;
    inset: 0;
    transition:
      opacity 0.2s ease,
      transform 0.35s var(--ease-out);
  }

  svg:first-of-type {
    opacity: ${(props) => (props.$open ? 0 : 1)};
    transform: ${(props) =>
      props.$open ? "rotate(90deg) scale(0.5)" : "none"};
  }

  svg:last-of-type {
    opacity: ${(props) => (props.$open ? 1 : 0)};
    transform: ${(props) =>
      props.$open ? "none" : "rotate(-90deg) scale(0.5)"};
  }
`;

const Backdrop = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 899;
  background: rgba(20, 16, 13, 0.35);
  opacity: ${(props) => (props.$open ? 1 : 0)};
  pointer-events: ${(props) => (props.$open ? "auto" : "none")};
  transition: opacity 0.3s ease;

  @media screen and (min-width: 1080px) {
    display: none;
  }
`;

/* Card that rises from the bar, above the "Get in touch" button */
const Sheet = styled.ul<{ $open: boolean; theme?: ThemeType }>`
  position: absolute;
  left: var(--space-4);
  right: var(--space-4);
  bottom: calc(100% + var(--space-3));
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
  padding: var(--space-2);
  list-style: none;
  border-radius: 20px;
  background: ${(props) => props.theme.colors.headerBg};
  box-shadow: 0 12px 40px ${(props) => props.theme.colors.boxShadow};
  transform-origin: bottom left;
  opacity: ${(props) => (props.$open ? 1 : 0)};
  transform: ${(props) =>
    props.$open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)"};
  visibility: ${(props) => (props.$open ? "visible" : "hidden")};
  transition:
    opacity 0.25s ease,
    transform 0.35s var(--ease-out),
    visibility 0s linear ${(props) => (props.$open ? "0s" : "0.35s")};
`;

const SheetLink = styled.a<{
  $open: boolean;
  $delay: number;
  theme?: ThemeType;
}>`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: 14px;
  color: ${(props) => props.theme.colors.text};
  opacity: ${(props) => (props.$open ? 1 : 0)};
  transform: translateY(${(props) => (props.$open ? "0" : "8px")});
  transition:
    opacity 0.25s ease ${(props) => props.$delay}ms,
    transform 0.35s var(--ease-out) ${(props) => props.$delay}ms,
    background-color 0.2s ease;

  &:active {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }
`;

const SheetIcon = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--color-primary);

  svg {
    width: 22px;
    height: 22px;
  }
`;

const SheetText = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const SheetTitle = styled.span`
  font-weight: 700;
  font-size: var(--text-base);
  line-height: 1.3;
`;

const SheetHint = styled.span`
  font-size: var(--text-sm);
  line-height: 1.3;
  opacity: 0.65;
`;

const BookButton = styled.button`
  ${actionStyles}
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 6px 16px -6px var(--color-primary-shadow);
`;
