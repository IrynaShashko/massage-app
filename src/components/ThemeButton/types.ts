import { PropsWithChildren } from "react";

export interface ThemeButtonPropsType extends PropsWithChildren {
  darkMode: boolean;
  themeToggle: () => void;
}
