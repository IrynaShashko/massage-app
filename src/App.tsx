import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";

import { FC, lazy, Suspense, useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import i18n from "./i18n";

import GlobalStyle from "./theme/GlobalStyle";
import { darkTheme, lightTheme } from "./theme/theme";

import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { PageSkeleton } from "./components/Skeleton";
import { PhoneButton } from "./components/PhoneButton/PhoneButton";

import {
  MOBILE_BAR_SPACE,
  MobileBookingBar,
} from "./components/MobileBookingBar";
import { BookingProvider } from "./context/BookingContext";
import { ModalProvider } from "./context/ModalContext";
import { useAuthListener } from "./hooks/useAuth";
import { ScrollToTop } from "./utils/ScrollToTop";

const queryClient = new QueryClient();

export const App: FC = () => {
  const AboutPage = lazy(() => import("./pages/AboutPage"));
  const HomePage = lazy(() => import("./pages/HomePage"));
  const PricePage = lazy(() => import("./pages/PricePage"));
  const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
  const ArticlePage = lazy(() => import("./pages/ArticlePage"));
  const AuthPage = lazy(() => import("./pages/AuthPage"));
  const ProfilePage = lazy(() => import("./pages/ProfilePage"));
  const DynamicArticle = lazy(
    () => import("./pages/ArticlePage/DynamicArticle"),
  );
  const AdminArticlesPage = lazy(() => import("./pages/AdminArticlesPage"));
  const AdminReviewsPage = lazy(() => import("./pages/AdminReviewsPage"));
  const AdminSchedulePage = lazy(() => import("./pages/AdminSchedulePage"));
  const ReviewEditorPage = lazy(
    () => import("./pages/AdminReviewsPage/Editor"),
  );
  const ArticleEditorPage = lazy(
    () => import("./pages/AdminArticlesPage/Editor"),
  );

  useAuthListener();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === null) {
      return (
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
      );
    }
    return savedTheme === "dark";
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
    // Match the browser UI (iOS status bar / Android toolbar) to the chosen theme
    const themeColor = isDarkMode ? "#1F1B18" : "#F6F1EA";
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", themeColor));
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <MotionConfig reducedMotion="user">
          <ContentContainer>
            <Router>
              <ScrollToTop />
              <ModalProvider>
                <BookingProvider>
                  <Header
                    themeToggle={ThemeToggle}
                    languageToggle={LanguageToggle}
                    language={language}
                    darkMode={isDarkMode}
                  />
                  <main style={{ flex: 1 }}>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                        <Route
                          path="/"
                          element={<HomePage language={language} />}
                        />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
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
                            element={<DynamicArticle language={language} />}
                          />
                          <Route
                            path=":slug"
                            element={<DynamicArticle language={language} />}
                          />
                        </Route>
                        <Route
                          path="/admin/articles"
                          element={<AdminArticlesPage />}
                        />
                        <Route
                          path="/admin/articles/new"
                          element={<ArticleEditorPage />}
                        />
                        <Route
                          path="/admin/articles/:id"
                          element={<ArticleEditorPage />}
                        />
                        <Route
                          path="/admin/schedule"
                          element={<AdminSchedulePage />}
                        />
                        <Route
                          path="/admin/reviews"
                          element={<AdminReviewsPage />}
                        />
                        <Route
                          path="/admin/reviews/new"
                          element={<ReviewEditorPage />}
                        />
                        <Route
                          path="/admin/reviews/:id"
                          element={<ReviewEditorPage />}
                        />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileBookingBar />
                  <PhoneButton />
                </BookingProvider>
              </ModalProvider>
            </Router>
          </ContentContainer>
        </MotionConfig>
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
  min-height: 100dvh;
  padding-top: var(--header-height);

  @media screen and (max-width: 1079px) {
    padding-bottom: ${MOBILE_BAR_SPACE};
  }

  main {
    flex: 1;
  }
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-7) 20px;
  @media screen and (min-width: 900px) {
    padding: var(--space-8) 40px;
  }
`;
