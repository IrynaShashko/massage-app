import { FC } from "react";

import styled from "@emotion/styled";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

import { IconContext } from "react-icons";
import { FaInstagram, FaViber, FaWhatsapp } from "react-icons/fa";
import { LiaTelegram } from "react-icons/lia";
import { LuPhone } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";

import { ConnectionButtonContainer } from "../Menu";

import { ConnectionButtonsPropsType } from "./types";

export const ConnectionButtons: FC<ConnectionButtonsPropsType> = ({
  background,
  color,
}) => {
  const [t] = useTranslation();
  const animationElement = {
    hidden: {
      y: -50,
      opacity: 0,
    },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 1, delay: custom * 0.3 },
    }),
  };

  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  function openTelegram() {
    window.open("https://t.me/MashaHlushenko");
  }

  function openWhatsApp() {
    window.open("https://api.whatsapp.com/send?phone=380936193616");
  }

  function openViber() {
    window.open("viber://chat?number=+380936193616");
  }

  function openInstagram() {
    window.open(
      "https://instagram.com/maria.glushenko?igshid=MzRlODBiNWFlZA==",
    );
  }

  function makeCall() {
    window.open("tel:+380936193616");
  }

  return (
    <ConnectionButtonContainer>
      <ButtonContainer
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={animationElement}
        ref={ref}
        custom={1}
      >
        <ButtonsItem
          variants={animationElement}
          custom={2}
          iconColor={background}
          color={color}
        >
          <Buttons
            aria-label="Open instagram"
            href="https://instagram.com/maria.glushenko?igshid=MzRlODBiNWFlZA=="
            onClick={openInstagram}
          >
            <IconContext.Provider
              value={{
                size: "28px",
                color: `${background}`,
              }}
            >
              <FaInstagram />
            </IconContext.Provider>
          </Buttons>
        </ButtonsItem>
        <ButtonsItem
          variants={animationElement}
          custom={3}
          iconColor={background}
          color={color}
        >
          <Buttons
            aria-label="Location"
            href="https://goo.gl/maps/o3qvsXRkfv8h3hdw5"
            target="_blank"
          >
            <IconContext.Provider
              value={{
                size: "30px",
                color: `${background}`,
              }}
            >
              <SlLocationPin />
            </IconContext.Provider>
          </Buttons>
        </ButtonsItem>
        <ButtonsItem
          variants={animationElement}
          custom={4}
          iconColor={background}
          color={color}
        >
          <Buttons
            aria-label="Open telegram"
            href="https://t.me/MashaHlushenko"
            onClick={openTelegram}
          >
            <IconContext.Provider
              value={{
                size: "32px",
                color: `${background}`,
              }}
            >
              <LiaTelegram />
            </IconContext.Provider>
          </Buttons>
        </ButtonsItem>
        <ButtonsItem
          variants={animationElement}
          custom={5}
          iconColor={background}
          color={color}
        >
          <Buttons
            aria-label="Open whatsapp"
            href="https://api.whatsapp.com/send?phone=380936193616"
            onClick={openWhatsApp}
          >
            <IconContext.Provider
              value={{
                size: "32px",
                color: `${background}`,
              }}
            >
              <FaWhatsapp />
            </IconContext.Provider>
          </Buttons>
        </ButtonsItem>
        <ButtonsItem
          variants={animationElement}
          custom={6}
          iconColor={background}
          color={color}
        >
          <Buttons
            aria-label="Open viber"
            href="viber://chat?number=+380936193616"
            onClick={openViber}
          >
            <IconContext.Provider
              value={{
                size: "28px",
                color: `${background}`,
              }}
            >
              <FaViber />
            </IconContext.Provider>
          </Buttons>
        </ButtonsItem>
        <ButtonsItem
          variants={animationElement}
          custom={7}
          iconColor={background}
          color={color}
        >
          <Buttons aria-label="Phone number" onClick={makeCall}>
            <IconContext.Provider
              value={{
                size: "25px",
                color: `${background}`,
              }}
            >
              <LuPhone />
            </IconContext.Provider>
          </Buttons>
        </ButtonsItem>
      </ButtonContainer>
      <ContactsLinkContainer>
        <ContactsLink style={{ color: `${background}` }}>
          <IconContext.Provider
            value={{
              size: "15px",
              color: `${background}`,
            }}
          >
            <SlLocationPin />
          </IconContext.Provider>
          <AddressText style={{ color: background }}>
            {t("address")}
          </AddressText>
        </ContactsLink>
      </ContactsLinkContainer>
    </ConnectionButtonContainer>
  );
};

const ContactsLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
`;

const ContactsLink = styled.p`
  text-decoration: none;
  color: #f7f7f7;
  font-size: 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: #f7f7f7;
  }
`;

const ButtonContainer = styled(motion.ul)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 10px;
`;

const ButtonsItem = styled(motion.li)<{ iconColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(iconColor) => `${iconColor}`};
  height: 60px;
  width: 60px;
  padding: 12px;
  border-radius: 50%;
  border: 2px solid #f7f7f7;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #015663;
    color: #f7f7f7;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const Buttons = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
`;

const AddressText = styled.p`
  color: #f7f7f7;
`;
