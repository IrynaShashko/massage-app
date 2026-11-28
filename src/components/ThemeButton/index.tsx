import { FC } from "react";

import styled from "@emotion/styled";
import { Moon, Sun } from "lucide-react";

import { ThemeType } from "../../theme/theme";

import { ThemeButtonPropsType } from "./types";

/**
 * Light/dark toggle. Uses the same line icons (lucide) as the rest of the header,
 * so stroke weight and size match the menu and profile icons.
 * Both icons are stacked and swap with a short rotate + fade.
 */
export const ThemeButton: FC<ThemeButtonPropsType> = ({
  darkMode,
  themeToggle,
  size = 24,
}) => (
  <Button
    type="button"
    onClick={themeToggle}
    aria-label={darkMode ? "Light theme" : "Dark theme"}
    $size={size}
  >
    <IconSlot $visible={!darkMode} $turn={-90}>
      <Moon size={size} aria-hidden />
    </IconSlot>
    <IconSlot $visible={darkMode} $turn={90}>
      <Sun size={size} aria-hidden />
    </IconSlot>
  </Button>
);

const Button = styled.button<{ $size: number; theme?: ThemeType }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${(props) => props.$size}px;
  min-height: ${(props) => props.$size}px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.colors.text};
  transition: color 0.25s ease;

  @media (hover: hover) {
    &:hover {
      color: var(--color-primary);
    }
  }
`;

const IconSlot = styled.span<{ $visible: boolean; $turn: number }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: ${(props) =>
    props.$visible ? "none" : `rotate(${props.$turn}deg) scale(0.6)`};
  transition:
    opacity 0.25s ease,
    transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
`;
