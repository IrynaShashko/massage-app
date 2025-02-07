// src/App.tsx
import React, { useEffect, useState } from "react";

import styled, { ThemeProvider } from "styled-components";

import GlobalStyle from "./theme/GlobalStyle";

import { darkTheme, lightTheme } from "./theme/theme";

import { ThemeButton } from "./components/ThemeButton";

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const ThemeToggle = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
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
      </Container>
    </ThemeProvider>
  );
};

export default App;

const Container = styled.div`
  padding: 50px;
  text-align: center;
`;
