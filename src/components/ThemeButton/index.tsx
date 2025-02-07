import { FC } from "react";

import styled from "styled-components";

import { FaMoon, FaSun } from "react-icons/fa";

import { ThemeButtonPropsType } from "./types";

export const ThemeButton: FC<ThemeButtonPropsType> = ({
  darkMode,
  themeToggle,
}) => {
  const icon = darkMode ? <FaSun /> : <FaMoon />;

  return <Button onClick={themeToggle}>{icon}</Button>;
};

const Button = styled.button`
  align-self: center;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  display: flex;
  font-size: 24px;
  justify-content: center;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;
