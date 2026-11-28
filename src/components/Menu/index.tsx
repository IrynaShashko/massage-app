import { FC, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Link, NavLink, useLocation } from "react-router-dom";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import {
  CalendarCheck,
  ChevronRight,
  LogOut,
  Menu as MenuIcon,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import { useAuthLinkState } from "../../hooks/useAuthReturn";
import logo from "../../images/logo.png";

import { ThemeButton } from "../ThemeButton";

import {
  linkTarget,
  PHONE_DISPLAY,
  PHONE_HREF,
  SOCIALS,
} from "../../config/contacts";

import { useBooking } from "../../context/BookingContext";
import { useLogout } from "../../hooks/useAuth";
import { UserAvatar } from "../UserAvatar";

import { ThemeType } from "../../theme/theme";

import { MenuPropsType } from "./types";

const NAV = [
  { to: "/", key: "home_button", end: true },
  { to: "/about", key: "about_button" },
  { to: "/price", key: "price_button" },
  { to: "/reviews", key: "reviews_button" },
  { to: "/article", key: "article_button" },
];

/** Runs after the drawer has closed and the page scroll lock is released */
const afterClose = (fn: () => void) => window.setTimeout(fn, 60);

export const Menu: FC<MenuPropsType> = ({
  languageToggle,
  language,
  darkMode,
  themeToggle,
  isAuthenticated,
  user,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const authState = useAuthLinkState();
  const [t] = useTranslation();
  const { startBooking } = useBooking();
  const logoutMutation = useLogout();

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Close whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock page scroll while the drawer is open
  useEffect(() => {
    if (!isMenuOpen) return;
    const { body, documentElement } = document;
    const prevBody = body.style.overflow;
    const prevHtml = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBody;
      documentElement.style.overflow = prevHtml;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu]);

  const onBook = () => {
    closeMenu();
    afterClose(() => startBooking());
  };

  const onContacts = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    closeMenu();
    afterClose(() => {
      const section = document.getElementById("contacts");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#contacts";
      }
    });
  };

  const onLogout = () => {
    logoutMutation.mutate();
    closeMenu();
  };

  const drawer = (
    <>
      <Backdrop $isOpen={isMenuOpen} onClick={closeMenu} aria-hidden />
      <Drawer
        $isOpen={isMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!isMenuOpen}
      >
        <DrawerTop>
          <Link to="/" onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
            <Logo src={logo} alt="Maria Glushenko" />
          </Link>
          <IconButton
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            <X size={24} />
          </IconButton>
        </DrawerTop>

        <DrawerBody>
          <NavList>
            {NAV.map(({ to, key, end }) => (
              <li key={to}>
                <NavItem
                  to={to}
                  end={end}
                  onClick={closeMenu}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {t(key)}
                  <ChevronRight size={18} aria-hidden />
                </NavItem>
              </li>
            ))}
            <li>
              <NavAnchor
                href="/#contacts"
                onClick={onContacts}
                tabIndex={isMenuOpen ? 0 : -1}
              >
                {t("contacts_button")}
                <ChevronRight size={18} aria-hidden />
              </NavAnchor>
            </li>
          </NavList>

          <Settings>
            <Segmented role="group" aria-label="Language">
              {(["ua", "en"] as const).map((lng) => (
                <SegmentButton
                  key={lng}
                  type="button"
                  $active={language === lng}
                  aria-pressed={language === lng}
                  onClick={() => language !== lng && languageToggle()}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {lng.toUpperCase()}
                </SegmentButton>
              ))}
            </Segmented>

            <SettingsIcons>
              <RoundTile>
                <ThemeButton darkMode={darkMode} themeToggle={themeToggle} />
              </RoundTile>
              {isAuthenticated && user ? (
                <>
                  <RoundTileLink
                    to="/profile"
                    onClick={closeMenu}
                    aria-label={t("profile_title")}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <UserAvatar user={user} size={42} />
                  </RoundTileLink>
                  <RoundTileButton
                    type="button"
                    onClick={onLogout}
                    aria-label={t("profile_logout")}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <LogOut size={22} />
                  </RoundTileButton>
                </>
              ) : (
                <RoundTileLink
                  to="/auth"
                  state={authState}
                  onClick={closeMenu}
                  aria-label={t("login_button")}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  <UserRound size={22} />
                </RoundTileLink>
              )}
            </SettingsIcons>
          </Settings>

          <Actions>
            <PrimaryAction
              type="button"
              onClick={onBook}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              <CalendarCheck size={20} aria-hidden />
              {t("bookNow")}
            </PrimaryAction>
            <SecondaryAction href={PHONE_HREF} tabIndex={isMenuOpen ? 0 : -1}>
              <Phone size={20} aria-hidden />
              {PHONE_DISPLAY}
            </SecondaryAction>

            <Socials>
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <SocialLink
                    href={href}
                    {...linkTarget(href)}
                    aria-label={label}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <Icon aria-hidden />
                  </SocialLink>
                </li>
              ))}
            </Socials>
          </Actions>
        </DrawerBody>
      </Drawer>
    </>
  );

  return (
    <>
      <MobileHeaderContainer>
        <Link to="/" aria-label={t("home_button")}>
          <Logo src={logo} alt="Maria Glushenko" />
        </Link>
        <HeaderActions>
          <ThemeButton
            darkMode={darkMode}
            themeToggle={themeToggle}
            size={26}
          />
          <IconButton
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            <MenuIcon size={26} />
          </IconButton>
        </HeaderActions>
      </MobileHeaderContainer>
      {/* Portalled to <body> so the fixed drawer never depends on the header's box */}
      {createPortal(drawer, document.body)}
    </>
  );
};

const MobileHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);

  /* Bigger tap target for the theme toggle; teal like the menu icon next to it */
  & > button:first-of-type {
    width: 44px;
    height: 44px;
    color: var(--color-primary);
  }
`;

const Logo = styled.img`
  display: block;
  width: 116px;
  height: auto;
`;

const IconButton = styled.button<{ theme?: ThemeType }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  color: var(--color-primary);
  transition: background-color 0.2s ease;

  &:active {
    background-color: var(--color-primary-ring);
  }
`;

const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background-color: rgba(15, 12, 10, 0.45);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition:
    opacity 0.35s ease,
    visibility 0.35s ease;

  @media screen and (min-width: 1080px) {
    display: none;
  }
`;

const Drawer = styled.div<{ $isOpen: boolean; theme?: ThemeType }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1101;
  display: flex;
  flex-direction: column;
  width: min(88vw, 400px);
  height: 100dvh;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.18);
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition:
    transform 0.4s var(--ease-out),
    visibility 0.4s ease;

  @media screen and (min-width: 1080px) {
    display: none;
  }
`;

const DrawerTop = styled.div<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: var(--header-height);
  padding: 0 var(--space-3) 0 var(--space-5);
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const DrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-3) var(--space-5)
    calc(var(--space-5) + env(safe-area-inset-bottom));
`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
`;

const navItemStyles = (theme: ThemeType) => `
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.border};
  transition: color 0.2s ease;

  svg {
    opacity: 0.35;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  &:active svg {
    transform: translateX(3px);
  }
`;

const NavItem = styled(NavLink)<{ theme?: ThemeType }>`
  ${(props) => navItemStyles(props.theme as ThemeType)}

  &.active {
    color: var(--color-primary);
    svg {
      opacity: 1;
    }
  }
`;

const NavAnchor = styled.a<{ theme?: ThemeType }>`
  ${(props) => navItemStyles(props.theme as ThemeType)}
`;

const Settings = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-5);
`;

const Segmented = styled.div<{ theme?: ThemeType }>`
  display: inline-flex;
  padding: 4px;
  border-radius: var(--radius-full);
  background: var(--surface-glass);
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const SegmentButton = styled.button<{ $active: boolean; theme?: ThemeType }>`
  min-width: 52px;
  height: 36px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  background-color: ${(props) =>
    props.$active ? "var(--color-primary)" : "transparent"};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
`;

const SettingsIcons = styled.div`
  display: flex;
  gap: var(--space-2);
`;

const roundTile = (theme: ThemeType) => `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--surface-glass);
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};

  svg {
    width: 22px;
    height: 22px;
  }
`;

const RoundTile = styled.div<{ theme?: ThemeType }>`
  ${(props) => roundTile(props.theme as ThemeType)}
`;

const RoundTileButton = styled.button<{ theme?: ThemeType }>`
  ${(props) => roundTile(props.theme as ThemeType)}
`;

const RoundTileLink = styled(Link)<{ theme?: ThemeType }>`
  ${(props) => roundTile(props.theme as ThemeType)}
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-6);
`;

const actionStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  min-height: 52px;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 700;
  transition: transform 0.15s ease, background-color 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const PrimaryAction = styled.button`
  ${actionStyles}
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 8px 20px -8px var(--color-primary-shadow);
`;

const SecondaryAction = styled.a<{ theme?: ThemeType }>`
  ${actionStyles}
  color: ${(props) => props.theme.colors.text};
  border: 1.5px solid ${(props) => props.theme.colors.border};
`;

const Socials = styled.ul`
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
`;

const SocialLink = styled.a<{ theme?: ThemeType }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;

  svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  &:hover,
  &:active {
    background-color: var(--color-primary);
    color: #fff;
  }

  &:active {
    transform: scale(0.94);
  }
`;

/* Kept for ConnectionButtons, which imports it from here */
export const ConnectionButtonContainer = styled.div`
  margin-inline: auto;
`;
