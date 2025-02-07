// src/theme/theme.ts
export const lightTheme = {
  colors: {
    background: "var(--color-bg)",
    text: "var(--color-text)",
    primary: "var(--color-primary)",
  },
};

export const darkTheme = {
  colors: {
    background: "var(--color-bg-dark)",
    text: "var(--color-text-dark)",
    primary: "var(--color-primary-dark)",
  },
};

export type ThemeType = typeof lightTheme;
