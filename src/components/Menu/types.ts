import { User } from "firebase/auth";

export interface MenuPropsType {
  darkMode: boolean;
  isAuthenticated: boolean;
  language: string;
  languageToggle: () => void;
  themeToggle: () => void;
  user: User | null;
}
