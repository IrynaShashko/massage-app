import { FC, useCallback, useEffect } from "react";

import styled from "@emotion/styled";

import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";

import { IconContext } from "react-icons";
import { FiX } from "react-icons/fi";

import logo from "../../images/logo.png";

import { ConnectionButtons } from "../ConnectionButton";

import { ThemeType } from "../../theme/theme";

import { ModalContentProps, ModalPropsType } from "./types";

export const Modal: FC<ModalPropsType> = ({ onClose, children }) => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const onCloseModal = () => {
  //   setIsModalOpen(false);
  // };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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

  const ModalContent: FC<ModalContentProps> = ({ children }) => (
    <StyledModalContent>{children}</StyledModalContent>
  );

  return createPortal(
    <>
      <ModalBackdrop onClick={handleBackdropClick}>
        <ModalContent>
          <Container>
            <ModalHeader>
              <Link to={"/"}>
                <img src={logo} width={120} alt="logo" />
              </Link>
              <ModalButton type="button" onClick={onClose}>
                <IconContext.Provider
                  value={{
                    size: "30px",
                    color: "#007586",
                  }}
                >
                  <FiX />
                </IconContext.Provider>
              </ModalButton>
            </ModalHeader>
            <ConnectionButtons background={"#007586"} color={"#f1f1f1"} />
            <ModalList>
              <ModalTitle onClick={onClose}>
                <NavLinkStyled to={"/"}>Головна</NavLinkStyled>
              </ModalTitle>
              <ModalTitle onClick={onClose}>
                <NavLinkStyled to={"/about"}>Давайте знайомитись</NavLinkStyled>
              </ModalTitle>
              <ModalTitle onClick={onClose}>
                <NavLinkStyled to={"/article"}>Статті</NavLinkStyled>
              </ModalTitle>
              <ModalTitle onClick={onClose}>
                <NavLinkStyled to={"/reviews"}>Відгуки</NavLinkStyled>
              </ModalTitle>
              <ModalTitle onClick={onClose}>
                <NavLinkStyled to={"/price"}>Ціни</NavLinkStyled>
              </ModalTitle>
            </ModalList>
            <ModalSubmitBtn
              type="button" /* onClick={() => setIsModalOpen(true)} */
            >
              Записатись
            </ModalSubmitBtn>
          </Container>
        </ModalContent>
      </ModalBackdrop>
    </>,
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
  transition: opacity 0.3s ease;
  width: 100vw;
  z-index: 10000;
`;

const StyledModalContent = styled.div<{ theme?: ThemeType }>`
  position: absolute;
  padding: 40px;
  background-color: ${(props) => props.theme.colors.background};
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
`;

export const ModalContent = styled.div<{ theme?: ThemeType }>`
  animation: fadeIn 0.5s ease-out;
  background-color: ${(props) => props.theme.colors.background};
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  height: auto;
  margin: 0;
  max-width: 600px;
  overflow: hidden;
  padding: 40px;
  position: absolute;
  width: 90%;

  @media screen and (min-width: 768px) {
    height: auto;
    width: 500px;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ModalHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 20px;
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

export const ModalList = styled.ul`
  color: #333;
  display: flex;
  flex-direction: column;
  font-size: 22px;
  font-weight: 500;
  gap: 15px;
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
`;

const ModalTitle = styled.li`
  padding: 10px 0;
  transition:
    color 0.3s ease,
    transform 0.3s ease;
  font-size: 18px;

  &:hover {
    color: #007586;
    transform: translateX(10px);
  }
`;

export const ModalSubmitBtn = styled.button`
  background-color: #007586;
  border-radius: 25px;
  border: none;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  padding: 12px 24px;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;

  &:hover {
    background-color: #005f70;
    transform: scale(1.05);
  }
`;

const NavLinkStyled = styled(NavLink)`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: #007586;
  }
`;
