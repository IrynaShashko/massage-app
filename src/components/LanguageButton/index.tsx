import { FC } from "react";

import styled from "styled-components";

import { LanguageButtonPropsType } from "./types";
import { ThemeType } from "../../theme/theme";

export const LanguageButton: FC<LanguageButtonPropsType> = ({
  language,
  languageToggle,
}) => {
  return (
    <Button type="button" onClick={languageToggle}>
      {language === "ua" ? "en" : "ua"}
    </Button>
  );
};
const Button = styled.button<{ theme?: ThemeType }>`
  aspect-ratio: 1;
  background-color: ${(props) => props.theme.colors.buttonBg};
  border-radius: 30px;
  border: none;
  color: ${(props) => props.theme.colors.langIconColor};
  cursor: pointer;
  font-size: 14px;
  height: 30px;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: #f6f1ea;
  }
`;
