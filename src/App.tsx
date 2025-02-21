import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { FC, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import i18n from "./i18n";

import GlobalStyle from "./theme/GlobalStyle";
import { darkTheme, lightTheme } from "./theme/theme";

import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { PricePage } from "./pages/PricePage";

import { Expectation } from "./components/Expectation";
import { Header } from "./components/Header";
import { Health } from "./components/Health";
import { Questions } from "./components/Questions";
import { ArticlePage } from "./pages/ArticlePage";
import { ReviewsPage } from "./pages/ReviewsPage";

export const App: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "ua",
  );

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const ThemeToggle = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const LanguageToggle = () => {
    if (i18n) {
      const newLanguage = language === "ua" ? "en" : "ua";
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
      localStorage.setItem("language", newLanguage);
    } else {
      console.error("i18n is not initialized yet");
    }
  };
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <EmotionThemeProvider theme={theme}>
        <GlobalStyle />
        <ContentContainer>
          <Router>
            <Header
              themeToggle={ThemeToggle}
              languageToggle={LanguageToggle}
              language={language}
              darkMode={isDarkMode}
            />
            <Routes>
              <Route path="/" element={<HomePage language={language} />} />
              <Route
                path="/about"
                element={<AboutPage language={language} />}
              />
              <Route
                path="/price"
                element={<PricePage language={language} />}
              />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/article/*" element={<ArticlePage />}>
                <Route index element={<Navigate to="questions" replace />} />
                <Route path="questions" element={<Questions />} />
                <Route path="health" element={<Health />} />
                <Route path="expectation" element={<Expectation />} />
              </Route>
            </Routes>
          </Router>
        </ContentContainer>
      </EmotionThemeProvider>
    </ThemeProvider>
  );
};

export const Container = styled.div`
  max-width: 1680px;
  margin: 0 auto;
  z-index: 3;
`;

const ContentContainer = styled.div`
  padding-top: 80px;
`;
