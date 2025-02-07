// src/theme/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #F7F7F7;
    --color-text: #000000;
    --color-primary: #007586;

    --color-bg-dark: #222831;
    --color-text-dark: #ffffff;
    --color-primary-dark: #007586;
  }

  body {
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    transition: all 0.3s ease-in-out;
  }
`;

export default GlobalStyle;
