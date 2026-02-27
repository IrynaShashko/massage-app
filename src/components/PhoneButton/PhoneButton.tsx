import { useState } from "react";

import styled, { css, keyframes } from "styled-components";

import { IconStyled } from "../ConnectionButton";

import { ReactComponent as Phone } from "../../icons/phone.svg";
import { ReactComponent as Telegram } from "../../icons/telegram.svg";
import { ReactComponent as Viber } from "../../icons/viber.svg";
import { ReactComponent as Whatsapp } from "../../icons/whatsapp.svg";

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  20% {
    transform: scale(1.2) rotate(15deg);
    background-color: #01606e;
  }
  60% {
    transform: scale(1.2) rotate(-15deg);
    background-color: #01606e;
    box-shadow: 0px 0px 2px 1px rgba(255, 255, 255, 1);
  }
  80% {
    transform: scale(1.2) rotate(15deg);
    background-color: #01606e;
  }
  100% {
    transform: scale(1);
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

const MainButton = styled.button<{ $stopAnimation: boolean }>`
  padding: 16px 18px;
  font-size: 16px;
  animation: ${({ $stopAnimation }) =>
    $stopAnimation
      ? "none"
      : css`
          ${pulse} 2s infinite
        `};
  border-radius: 50px;
  background-color: #007586;
  border: 1px solid #fff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #015b69;
  }

  svg {
    width: 24px;
    height: 24px;
    color: white;
    transition: transform 0.3s ease;
  }
`;

const ButtonContainer = styled.div<{ $animationShow: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  button {
    opacity: 0;
    animation: ${({ $animationShow }) =>
      $animationShow
        ? css`
            ${slideInFromRight} 0.3s ease-out forwards
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
  padding: 12px 14px;
  border: none;
  border-radius: 50px;
  background-color: #007586;
  border: 1px solid #fff;
  cursor: pointer;
  transition: background-color 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
    color: white;
  }

  &:hover,
  &:focus {
    background-color: #01606e;
  }
`;

export const PhoneButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleButtons = () => {
    setIsExpanded(!isExpanded);
  };

  const contactButtons = [
    {
      icon: Phone,
      onClick: () => window.open("tel:+380936193616"),
    },
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
      <MainButton
        type="button"
        onClick={toggleButtons}
        $stopAnimation={isExpanded}
      >
        <IconStyled
          as={Phone}
          color={"#fff"}
          style={{
            transform: isExpanded ? "rotate(-45deg)" : "rotate(0deg)",
          }}
        />
      </MainButton>
    </PhoneContainer>
  );
};
