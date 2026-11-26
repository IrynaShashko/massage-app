import { ThemeType } from "./theme";

/**
 * Shared "card" surface so every boxed block on the site (feature cards,
 * contacts, booking form, map) looks like one family.
 */
export const cardSurface = (theme: ThemeType) => `
  background-color: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.border};
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
`;

/** Rounded-square icon tile used next to card titles and contact rows */
export const iconTile = (size = 56) => `
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${size}px;
  height: ${size}px;
  border-radius: var(--radius-lg);
  background-color: color-mix(in srgb, var(--color-primary) 16%, transparent);
  color: var(--color-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
`;

/** Card title style shared by feature cards, contacts card and booking form */
export const cardTitle = (theme: ThemeType) => `
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: ${theme.colors.text};
`;
