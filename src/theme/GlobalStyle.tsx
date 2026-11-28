import { css, Global, Theme } from "@emotion/react";

const globalStyles = (theme: Theme) => css`
  :root {
    /* ---------- Design tokens ---------- */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 24px;
    --space-6: 32px;
    --space-7: 48px;
    --space-8: 64px;
    --space-9: 96px;

    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    --shadow-sm: 0 2px 8px var(--color-shadow);
    --shadow-md: 0 6px 20px var(--color-shadow);
    --shadow-lg: 0 16px 40px var(--color-shadow);

    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
    --text-3xl: clamp(1.875rem, 1.4rem + 2vw, 2.75rem);

    --header-height: 64px;
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

    --font-body: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif;
    --font-heading: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif;
    --font-accent: "Great Vibes", cursive;

    --color-bg: #f6f1ea;
    --color-bg-white: #ffffff;
    --color-text: rgb(23, 22, 22);
    --color-primary: #007586;
    --color-primary-hover: #005f6e;
    --color-primary-light: rgb(156, 202, 209);
    /* Opaque on purpose: a translucent fixed header lets the page show
       through on iOS Safari, where backdrop-filter is unreliable */
    --color-header-bg: #f6f1ea;
    /* Opaque so the dotted page background never shows through cards */
    --color-card-bg-light: #efe7e0;

    /* Warm dark palette (matches the warm beige light theme) */
    --color-bg-dark: #1f1b18;
    --color-card-bg: #2b2622;
    --color-text-dark: #ede6dc;
    --color-primary-dark: rgb(95, 157, 168);
    --color-header-bg-dark: #1f1b18;
    --color-box-shadow-light: rgba(0, 0, 0, 0.1);
    --color-box-shadow-dark: rgba(0, 0, 0, 0.4);
    --color-shadow: var(--color-box-shadow-light);
    --color-dot: rgba(23, 22, 22, 0.1);
    --glow-a: rgba(0, 117, 134, 0.16);
    --glow-b: rgba(106, 123, 216, 0.16);
    --gradient-accent: linear-gradient(
      100deg,
      #007586 0%,
      #2a9bb0 45%,
      #6a7bd8 100%
    );
    /* Lighter version of the same gradient for text on dark photos */
    --gradient-accent-light: linear-gradient(
      100deg,
      #9ccad1 0%,
      #7fd3de 45%,
      #aab6f6 100%
    );
    --surface-glass: rgba(255, 255, 255, 0.78);
    --surface-border: rgba(255, 255, 255, 0.95);
    --shadow-glass:
      0 1px 2px rgba(23, 22, 22, 0.04),
      0 14px 34px -14px rgba(0, 117, 134, 0.28);

    --color-primary-ring: color-mix(
      in srgb,
      var(--color-primary) 25%,
      transparent
    );
    --color-primary-shadow: color-mix(
      in srgb,
      var(--color-primary) 40%,
      transparent
    );
    --color-selection: color-mix(
      in srgb,
      var(--color-primary) 30%,
      transparent
    );
    --color-scrollbar-track: transparent;
    --color-scrollbar-thumb: color-mix(in srgb, currentColor 35%, transparent);

    --transition-duration: 0.3s;
  }

  @media screen and (min-width: 1080px) {
    :root {
      --header-height: 80px;
    }
  }

  /* In dark mode the brand teal is lifted so text in it passes WCAG AA on the dark background */
  :root[data-theme="dark"] {
    --color-primary: #23919f;
    --color-primary-hover: #1b7d8a;
    --color-shadow: var(--color-box-shadow-dark);
    --color-dot: rgba(237, 230, 220, 0.08);
    --glow-a: rgba(35, 145, 159, 0.2);
    --glow-b: rgba(120, 137, 230, 0.14);
    --gradient-accent: linear-gradient(
      100deg,
      #3fb3c1 0%,
      #5fb8d0 45%,
      #9aa8f0 100%
    );
    --surface-glass: rgba(43, 38, 34, 0.82);
    --surface-border: rgba(255, 255, 255, 0.08);
    --shadow-glass:
      0 1px 2px rgba(0, 0, 0, 0.3), 0 14px 34px -14px rgba(0, 0, 0, 0.6);
    color-scheme: dark;
  }

  :root[data-theme="light"] {
    color-scheme: light;
  }

  html,
  body {
    font-family: var(--font-body);
    margin: 0;
    padding: 0;
    width: 100%;
    line-height: 1.5;
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    transition:
      background-color var(--transition-duration) ease-in-out,
      color var(--transition-duration) ease-in-out;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  html {
    scroll-behavior: smooth;
    /* Every scroll target (anchors, scrollIntoView) stops below the fixed
       header with some air, so nothing ends up hidden under it */
    scroll-padding-top: calc(var(--header-height) + var(--space-4));
  }

  /* Keep targets clear of the fixed bottom booking bar on mobile/tablet */
  @media screen and (max-width: 1079px) {
    html {
      scroll-padding-bottom: 88px;
    }
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-heading);
    line-height: 1.2;
  }

  button {
    font-family: var(--font-body);
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
    /* clip (not hidden) so body never becomes a scroll container,
       which breaks position: fixed on iOS Safari */
    overflow-x: clip;
    /* Subtle dotted texture over the page colour */
    background-image: radial-gradient(
      circle at 1px 1px,
      var(--color-dot) 1px,
      transparent 1.5px
    );
    background-size: 22px 22px;
  }

  ul {
    list-style-type: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img,
  picture,
  video,
  canvas,
  iframe {
    display: block;
    max-width: 100%;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }

  ::selection {
    background: var(--color-selection);
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

  /* Visible focus for keyboard users only */
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
    border-radius: 6px;
  }

  /* Form fields already show their own focus ring */
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: none;
  }

  body.modal-open {
    overflow: hidden;
    height: 100vh;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--color-scrollbar-track);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--color-scrollbar-thumb);
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const GlobalStyle = () => <Global styles={globalStyles} />;

export default GlobalStyle;
