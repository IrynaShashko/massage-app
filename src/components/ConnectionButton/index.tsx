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
  menu,
}) => {
  const [t] = useTranslation();

  return (
    <ConnectionButtonContainer>
      <InfoList menu={menu}>
        <InfoItem>
          <InfoLink
            aria-label="Location"
            href="https://goo.gl/maps/o3qvsXRkfv8h3hdw5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ButtonsItem iconColor={background} color={color}>
              <IconStyled as={Location} color={color} />
            </ButtonsItem>
            {!menu && (
              <InfoText>
                <InfoTitle>Address</InfoTitle>
                <InfoDescription>{t("address")}</InfoDescription>
              </InfoText>
            )}
          </InfoLink>
        </InfoItem>

        <InfoItem>
          <InfoLink aria-label="Phone number" href="tel:+380936193616">
            <ButtonsItem iconColor={background} color={color}>
              <IconStyled as={Phone} color={color} />
            </ButtonsItem>
            {!menu && (
              <InfoText>
                <InfoTitle>Phone</InfoTitle>
                <InfoDescription>+38 093 619 36 16</InfoDescription>
              </InfoText>
            )}
          </InfoLink>
        </InfoItem>

        <InfoItem>
          <InfoLink
            aria-label="Open instagram"
            href="https://instagram.com/maria.glushenko?igshid=MzRlODBiNWFlZA=="
            target="_blank"
            rel="noopener noreferrer"
          >
            <ButtonsItem iconColor={background} color={color}>
              <IconStyled as={Instagram} color={color} />
            </ButtonsItem>
            {!menu && (
              <InfoText>
                <InfoTitle>Instagram</InfoTitle>
                <InfoDescription>@mariia.hlushenko</InfoDescription>
              </InfoText>
            )}
          </InfoLink>
        </InfoItem>

        <InfoItem>
          <InfoLink
            aria-label="Open telegram"
            href="https://t.me/MashaHlushenko"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ButtonsItem iconColor={background} color={color}>
              <IconStyled as={Telegram} color={color} />
            </ButtonsItem>
            {!menu && (
              <InfoText>
                <InfoTitle>Telegram</InfoTitle>
                <InfoDescription>@MashaHlushenko</InfoDescription>
              </InfoText>
            )}
          </InfoLink>
        </InfoItem>

        <InfoItem>
          <InfoLink
            aria-label="Open viber"
            href="viber://chat?number=+380936193616"
          >
            <ButtonsItem iconColor={background} color={color}>
              <IconStyled as={Viber} color={color} />
            </ButtonsItem>
            {!menu && (
              <InfoText>
                <InfoTitle>Viber</InfoTitle>
                <InfoDescription>+38 093 619 36 16</InfoDescription>
              </InfoText>
            )}
          </InfoLink>
        </InfoItem>

        <InfoItem>
          <InfoLink
            aria-label="Open whatsapp"
            href="https://api.whatsapp.com/send?phone=380936193616"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ButtonsItem iconColor={background} color={color}>
              <IconStyled as={Whatsapp} color={color} />
            </ButtonsItem>
            {!menu && (
              <InfoText>
                <InfoTitle>WhatsApp</InfoTitle>
                <InfoDescription>+38 093 619 36 16</InfoDescription>
              </InfoText>
            )}
          </InfoLink>
        </InfoItem>
      </InfoList>
    </ConnectionButtonContainer>
  );
};

const ButtonsItem = styled.div<{
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
  transition: all 0.3s ease;
`;

const InfoList = styled.ul<{ menu?: boolean }>`
  display: ${(props) => (props.menu ? "grid" : "flex")};

  ${(props) =>
    props.menu
      ? `
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    justify-items: center;
  `
      : `
    flex-direction: column;
    gap: 1rem;
  `}

  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li<{ menu?: boolean }>`
  ${(props) =>
    props.menu &&
    `
      width: calc(50% - 0.5rem);
      display: flex;
      justify-content: center;
    `}
`;

const InfoLink = styled.a<{ menu?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.menu ? "center" : "flex-start")};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    transition: all 0.4s ease;
  }
`;

const InfoText = styled.div`
  margin-left: 16px;
`;

const InfoTitle = styled.h3<{ theme?: ThemeType }>`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${(props) => props.theme.colors.text};
`;

const InfoDescription = styled.p<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.text};
  line-height: 1.6;
`;

export const IconStyled = styled.svg<{ theme?: ThemeType; color?: string }>`
  width: 35px;
  height: 35px;
  transition: fill 0.3s ease-in-out;
  fill: ${(props) =>
    props.color ? props.color : props.theme.colors.iconColor};
  &:hover & {
    fill: ${(props) => props.theme.colors.text};
  }
`;

export const IconLocation = styled(IconStyled)`
  width: 20px;
  height: 20px;
`;
