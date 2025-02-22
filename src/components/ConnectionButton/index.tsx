import { FC } from "react";

import styled from "@emotion/styled";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

import { ReactComponent as Instagram } from "../../icons/instagram.svg";
import { ReactComponent as Location } from "../../icons/location.svg";
import { ReactComponent as Phone } from "../../icons/phone.svg";
import { ReactComponent as Telegram } from "../../icons/telegram.svg";
import { ReactComponent as Viber } from "../../icons/viber.svg";
import { ReactComponent as Whatsapp } from "../../icons/whatsapp.svg";

import { ConnectionButtonContainer } from "../Menu";

import { ThemeType } from "../../theme/theme";

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
            <IconStyled as={Instagram} color={color} />
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
            <IconStyled as={Location} color={color} />
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
            <IconStyled as={Telegram} color={color} />
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
            <IconStyled as={Whatsapp} color={color} />
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
            <IconStyled as={Viber} color={color} />
          </Buttons>
        </ButtonsItem>
        <ButtonsItem
          variants={animationElement}
          custom={7}
          iconColor={background}
          color={color}
        >
          <Buttons aria-label="Phone number" onClick={makeCall}>
            <IconStyled as={Phone} color={color} />
          </Buttons>
        </ButtonsItem>
      </ButtonContainer>
      <ContactsLinkContainer>
        <ContactsLink style={{ color: `${background}` }}>
          <IconLocation as={Location} color={color} />
          <AddressText color={color}>{t("address")}</AddressText>
        </ContactsLink>
      </ContactsLinkContainer>
    </ConnectionButtonContainer>
  );
};

const ContactsLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
`;

const ContactsLink = styled.div`
  text-decoration: none;
  color: #f7f7f7;
  font-size: 18px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: baseline;
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

const ButtonsItem = styled(motion.li)<{
  iconColor: string;
  color: string;
  theme?: ThemeType;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(iconColor) => `${iconColor}`};
  height: 60px;
  width: 60px;
  padding: 12px;
  border-radius: 50%;
  border: 2px solid
    ${(props) => (props.color ? props.color : props.theme.colors.iconColor)};
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

const AddressText = styled.p<{ theme?: ThemeType; color: string }>`
  color: ${(props) =>
    props.color ? props.color : props.theme.colors.iconColor};
`;

export const IconStyled = styled.svg<{ theme?: ThemeType; color?: string }>`
  width: 35px;
  height: 35px;
  transition: fill 0.3s ease-in-out;
  fill: ${(props) =>
    props.color ? props.color : props.theme.colors.iconColor};
  &:hover & {
    fill: ${(props) => props.theme.colors.primary};
  }
`;

export const IconLocation = styled(IconStyled)`
  width: 20px;
  height: 20px;
`;
