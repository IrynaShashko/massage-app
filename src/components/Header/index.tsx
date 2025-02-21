import React, { useEffect } from "react";

import { Link, NavLink, useLocation } from "react-router-dom";

import styled from "styled-components";

import { useTranslation } from "react-i18next";

import logo from "../../images/logo.png";

import { Container } from "../../App";
import { LanguageButton } from "../LanguageButton";
import { Menu } from "../Menu";
import { ThemeButton } from "../ThemeButton";

import { HeaderPropsType } from "./types";

export const Header: React.FC<HeaderPropsType> = ({
  themeToggle,
  languageToggle,
  language,
  darkMode,
}) => {
  const [t] = useTranslation();

  const location = useLocation();

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

  return (
    <HeaderContainer $darkMode={darkMode}>
      <Container>
        <Wrapper>
          <Logo to="/">
            <img src={logo} alt="Logo" />
          </Logo>
          <NavLinks>
            <StyledNavLink to="/" end>
              {t("home_button")}
            </StyledNavLink>
            <StyledNavLink to="/about">{t("about_button")}</StyledNavLink>
            <StyledNavLink to="/price">{t("price_button")}</StyledNavLink>
            <StyledNavLink to="/reviews">{t("reviews_button")}</StyledNavLink>
            <StyledNavLink to="/article">{t("article_button")}</StyledNavLink>
            <StyledLink href="/#contacts" onClick={handleScrollToContacts}>
              {t("contacts_button")}
            </StyledLink>
          </NavLinks>
          <ButtonContainer>
            <LanguageButton
              languageToggle={languageToggle}
              language={language}
            />
            <ThemeButton darkMode={darkMode} themeToggle={themeToggle} />
          </ButtonContainer>
        </Wrapper>
        <MenuWrapper>
          <Menu
            languageToggle={languageToggle}
            language={language}
            darkMode={darkMode}
            themeToggle={themeToggle}
          />
        </MenuWrapper>
      </Container>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header<{ $darkMode: boolean }>`
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 80px;
  background: ${(props) =>
    props.$darkMode ? "rgba(34, 40, 49, 0.8)" : "rgba(255, 255, 255, 0.8)"};
  backdrop-filter: blur(8px);
  z-index: 1000;
  box-shadow: 0 4px 8px ${(props) => props.theme.colors.boxShadow};
  transition:
    background 0.6s ease,
    backdrop-filter 0.6s ease,
    box-shadow 0.6s ease;
`;

const Wrapper = styled.div`
  display: none;
  @media screen and (min-width: 975px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const MenuWrapper = styled.div`
  display: block;
  position: relative;
  @media screen and (min-width: 975px) {
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

const NavLinks = styled.nav`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-grow: 1;
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: inherit;
  font-size: 18px;
  font-weight: bold;
  position: relative;
  transition: color 0.3s;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 1px;
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

const StyledLink = styled.a`
  text-decoration: none;
  color: inherit;
  font-size: 18px;
  font-weight: bold;
  transition: color 0.3s;

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
