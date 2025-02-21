import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #F7F7F7;
    --color-text: #000000;
    --color-primary:#007586;
    --color-primary-light:rgb(156, 202, 209);
    --color-header-bg: rgba(255, 255, 255, 0.7);

    --color-bg-dark: #222831;
    --color-card-bg:rgba(0, 0, 0, 0.6);
    --color-text-dark:rgb(195, 193, 193);
    --color-primary-dark: rgb(73, 126, 134);
    --color-header-bg-dark: rgba(0, 0, 0, 0.7);
    --color-box-shadow-light: rgba(0, 0, 0, 0.1);
    --color-box-shadow-dark: rgba(0, 0, 0, 0.3);
    --transition-duration: 0.3s;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
    font-family: Arial, sans-serif;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
    transition: all 0.3s ease-in-out;
    transition: all var(--transition-duration) ease-in-out;
  }
  *{
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    outline: none;
    border: none;
    font-family: inherit;
  }


  body {
    overflow-x: hidden;
  }

  ul {
    list-style-type: none; 
  }

  a {
    text-decoration: none; 
    color: inherit; 
  }

  img, picture, video, canvas, iframe {
    display: block; 
    max-width: 100%; 
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }

  ::-moz-selection {
    background: transparent;
  }

  ::selection {
    background: transparent;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
  }

  input,
  textarea,
  button,
  select {
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
  }
`;

export default GlobalStyle;
