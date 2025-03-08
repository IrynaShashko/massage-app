import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #F7F7F7;
    --color-bg-white:#ffffff;
    --color-text:rgb(23, 22, 22);
    --color-primary:#007586;
    --color-primary-light:rgb(156, 202, 209);
    --color-header-bg: rgba(255, 255, 255, 0.7);

    --color-bg-dark:rgb(55, 61, 70);
    --color-card-bg:rgba(0, 0, 0, 0.5);
    --color-text-dark:rgb(195, 193, 193);
    --color-primary-dark: rgb(89, 131, 137);
    --color-header-bg-dark: rgba(0, 0, 0, 0.7);
    --color-box-shadow-light: rgba(0, 0, 0, 0.1);
    --color-box-shadow-dark: rgba(0, 0, 0, 0.3);
    --transition-duration: 0.3s;
  }

  html, body {
    font-family: 'Comfortaa', sans-serif;
    margin: 0;
    padding: 0;
    width: 100%;
    font-family: Arial, sans-serif;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
    transition: all 0.3s ease-in-out;
    transition: all var(--transition-duration) ease-in-out;
  }

  h1, h2, h3, h4, p, a, button, ::placeholder {
    font-family: 'Comfortaa', sans-serif;
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
