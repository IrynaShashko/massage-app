import React, { useEffect, useState } from "react";

import styled, { ThemeProvider } from "styled-components";

import { useTranslation } from "react-i18next";
import "./i18n";

import GlobalStyle from "./theme/GlobalStyle";
import { darkTheme, lightTheme } from "./theme/theme";

import { LanguageButton } from "./components/LanguageButton";
import { ThemeButton } from "./components/ThemeButton";

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "ua";
  });

  const [t, i18n] = useTranslation();

  const ThemeToggle = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const LanguageToggle = () => {
    const newLanguage = language === "ua" ? "en" : "ua";
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Container>
        <ThemeButton darkMode={isDarkMode} themeToggle={ThemeToggle} />
        <LanguageButton languageToggle={LanguageToggle} language={language} />
        <h1>{t("hello")}</h1>
      </Container>
    </ThemeProvider>
  );
};

export default App;

const Container = styled.div`
  padding: 50px;
  text-align: center;
`;
