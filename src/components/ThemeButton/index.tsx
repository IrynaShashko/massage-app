import { FC } from "react";
import styled from "@emotion/styled";
import { ReactComponent as MoonIcon } from "../../icons/moon.svg";
import { ReactComponent as SunIcon } from "../../icons/sun.svg";
import { ThemeButtonPropsType } from "./types";

export const ThemeButton: FC<ThemeButtonPropsType> = ({
  darkMode,
  themeToggle,
}) => {
  const Icon = darkMode ? SunIcon : MoonIcon;

  return (
    <Button
      type="button"
      onClick={themeToggle}
      aria-label={darkMode ? "Light theme" : "Dark theme"}
    >
      <IconStyled as={Icon} />
    </Button>
  );
};

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;
  transition: color 0.3s ease-in-out;

  &:hover svg {
    fill: ${(props) => props.theme.colors.primary};
  }
`;

export const IconStyled = styled.svg`
  width: 28px;
  height: 28px;
  transition: fill 0.3s ease-in-out;
  fill: ${(props) => props.theme.colors.buttonBg};
`;
