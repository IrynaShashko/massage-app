import styled from "@emotion/styled";
import { FC, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { ReactComponent as CloseIcon } from "../../icons/close.svg";
import logo from "../../images/logo.png";
import { ThemeType } from "../../theme/theme";
import { IconStyled } from "../ConnectionButton";
import { ModalPropsType } from "./types";

export const Modal: FC<ModalPropsType> = ({ onClose }) => {
  const [t] = useTranslation();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.currentTarget === event.target) {
        onClose();
      }
    },
    [onClose],
  );

  const modalRoot = document.querySelector("#modal");
  if (!modalRoot) {
    throw new Error("Modal root element not found!");
  }

  return createPortal(
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContentContainer>
        <ModalHeader>
          <Link to={"/"} onClick={onClose}>
            <img src={logo} width={120} alt="logo" />
          </Link>
          <ModalButton
            type="button"
            onClick={onClose}
            aria-label={t("close_alt")}
          >
            <IconStyled as={CloseIcon} color={"#007586"} />
          </ModalButton>
        </ModalHeader>

        <ModalBody>
          <WelcomeText>{t("welcome_text")}</WelcomeText>
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <ModalSubmitBtn type="button" onClick={onClose}>
              {t("auth_action")}
            </ModalSubmitBtn>
          </Link>
        </ModalBody>
      </ModalContentContainer>
    </ModalBackdrop>,
    modalRoot,
  );
};

export const ModalBackdrop = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  height: 100vh;
  justify-content: center;
  position: fixed;
  right: 0;
  top: 0;
  width: 100vw;
  z-index: 10000;
`;

const ModalContentContainer = styled.div<{ theme?: ThemeType }>`
  background-color: ${(props) => props.theme.colors.aboutBg || "#fff"};
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  padding-bottom: 40px;
  position: relative;
  animation: fadeIn 0.4s ease-out;

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
`;

const WelcomeText = styled.p<{ theme?: ThemeType }>`
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 30px;
  color: ${(props) => props.theme.colors.text || "#333"};
  opacity: 0.9;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  width: 100%;
`;

export const ModalButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
  &:hover {
    transform: rotate(90deg);
  }
`;

export const ModalSubmitBtn = styled.button`
  background-color: #007586;
  border-radius: 25px;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  padding: 14px 32px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #005f70;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 117, 134, 0.3);
  }
`;
