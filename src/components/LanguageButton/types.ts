import { PropsWithChildren } from "react";

export interface LanguageButtonPropsType extends PropsWithChildren {
  language: string;
  languageToggle: () => void;
}
