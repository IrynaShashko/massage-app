import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { FC, lazy, Suspense, useEffect, useState } from "react";
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

import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Loader } from "./components/Loader";
import { ModalProvider } from "./context/ModalContext";
import { ScrollToTop } from "./utils/ScrollToTop";

const queryClient = new QueryClient();
export const App: FC = () => {
  const AboutPage = lazy(() => import("./pages/AboutPage"));
  const HomePage = lazy(() => import("./pages/HomePage"));
  const PricePage = lazy(() => import("./pages/PricePage"));
  const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
  const ArticlePage = lazy(() => import("./pages/ArticlePage"));
  const Questions = lazy(() => import("./components/Questions"));
  const Health = lazy(() => import("./components/Health"));
  const Expectation = lazy(() => import("./components/Expectation"));
  const AuthPage = lazy(() => import("./pages/AuthPage"));
  const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <EmotionThemeProvider theme={theme}>
          <GlobalStyle />
          <ContentContainer>
            <Router>
              <ScrollToTop />
              <ModalProvider>
                <Header
                  themeToggle={ThemeToggle}
                  languageToggle={LanguageToggle}
                  language={language}
                  darkMode={isDarkMode}
                />
                <main>
                  <Suspense fallback={<Loader />}>
                    <Routes>
                      <Route
                        path="/"
                        element={<HomePage language={language} />}
                      />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route
                        path="/api/auth/verify-email/:token"
                        element={<VerifyEmailPage />}
                      />
                      <Route
                        path="/about"
                        element={<AboutPage language={language} />}
                      />
                      <Route
                        path="/price"
                        element={<PricePage language={language} />}
                      />
                      <Route
                        path="/reviews"
                        element={<ReviewsPage language={language} />}
                      />
                      <Route
                        path="/article/*"
                        element={<ArticlePage language={language} />}
                      >
                        <Route
                          index
                          element={<Navigate to="questions" replace />}
                        />
                        <Route
                          path="questions"
                          element={<Questions language={language} />}
                        />
                        <Route
                          path="health"
                          element={<Health language={language} />}
                        />
                        <Route
                          path="expectation"
                          element={<Expectation language={language} />}
                        />
                      </Route>
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </ModalProvider>
            </Router>
          </ContentContainer>
        </EmotionThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export const Container = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 3;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* min-height: 100vh; */
  padding-top: 80px;

  main {
    flex: 1;
  }
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  @media screen and (min-width: 900px) {
    padding: 80px 40px;
  }
`;
