import { FC } from "react";
import styled from "styled-components";
import { ReactComponent as MoonIcon } from "../../icons/moon.svg";
import { ReactComponent as SunIcon } from "../../icons/sun.svg";
import { ThemeButtonPropsType } from "./types";

export const ThemeButton: FC<ThemeButtonPropsType> = ({
  darkMode,
  themeToggle,
}) => {
  const Icon = darkMode ? SunIcon : MoonIcon;

  return (
    <Button onClick={themeToggle}>
      <IconStyled as={Icon} />
    </Button>
  );
};

const Button = styled.button`
  align-self: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const IconStyled = styled.svg`
  width: 25px;
  height: 25px;
  transition: fill 0.3s ease-in-out;
  fill: ${(props) => props.theme.colors.text};
  /* Зміна кольору іконки при ховері */
  ${Button}:hover & {
    fill: ${(props) => props.theme.colors.primary}; /* колір на ховер */
  }
`;
