import React, { useEffect, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import { CalendarCheck, UserRound } from "lucide-react";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import logo from "../../images/logo.png";

import { Menu } from "../Menu";
import { ThemeButton } from "../ThemeButton";

import { useProfile } from "../../hooks/useAuth";
import { UserAvatar } from "../UserAvatar";
import { useBooking } from "../../context/BookingContext";

import { ThemeType } from "../../theme/theme";

import { HeaderPropsType } from "./types";

export const Header: React.FC<HeaderPropsType> = ({
  themeToggle,
  languageToggle,
  language,
  darkMode,
}) => {
  const [t] = useTranslation();

  const { data: user } = useProfile();

  const isAuthenticated = !!user;

  const { startBooking } = useBooking();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollToContacts = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    const section = document.getElementById("contacts");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#contacts";
    }
  };

  return (
    <HeaderContainer $darkMode={darkMode} $scrolled={isScrolled}>
      <StyledSectionContainer>
        <Wrapper>
          <Logo to="/" aria-label={t("home_button")}>
            <img src={logo} alt="Maria Glushenko" />
          </Logo>
          <NavLinks>
            <li>
              <StyledNavLink to="/" end>
                {t("home_button")}
              </StyledNavLink>
            </li>
            <li>
              <StyledNavLink to="/about">{t("about_button")}</StyledNavLink>
            </li>
            <li>
              <StyledNavLink to="/price">{t("price_button")}</StyledNavLink>
            </li>
            <li>
              <StyledNavLink to="/reviews">{t("reviews_button")}</StyledNavLink>
            </li>
            <li>
              <StyledNavLink to="/article">{t("article_button")}</StyledNavLink>
            </li>
            <li>
              <StyledLink href="/#contacts" onClick={handleScrollToContacts}>
                {t("contacts_button")}
              </StyledLink>
            </li>
          </NavLinks>
          <ButtonContainer>
            <LangSwitch role="group" aria-label="Language">
              {(["ua", "en"] as const).map((lng) => (
                <LangOption
                  key={lng}
                  type="button"
                  $active={language === lng}
                  aria-pressed={language === lng}
                  onClick={() => language !== lng && languageToggle()}
                >
                  {lng.toUpperCase()}
                </LangOption>
              ))}
            </LangSwitch>
            <IconTile>
              <ThemeButton
                darkMode={darkMode}
                themeToggle={themeToggle}
                size={20}
              />
            </IconTile>
            {user ? (
              <IconTileLink
                to="/profile"
                aria-label={t("profile_title")}
                title={t("profile_title")}
              >
                <UserAvatar user={user} size={32} />
              </IconTileLink>
            ) : (
              <IconTileLink to="/auth" aria-label={t("login_button")}>
                <UserRound size={20} />
              </IconTileLink>
            )}
            <CtaButton type="button" onClick={() => startBooking()}>
              <CalendarCheck size={18} aria-hidden />
              {t("bookNow")}
            </CtaButton>
          </ButtonContainer>
        </Wrapper>
        <MenuWrapper>
          <Menu
            languageToggle={languageToggle}
            language={language}
            darkMode={darkMode}
            themeToggle={themeToggle}
            isAuthenticated={isAuthenticated}
            user={user ?? null}
          />
        </MenuWrapper>
      </StyledSectionContainer>
    </HeaderContainer>
  );
};

const StyledSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  @media screen and (min-width: 900px) {
    padding: 0 40px;
  }
`;

const HeaderContainer = styled.header<{
  $darkMode: boolean;
  $scrolled: boolean;
  theme?: ThemeType;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--header-height);
  /* Solid, no backdrop-filter: on iOS a blurred/translucent fixed header lets
     the page show through, and backdrop-filter also traps fixed children */
  background: ${(props) => props.theme.colors.headerBg};
  z-index: 1000;
  /* Hairline so the header reads as its own layer even at the top of the page */
  border-bottom: 1px solid
    color-mix(in srgb, ${(props) => props.theme.colors.border} 60%, transparent);
  box-shadow: ${(props) =>
    props.$scrolled ? `0 4px 16px ${props.theme.colors.boxShadow}` : "none"};
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
`;

const Wrapper = styled.nav`
  display: none;
  @media screen and (min-width: 1080px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const MenuWrapper = styled.div`
  display: block;
  position: relative;
  @media screen and (min-width: 1080px) {
    display: none;
  }
`;

const Logo = styled(Link)`
  flex-shrink: 0;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 150px;
    height: auto;
    transition: filter 0.3s ease;
  }

  @media screen and (max-width: 1399px) {
    img {
      width: 132px;
    }
  }

  /* The logo is a dark-teal PNG: lift it so it stays readable on the dark header */
  [data-theme="dark"] & img {
    filter: brightness(1.9) saturate(0.85);
  }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 2px;
  margin: 0 16px;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`;

/* Pill links: tinted background on hover, filled tint for the current page */
const navLinkStyles = (theme: ThemeType) => `
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  border-radius: var(--radius-full);
  color: ${theme.colors.text};
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  &.active {
    color: var(--color-primary);
    font-weight: 700;
    background-color: color-mix(in srgb, var(--color-primary) 14%, transparent);
  }

  /* Tighter pills where the logo, six links and the CTA barely fit */
  @media screen and (max-width: 1399px) {
    padding: 0 10px;
  }
`;

const StyledNavLink = styled(NavLink)<{ theme?: ThemeType }>`
  ${(props) => navLinkStyles(props.theme as ThemeType)}
`;

const StyledLink = styled.a<{ theme?: ThemeType }>`
  ${(props) => navLinkStyles(props.theme as ThemeType)}
`;

const CtaButton = styled.button`
  display: none;
  align-items: center;
  gap: var(--space-2);
  margin-left: var(--space-2);
  padding: 10px 20px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-weight: 700;
  font-size: var(--text-base);
  white-space: nowrap;
  box-shadow: 0 6px 16px -6px var(--color-primary-shadow);
  transition:
    background-color 0.2s ease,
    transform 0.2s var(--ease-out);

  &:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  @media screen and (min-width: 1200px) {
    display: inline-flex;
  }
`;

/* Utilities sit apart from the page links, behind a thin divider */
const ButtonContainer = styled.div<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-left: var(--space-5);
  border-left: 1px solid ${(props) => props.theme.colors.border};
`;

const LangSwitch = styled.div<{ theme?: ThemeType }>`
  display: inline-flex;
  padding: 3px;
  margin-right: var(--space-1);
  border-radius: var(--radius-full);
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const LangOption = styled.button<{ $active: boolean; theme?: ThemeType }>`
  min-width: 36px;
  height: 28px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  background-color: ${(props) =>
    props.$active ? "var(--color-primary)" : "transparent"};
  opacity: ${(props) => (props.$active ? 1 : 0.7)};
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

/* One shape for every header icon: 40px round tile, tint on hover */
const iconTileStyles = (theme: ThemeType) => `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  color: ${theme.colors.text};
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  & > button {
    width: 100%;
    height: 100%;
  }

  &:hover {
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;

const IconTile = styled.span<{ theme?: ThemeType }>`
  ${(props) => iconTileStyles(props.theme as ThemeType)}
`;

const IconTileLink = styled(Link)<{ theme?: ThemeType }>`
  ${(props) => iconTileStyles(props.theme as ThemeType)}
`;
