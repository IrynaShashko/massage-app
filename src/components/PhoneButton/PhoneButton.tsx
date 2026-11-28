import { useEffect, useRef, useState } from "react";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { ReactComponent as Phone } from "../../icons/phone.svg";

import { IconStyled } from "../ConnectionButton";

import { CONTACTS, linkTarget } from "../../config/contacts";

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const STAGGER_MS = 45;

const waterRipple = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.45;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
`;

const PhoneContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  /* On mobile the bottom booking bar already has a call button */
  display: none;
  flex-direction: column;
  align-items: center;
  z-index: 50;

  @media screen and (min-width: 1080px) {
    display: flex;
  }
  @media screen and (min-width: 1440px) {
    bottom: 70px;
    right: 70px;
  }
`;

const ContactList = styled.ul<{ $open: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
`;

const ContactItem = styled.li<{ $open: boolean; $delay: number }>`
  position: relative;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) =>
    $open ? "translateY(0) scale(1)" : "translateY(24px) scale(0.6)"};
  transition:
    opacity 0.25s ease,
    transform 0.4s ${EASE_SPRING};
  transition-delay: ${({ $delay }) => `${$delay}ms`};
`;

const Tooltip = styled.span`
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  padding: 6px 12px;
  border-radius: 8px;
  background-color: var(--color-primary);
  color: #fff;
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translate(6px, -50%);
  transition:
    opacity 0.2s ease,
    transform 0.25s ${EASE_OUT};
  pointer-events: none;
`;

const ContactLink = styled.a`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: var(--color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  transition:
    background-color 0.25s ease,
    transform 0.25s ${EASE_OUT},
    box-shadow 0.25s ease;

  svg {
    width: 26px;
    height: 26px;
  }

  &:hover,
  &:focus-visible {
    background-color: var(--color-primary-hover);
    transform: scale(1.08);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
  }

  &:focus-visible {
    outline-offset: 4px;
    border-radius: 50%;
  }

  &:hover + span,
  &:focus-visible + span {
    opacity: 1;
    transform: translate(0, -50%);
  }
`;

const MainWrapper = styled.div<{ $open: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: var(--color-primary);
    z-index: -1;
    opacity: 0;
    animation: ${waterRipple} 2.6s ${EASE_OUT} infinite;
    animation-play-state: ${({ $open }) => ($open ? "paused" : "running")};
    visibility: ${({ $open }) => ($open ? "hidden" : "visible")};
  }

  &::after {
    animation-delay: 1.3s;
  }
`;

const MainButton = styled.button<{ $open: boolean }>`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ $open }) =>
    $open ? "var(--color-primary-hover)" : "var(--color-primary)"};
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
  transition:
    background-color 0.3s ease,
    transform 0.3s ${EASE_OUT},
    box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.06);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.26);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline-offset: 4px;
    border-radius: 50%;
  }
`;

const MainIcon = styled.span<{ $visible: boolean; $rotate: number }>`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible, $rotate }) =>
    $visible ? "rotate(0deg) scale(1)" : `rotate(${$rotate}deg) scale(0.5)`};
  transition:
    opacity 0.25s ease,
    transform 0.4s ${EASE_SPRING};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/** Pages without the floating button (the sign-in page has its own focused layout) */
const HIDDEN_ON = ["/auth"];

export const PhoneButton = () => {
  const [t] = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Collapse when navigating to another page
  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  // Close on Escape or on click outside
  useEffect(() => {
    if (!isExpanded) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isExpanded]);

  const contactButtons = CONTACTS.map((c) => ({
    ...c,
    label: c.id === "phone" ? t(c.label) : c.label,
  }));

  const count = contactButtons.length;

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <PhoneContainer ref={containerRef}>
      <ContactList id="phone-button-contacts" $open={isExpanded}>
        {contactButtons.map(({ icon, label, href }, index) => {
          // Opening: bottom item first. Closing: top item first.
          const fromBottom = count - 1 - index;
          const delay = (isExpanded ? fromBottom : index) * STAGGER_MS;

          return (
            <ContactItem key={label} $open={isExpanded} $delay={delay}>
              <ContactLink
                href={href}
                aria-label={label}
                tabIndex={isExpanded ? 0 : -1}
                {...linkTarget(href)}
              >
                <IconStyled as={icon} color="#fff" />
              </ContactLink>
              <Tooltip aria-hidden="true">{label}</Tooltip>
            </ContactItem>
          );
        })}
      </ContactList>

      <MainWrapper $open={isExpanded}>
        <MainButton
          type="button"
          $open={isExpanded}
          aria-expanded={isExpanded}
          aria-controls="phone-button-contacts"
          aria-label={isExpanded ? t("close_alt") : t("contacts_button")}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <MainIcon $visible={!isExpanded} $rotate={90}>
            <IconStyled as={Phone} color="#fff" />
          </MainIcon>
          <MainIcon $visible={isExpanded} $rotate={-90}>
            <CloseIcon />
          </MainIcon>
        </MainButton>
      </MainWrapper>
    </PhoneContainer>
  );
};
