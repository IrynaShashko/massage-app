import { FC, useEffect, useState } from "react";

import { Link, NavLink, useLocation } from "react-router-dom";

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import logo from "../../images/logo.png";

import { ConnectionButtons, IconStyled } from "../ConnectionButton";
import { LanguageButton } from "../LanguageButton";
import { ThemeButton } from "../ThemeButton";

import { ReactComponent as CloseIcon } from "../../icons/close.svg";
import { ReactComponent as MenuIcon } from "../../icons/menu.svg";

import { ThemeType } from "../../theme/theme";

import { LogOut } from "lucide-react";
import { handleLogout } from "../../auth";
import { MenuPropsType } from "./types";

export const Menu: FC<MenuPropsType> = ({
  languageToggle,
  language,
  darkMode,
  themeToggle,
  isAuthenticated,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme() as ThemeType;
  const [t] = useTranslation();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [isMenuOpen]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeMenu();
    }
  };

  return (
    <>
      <MobileHeaderContainer>
        <Link to={"/"}>
          <Logo src={logo} alt="logo" />
        </Link>
        <ModalButtonContainer>
          <ButtonContainer>
            <LanguageButton
              languageToggle={languageToggle}
              language={language}
            />
            <ThemeButton darkMode={darkMode} themeToggle={themeToggle} />
            {isAuthenticated && (
              <button onClick={handleLogout}>
                <LogOut
                  color={darkMode ? "rgb(195, 193, 193)" : "rgb(55, 61, 70)"}
                  size={24}
                  style={{ marginRight: "8px" }}
                />
              </button>
            )}
          </ButtonContainer>
          <ModalButton onClick={toggleMenu}>
            <IconStyled as={MenuIcon} color={"#007586"} />
          </ModalButton>
        </ModalButtonContainer>
      </MobileHeaderContainer>
      {isMenuOpen && (
        <>
          <Backdrop isOpen={isMenuOpen} onClick={handleBackdropClick} />
          <NavLinkContainer isOpen={isMenuOpen}>
            <ModalContainer>
              <Link to={"/"}>
                <Logo src={logo} alt="logo" />
              </Link>
              <ModalButtonContainer>
                <ButtonContainer>
                  <LanguageButton
                    languageToggle={languageToggle}
                    language={language}
                  />
                  <ThemeButton darkMode={darkMode} themeToggle={themeToggle} />
                </ButtonContainer>
                <ModalButton onClick={toggleMenu}>
                  {isMenuOpen ? (
                    <IconStyled as={CloseIcon} color={"#007586"} />
                  ) : (
                    <IconStyled as={MenuIcon} color={"#007586"} />
                  )}
                </ModalButton>
              </ModalButtonContainer>
            </ModalContainer>

            <LinkContainer>
              <NavLinks to={"/"} onClick={closeMenu}>
                {t("home_button")}
              </NavLinks>
              <NavLinks to={"/about"} onClick={closeMenu}>
                {t("about_button")}
              </NavLinks>
              <NavLinks to={"/article"} onClick={closeMenu}>
                {t("article_button")}
              </NavLinks>
              <NavLinks to={"/reviews"} onClick={closeMenu}>
                {t("reviews_button")}
              </NavLinks>
              <NavLinks to={"/price"} onClick={closeMenu}>
                {t("price_button")}
              </NavLinks>
              <ContactTitle>{`${t("contacts_button")} :`}</ContactTitle>
              <ConnectionButtonContainer>
                <ConnectionButtons
                  background={theme.colors.text}
                  color={theme.colors.modalIconColor}
                />
              </ConnectionButtonContainer>
            </LinkContainer>
          </NavLinkContainer>
        </>
      )}
    </>
  );
};

const MobileHeaderContainer = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ModalContainer = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  box-shadow: 0 4px 8px ${(props) => props.theme.colors.boxShadow};
  padding: 20px;
`;

const NavLinkContainer = styled.div<{ isOpen: boolean; theme?: ThemeType }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  transform: ${({ isOpen }) => (isOpen ? "translateX(0)" : "translateX(100%)")};
  transition:
    transform 0.4s ease,
    opacity 0.4s ease,
    box-shadow 0.4s ease,
    pointer-events 0.4s ease;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  box-shadow: ${({ isOpen }) =>
    isOpen ? "2px 0px 10px rgba(0, 0, 0, 0.2)" : "none"};
  z-index: ${({ isOpen }) => (isOpen ? 1000 : -1)};
  pointer-events: ${({ isOpen }) => (isOpen ? "auto" : "none")};
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const Backdrop = styled.div<{ isOpen: boolean }>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ isOpen }) => (isOpen ? 999 : -1)};
  opacity: 0;
  transition: opacity 0.4s ease;
  ${({ isOpen }) => isOpen && "opacity: 1;"}
  pointer-events: ${({ isOpen }) => (isOpen ? "auto" : "none")};
`;

const Logo = styled.img`
  width: 120px;
  height: 100%;
  cursor: pointer;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const ModalButton = styled.button`
  border: none;
  background-color: transparent;
  @media screen and (min-width: 1055px) {
    display: none;
  }
`;

const NavLinks = styled(NavLink)<{ theme?: ThemeType }>`
  position: relative;
  color: ${(props) => props.theme.colors.text};
  text-decoration: none;
  font-size: 20px;
  font-weight: 500;
  padding: 8px 12px;
  transition: color 0.3s ease-in-out;
  text-align: center;
  &.active {
    color: ${(props) => props.theme.colors.primary};
    font-weight: 600;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const ContactTitle = styled.p<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.text};
  font-size: 24px;
  font-weight: 850;
  padding: 10px 12px;

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 20px 0;
  }
`;

export const ConnectionButtonContainer = styled.div`
  max-width: 260px;
  margin-inline: auto;
  @media (min-width: 580px) {
    max-width: 500px;
  }
`;
