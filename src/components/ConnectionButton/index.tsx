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

import { iconTile } from "../../theme/surfaces";
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
                <InfoTitle>{t("address_title")}</InfoTitle>
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
                <InfoTitle>{t("phone_title")}</InfoTitle>
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
                <InfoTitle>{t("instagram_title")}</InfoTitle>
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
                <InfoTitle>{t("telegram_title")}</InfoTitle>
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
                <InfoTitle>{t("viber_title")}</InfoTitle>
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
                <InfoTitle>{t("whatsapp_title")}</InfoTitle>
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
  ${iconTile(52)}

  /* Same rounded-square tile as the feature cards; the icon follows the tile colour */
  svg {
    width: 26px;
    height: 26px;
    fill: currentColor;
  }
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
    gap: var(--space-4);
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
  gap: var(--space-4);
  justify-content: ${(props) => (props.menu ? "center" : "flex-start")};
  text-decoration: none;
  cursor: pointer;

  /* Fill the tile and turn the icon white; set both explicitly so no
     inherited fill or gradient can leave a dark icon on the teal tile */
  &:hover > div:first-of-type {
    background: var(--color-primary);
    color: #fff;
  }

  &:hover > div:first-of-type svg,
  &:hover > div:first-of-type svg * {
    fill: #fff;
  }
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const InfoTitle = styled.h3<{ theme?: ThemeType }>`
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.65;
`;

const InfoDescription = styled.p<{ theme?: ThemeType }>`
  font-size: var(--text-base);
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  overflow-wrap: anywhere;
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
