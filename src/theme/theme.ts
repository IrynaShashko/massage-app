export const lightTheme = {
  colors: {
    background: "var(--color-bg)",
    buttonBg: "var(--color-bg-dark)",
    buttonText: "var(--color-bg)",
    primary: "var(--color-primary)",
    text: "var(--color-text)",
  },
};

export const darkTheme = {
  colors: {
    background: "var(--color-bg-dark)",
    buttonBg: "var(--color-bg)",
    buttonText: "var(--color-bg-dark)",
    primary: "var(--color-primary-dark)",
    text: "var(--color-text-dark)",
  },
};

export type ThemeType = typeof lightTheme;
