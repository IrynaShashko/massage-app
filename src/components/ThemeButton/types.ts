import { PropsWithChildren } from "react";

export interface ThemeButtonPropsType extends PropsWithChildren {
  darkMode: boolean;
  themeToggle: () => void;
  /** Icon size in px */
  size?: number;
}
