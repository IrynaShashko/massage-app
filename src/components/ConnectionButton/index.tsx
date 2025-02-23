import { FC } from "react";
import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

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

  function openTelegram() {
    window.open("https://t.me/MashaHlushenko", "_blank");
  }

  function openWhatsApp() {
    window.open("https://api.whatsapp.com/send?phone=380936193616", "_blank");
  }

  function openViber() {
    window.open("viber://chat?number=+380936193616", "_blank");
  }

  function openInstagram() {
    window.open(
      "https://instagram.com/maria.glushenko?igshid=MzRlODBiNWFlZA==",
      "_blank",
    );
  }

  function makeCall() {
    window.open("tel:+380936193616");
  }

  return (
    <ConnectionButtonContainer>
      <ButtonContainer>
        <ButtonsItem iconColor={background} color={color}>
          <Buttons
            aria-label="Open instagram"
            href="https://instagram.com/maria.glushenko?igshid=MzRlODBiNWFlZA=="
            onClick={openInstagram}
            target="_blank"
          >
            <IconStyled as={Instagram} color={color} />
          </Buttons>
        </ButtonsItem>
        <ButtonsItem iconColor={background} color={color}>
          <Buttons
            aria-label="Location"
            href="https://goo.gl/maps/o3qvsXRkfv8h3hdw5"
            target="_blank"
          >
            <IconStyled as={Location} color={color} />
          </Buttons>
        </ButtonsItem>
        <ButtonsItem iconColor={background} color={color}>
          <Buttons
            aria-label="Open telegram"
            href="https://t.me/MashaHlushenko"
            onClick={openTelegram}
            target="_blank"
          >
            <IconStyled as={Telegram} color={color} />
          </Buttons>
        </ButtonsItem>
        <ButtonsItem iconColor={background} color={color}>
          <Buttons
            aria-label="Open whatsapp"
            href="https://api.whatsapp.com/send?phone=380936193616"
            onClick={openWhatsApp}
            target="_blank"
          >
            <IconStyled as={Whatsapp} color={color} />
          </Buttons>
        </ButtonsItem>
        <ButtonsItem iconColor={background} color={color}>
          <Buttons
            aria-label="Open viber"
            href="viber://chat?number=+380936193616"
            onClick={openViber}
            target="_blank"
          >
            <IconStyled as={Viber} color={color} />
          </Buttons>
        </ButtonsItem>
        <ButtonsItem iconColor={background} color={color}>
          <Buttons aria-label="Phone number" onClick={makeCall}>
            <IconStyled as={Phone} color={color} />
          </Buttons>
        </ButtonsItem>
      </ButtonContainer>
      <ContactsLinkContainer>
        <AddressText color={color}>
          <IconLocation as={Location} color={color} />
          {t("address")}
        </AddressText>
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

const ButtonContainer = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 10px;
`;

const ButtonsItem = styled.li<{
  iconColor: string;
  color: string;
  theme?: ThemeType;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
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
  text-align: center;
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
