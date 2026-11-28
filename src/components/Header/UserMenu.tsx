import { FC, useEffect, useId, useRef, useState } from "react";

import styled from "@emotion/styled";
import { ChevronDown, LogIn, LogOut, UserPlus, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { useLogout, User } from "../../hooks/useAuth";
import { useAuthLinkState } from "../../hooks/useAuthReturn";
import { ThemeType } from "../../theme/theme";
import { UserAvatar } from "../UserAvatar";

/**
 * Account pill in the header: for a signed-in user their avatar, opening
 * "Profile" and "Log out"; for a guest a person icon, opening "Log in" and
 * "Create account"
 */
export const UserMenu: FC<{ user: User | null }> = ({ user }) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const { pathname } = useLocation();
  const logoutMutation = useLogout();
  const authState = useAuthLinkState();

  // close on navigation, outside click and Escape
  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <Root ref={rootRef}>
      <Trigger
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={user ? t("profile_title") : t("login_button")}
        title={user ? user.name || user.email : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        {user ? (
          <UserAvatar user={user} size={32} />
        ) : (
          <GuestIcon aria-hidden>
            <UserRound size={18} />
          </GuestIcon>
        )}
        <Chevron size={18} aria-hidden $open={isOpen} />
      </Trigger>

      {isOpen && !user && (
        <Dropdown id={menuId} role="menu">
          <ItemLink to="/auth" state={authState} role="menuitem">
            <LogIn size={18} aria-hidden />
            {t("login_action")}
          </ItemLink>
          <ItemLink
            to="/auth"
            state={{ ...authState, register: true }}
            role="menuitem"
          >
            <UserPlus size={18} aria-hidden />
            {t("create_account")}
          </ItemLink>
        </Dropdown>
      )}

      {isOpen && user && (
        <Dropdown id={menuId} role="menu">
          <Identity>
            <strong>{user.name || user.email}</strong>
            {user.name && <span>{user.email}</span>}
          </Identity>
          <ItemLink to="/profile" role="menuitem">
            <UserRound size={18} aria-hidden />
            {t("profile_title")}
          </ItemLink>
          <Item
            type="button"
            role="menuitem"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={18} aria-hidden />
            {t("profile_logout")}
          </Item>
        </Dropdown>
      )}
    </Root>
  );
};

const Root = styled.div`
  position: relative;
`;

const Trigger = styled.button<{ theme?: ThemeType }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 10px 0 4px;
  border-radius: var(--radius-full);
  color: var(--color-primary);
  border: 1.5px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
  background-color: transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &[aria-expanded="true"] {
    border-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  @media (hover: hover) {
    &:hover {
      border-color: var(--color-primary);
      background-color: color-mix(
        in srgb,
        var(--color-primary) 8%,
        transparent
      );
    }
  }
`;

/** Same 32px circle as the avatar, so both states have one shape */
const GuestIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary) 14%, transparent);
`;

const Chevron = styled(ChevronDown, {
  shouldForwardProp: (prop) => prop !== "$open",
})<{ $open: boolean }>`
  stroke-width: 2.5;
  transform: rotate(${(props) => (props.$open ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;

const Dropdown = styled.div<{ theme?: ThemeType }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 220px;
  max-width: 280px;
  padding: 6px;
  border-radius: var(--radius-md);
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.headerBg};
  box-shadow: 0 12px 32px -8px ${(props) => props.theme.colors.boxShadow};
`;

const Identity = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px 10px;
  margin-bottom: 4px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.text};
  font-size: var(--text-sm);
  overflow-wrap: anywhere;

  span {
    opacity: 0.65;
  }
`;

const itemStyles = (theme: ThemeType) => `
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-sm, 8px);
  color: ${theme.colors.text};
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: left;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--color-primary);
      background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const Item = styled.button<{ theme?: ThemeType }>`
  ${(props) => itemStyles(props.theme as ThemeType)}
`;

const ItemLink = styled(Link)<{ theme?: ThemeType }>`
  ${(props) => itemStyles(props.theme as ThemeType)}
`;
