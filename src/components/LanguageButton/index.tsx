import { FC } from "react";

import styled from "styled-components";

import { LanguageButtonPropsType } from "./types";

export const LanguageButton: FC<LanguageButtonPropsType> = ({
  language,
  languageToggle,
}) => {
  return (
    <Button onClick={languageToggle}>{language === "ua" ? "en" : "ua"}</Button>
  );
};
const Button = styled.button`
  aspect-ratio: 1;
  background-color: ${(props) => props.theme.colors.buttonBg};
  border-radius: 30px;
  border: none;
  color: ${(props) => props.theme.colors.buttonText};
  cursor: pointer;
  font-size: 14px;
  height: 30px;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;
