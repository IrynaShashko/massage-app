import { User } from "../../hooks/useAuth";

export interface MenuPropsType {
  darkMode: boolean;
  isAuthenticated: boolean;
  language: string;
  languageToggle: () => void;
  themeToggle: () => void;
  user: User | null;
}
