export const lightTheme = {
  colors: {
    background: "var(--color-bg)",
    buttonBg: "var(--color-bg-dark)",
    buttonText: "var(--color-bg)",
    primary: "var(--color-primary)",
    text: "var(--color-text)",
    heroText: "var(--color-bg)",
    headerBg: "var(--color-header-bg)",
    boxShadow: "var(--color-box-shadow-light)",
    cardBg: "var(--color-header-bg)",
    aboutBg: "var(--color-primary-light)",
    aboutText: "var(--color-primary-dark)",
    iconColor: "var(--color-bg-white)",
    modalIconColor: "var(--color-card-bg)",
  },
};

export const darkTheme = {
  colors: {
    background: "var(--color-bg-dark)",
    buttonBg: "var(--color-text-dark)",
    buttonText: "var(--color-bg-dark)",
    primary: "var(--color-primary-dark)",
    headerBg: "var(--color-header-bg-dark)",
    text: "var(--color-text-dark)",
    boxShadow: "var(--color-box-shadow-dark)",
    cardBg: "var(--color-card-bg)",
    heroText: "var(--color-bg)",
    aboutBg: "var(--color-primary-dark)",
    aboutText: "var(--color-primary-light)",
    iconColor: "var(--color-bg)",
    modalIconColor: "var(--color-text-dark)",
  },
};

export type ThemeType = typeof lightTheme;
