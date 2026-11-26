import React, { useEffect, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import { LogOut, UserRound } from "lucide-react";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import logo from "../../images/logo.png";

import { LanguageButton } from "../LanguageButton";
import { Menu } from "../Menu";
import { ThemeButton } from "../ThemeButton";

import { useLogout, useProfile } from "../../hooks/useAuth";
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

  const logoutMutation = useLogout();

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

  const onLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <HeaderContainer $darkMode={darkMode} $scrolled={isScrolled}>
      <StyledSectionContainer>
        <Wrapper>
          <Logo to="/">
            <img src={logo} alt="Logo" />
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
            <LanguageButton
              languageToggle={languageToggle}
              language={language}
            />
            <ThemeButton darkMode={darkMode} themeToggle={themeToggle} />
            {isAuthenticated ? (
              <LogoutButton onClick={onLogout} aria-label="Log out">
                <LogOut size={28} />
              </LogoutButton>
            ) : (
              <StyledUserLink to="/auth" aria-label="Log in">
                <UserRound size={28} />
              </StyledUserLink>
            )}
            <CtaButton type="button" onClick={() => startBooking()}>
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
            user={user}
          />
        </MenuWrapper>
      </StyledSectionContainer>
    </HeaderContainer>
  );
};

const StyledSectionContainer = styled.header`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px;
  @media screen and (min-width: 900px) {
    padding: 20px 40px;
  }
`;

const LogoutButton = styled.button`
  color: ${(props) => props.theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: opacity 0.3s;

  &:hover {
    svg {
      stroke: ${(props) => props.theme.colors.primary};
      transition: stroke 0.3s ease;
    }
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
  background: ${(props) => props.theme.colors.headerBg};
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  z-index: 1000;
  box-shadow: ${(props) =>
    props.$scrolled ? `0 4px 16px ${props.theme.colors.boxShadow}` : "none"};
  transition:
    background 0.6s ease,
    backdrop-filter 0.6s ease,
    box-shadow 0.6s ease;
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
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 150px;
    height: auto;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 24px;
  margin: 0 24px;
  justify-content: center;
  flex-grow: 1;
`;

const StyledUserLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.text};
  &:hover {
    svg {
      stroke: ${(props) => props.theme.colors.primary};
      transition: stroke 0.3s ease;
    }
  }
`;

const StyledNavLink = styled(NavLink)<{ theme?: ThemeType }>`
  text-decoration: none;
  color: inherit;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  position: relative;
  transition: color 0.3s;
  font-family: "Comfortaa", sans-serif;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 2px;
    background-color: ${(props) => props.theme.colors.primary};
    transition: width 0.3s ease-in-out;
  }
  &:hover::after,
  &.active::after {
    width: 100%;
  }
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
  &.active {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const StyledLink = styled.a<{ theme?: ThemeType }>`
  text-decoration: none;
  color: inherit;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  transition: color 0.3s;
  font-family: "Comfortaa", sans-serif;
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
  &.active {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const CtaButton = styled.button`
  display: none;
  padding: 10px 22px;
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

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;
