import React, { useEffect } from "react";

import { Link, NavLink, useLocation } from "react-router-dom";

import { LogOut, UserRound } from "lucide-react";

import styled from "styled-components";

import { useTranslation } from "react-i18next";

import logo from "../../images/logo.png";

import { Container } from "../../App";
import { LanguageButton } from "../LanguageButton";
import { Menu } from "../Menu";
import { ThemeButton } from "../ThemeButton";

import { useLogout, useProfile } from "../../hooks/useAuth";

import { ThemeType } from "../../theme/theme";
import { HeaderPropsType } from "./types";

export const Header: React.FC<HeaderPropsType> = ({
  themeToggle,
  languageToggle,
  language,
  darkMode,
}) => {
  const [t] = useTranslation();

  const location = useLocation();

  const { data: user } = useProfile();

  const logoutMutation = useLogout();

  const isAuthenticated = !!user;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
    <HeaderContainer $darkMode={darkMode}>
      <Container>
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
              <LogoutButton onClick={onLogout}>
                <LogOut
                  color={darkMode ? "#F6F1EA" : "rgb(55, 61, 70)"}
                  size={30}
                />
              </LogoutButton>
            ) : (
              <StyledUserLink to="/auth">
                <UserRound
                  color={darkMode ? "#F6F1EA" : "rgb(55, 61, 70)"}
                  size={30}
                />
              </StyledUserLink>
            )}
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
      </Container>
    </HeaderContainer>
  );
};

const LogoutButton = styled.button`
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
  theme?: ThemeType;
}>`
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 80px;
  background: ${(props) => props.theme.colors.headerBg};
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  z-index: 1000;
  box-shadow: 0 4px 8px ${(props) => props.theme.colors.boxShadow};
  transition:
    background 0.6s ease,
    backdrop-filter 0.6s ease,
    box-shadow 0.6s ease;
`;

const Wrapper = styled.nav`
  display: none;
  @media screen and (min-width: 1055px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const MenuWrapper = styled.div`
  display: block;
  position: relative;
  @media screen and (min-width: 1055px) {
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
  gap: 20px;
  justify-content: center;
  flex-grow: 1;
`;

const StyledUserLink = styled(Link)`
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
  font-size: 18px;
  font-weight: bold;
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
  font-size: 18px;
  font-weight: bold;
  transition: color 0.3s;
  font-family: "Comfortaa", sans-serif;
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
  &.active {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;
