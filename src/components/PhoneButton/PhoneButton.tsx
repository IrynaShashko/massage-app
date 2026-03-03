import { useState } from "react";

import styled, { css, keyframes } from "styled-components";

import { ReactComponent as Phone } from "../../icons/phone.svg";
import { ReactComponent as Telegram } from "../../icons/telegram.svg";
import { ReactComponent as Viber } from "../../icons/viber.svg";
import { ReactComponent as Whatsapp } from "../../icons/whatsapp.svg";

import { IconStyled } from "../ConnectionButton";

const waterRipple = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translate(200px, 0px);
  }
  to {
    opacity: 1;
    transform: translate(0px, 0px);
  }
`;

const PhoneContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 50;

  @media screen and (min-width: 768px) {
    bottom: 30px;
    right: 30px;
  }
  @media screen and (min-width: 1440px) {
    bottom: 70px;
    right: 70px;
  }
`;

const RippleWrapper = styled.div<{ $active: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #007586;
    opacity: 0;
    z-index: -1;
    animation: ${({ $active }) =>
      $active
        ? "none"
        : css`
            ${waterRipple} 2.5s infinite
          `};
  }

  &::after {
    animation-delay: 1.25s;
  }
`;

const MainButton = styled.button`
  position: relative;
  z-index: 2;
  padding: 16px 18px;
  border-radius: 50%;
  background-color: #007586;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #015b69;
    transform: scale(1.05);
  }

  svg {
    width: 24px;
    height: 24px;
    color: white;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`;

const ButtonContainer = styled.div<{ $animationShow: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  pointer-events: ${({ $animationShow }) => ($animationShow ? "all" : "none")};

  button {
    opacity: 0;
    animation: ${({ $animationShow }) =>
      $animationShow
        ? css`
            ${slideInFromRight} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards
          `
        : "none"};
  }

  button:nth-of-type(4) {
    animation-delay: 0.6s;
  }

  button:nth-of-type(3) {
    animation-delay: 0.8s;
  }

  button:nth-of-type(2) {
    animation-delay: 1s;
  }

  button:nth-of-type(1) {
    animation-delay: 1.2s;
  }
`;

const ContactButton = styled.button`
  padding: 12px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #007586;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #01606e;
    transform: scale(1.1);
  }
`;

export const PhoneButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleButtons = () => {
    setIsExpanded(!isExpanded);
  };

  const contactButtons = [
    { icon: Phone, onClick: () => window.open("tel:+380936193616") },
    {
      icon: Telegram,
      onClick: () => window.open("https://t.me/MashaHlushenko"),
    },
    {
      icon: Whatsapp,
      onClick: () =>
        window.open("https://api.whatsapp.com/send?phone=380936193616"),
    },
    {
      icon: Viber,
      onClick: () => window.open("viber://chat?number=+380936193616"),
    },
  ];

  return (
    <PhoneContainer>
      <ButtonContainer $animationShow={isExpanded}>
        {contactButtons.map((button, index) => (
          <ContactButton key={index} onClick={button.onClick}>
            <IconStyled as={button.icon} color={"#fff"} />
          </ContactButton>
        ))}
      </ButtonContainer>

      <RippleWrapper $active={isExpanded}>
        <MainButton type="button" onClick={toggleButtons}>
          <IconStyled
            as={Phone}
            color={"#fff"}
            style={{
              transform: isExpanded ? "rotate(-45deg)" : "rotate(0deg)",
            }}
          />
        </MainButton>
      </RippleWrapper>
    </PhoneContainer>
  );
};
