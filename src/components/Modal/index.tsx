import styled from "@emotion/styled";
import { FC, KeyboardEvent, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { LogIn, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { isGoogleAuthEnabled } from "../../config/google";
import { useGoogleLogin } from "../../hooks/useAuth";
import { saveAuthReturn, useAuthLinkState } from "../../hooks/useAuthReturn";
import googleIcon from "../../icons/google.svg";
import { cardSurface } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";
import { ModalPropsType } from "./types";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Sign-in prompt for actions that need an account (leaving a review,
 * booking). A dialog on wide screens, a bottom sheet on phones. Whatever the
 * visitor typed is kept as a draft, and after signing in they come back here.
 */
export const Modal: FC<ModalPropsType> = ({ onClose, authExtra }) => {
  const [t] = useTranslation();
  const authState = useAuthLinkState(authExtra);
  const googleMutation = useGoogleLogin();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLAnchorElement>(null);

  // Focus the main action on open; give focus back to what opened the dialog
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    firstActionRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    // keep Tab inside the dialog
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const signInWithGoogle = () => {
    // Google comes back to the home page; this brings the visitor back here
    saveAuthReturn(authState);
    googleMutation.mutate();
  };

  const modalRoot = document.querySelector("#modal");
  if (!modalRoot) {
    throw new Error("Modal root element not found!");
  }

  return createPortal(
    <Backdrop
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
        <CloseButton
          type="button"
          onClick={onClose}
          aria-label={t("close_alt")}
        >
          <X size={22} aria-hidden />
        </CloseButton>

        <IconBadge aria-hidden>
          <LogIn size={24} />
        </IconBadge>
        <Title id={titleId}>
          {t(authExtra?.booking ? "modal_title_booking" : "modal_title_review")}
        </Title>
        <Hint>{t("modal_draft_hint")}</Hint>

        <Actions>
          <PrimaryLink
            ref={firstActionRef}
            to="/auth"
            state={authState}
            onClick={onClose}
          >
            {t("login_action")}
          </PrimaryLink>
          <SecondaryLink
            to="/auth"
            state={{ ...authState, register: true }}
            onClick={onClose}
          >
            {t("create_account")}
          </SecondaryLink>

          {isGoogleAuthEnabled && (
            <>
              <Divider>
                <span>{t("or")}</span>
              </Divider>
              <GoogleButton
                type="button"
                onClick={signInWithGoogle}
                disabled={googleMutation.isPending}
              >
                <img src={googleIcon} alt="" aria-hidden />
                {t("google_continue")}
              </GoogleButton>
              {googleMutation.isError && (
                <ErrorText role="alert">{t("auth_error")}</ErrorText>
              )}
            </>
          )}
        </Actions>
      </Dialog>
    </Backdrop>,
    modalRoot,
  );
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
  animation: backdropIn 0.2s ease-out;

  @keyframes backdropIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* phones: a sheet sliding up from the bottom edge */
  @media screen and (max-width: 599px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Dialog = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  /* solid, so the page behind never shows through the text */
  background: ${(props) => props.theme.colors.headerBg};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: var(--space-6) var(--space-5) var(--space-5);
  text-align: center;
  color: ${(props) => props.theme.colors.text};
  animation: dialogIn 0.25s var(--ease-out, ease-out);

  @keyframes dialogIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media screen and (max-width: 599px) {
    max-width: none;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border-bottom: none;
    padding-bottom: calc(var(--space-5) + env(safe-area-inset-bottom));
    animation-name: sheetIn;

    @keyframes sheetIn {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CloseButton = styled.button<{ theme?: ThemeType }>`
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  color: ${(props) => props.theme.colors.text};
  opacity: 0.7;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;

const IconBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: var(--space-3);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
`;

const Title = styled.h2`
  margin: 0 var(--space-5) var(--space-2);
  font-size: var(--text-xl, 1.25rem);
  font-weight: 700;
  line-height: 1.3;
`;

const Hint = styled.p`
  max-width: 300px;
  margin-bottom: var(--space-5);
  font-size: var(--text-sm);
  line-height: 1.5;
  opacity: 0.75;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
`;

const buttonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: 13px 20px;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
`;

const PrimaryLink = styled(Link)`
  ${buttonBase}
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 10px 24px -12px var(--color-primary-shadow);

  &:hover {
    background-color: var(--color-primary-hover);
  }
`;

const SecondaryLink = styled(Link)`
  ${buttonBase}
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);

  &:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }
`;

const Divider = styled.div<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-2) 0;
  font-size: var(--text-sm);

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }

  span {
    opacity: 0.6;
  }
`;

const GoogleButton = styled.button<{ theme?: ThemeType }>`
  ${buttonBase}
  border: 1.5px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    border-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const ErrorText = styled.p`
  color: #d64545;
  font-size: var(--text-sm);
  font-weight: 600;
`;
