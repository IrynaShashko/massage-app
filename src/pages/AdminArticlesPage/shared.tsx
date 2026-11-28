import styled from "@emotion/styled";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";

import { SectionContainer } from "../../App";
import { PageSkeleton } from "../../components/Skeleton";
import { useProfile } from "../../hooks/useAuth";
import { useAuthLinkState } from "../../hooks/useAuthReturn";
import { cardSurface } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

/**
 * Hides admin pages from everyone else. This is only for the UI: the database
 * itself refuses article writes from non-admins (RLS), whatever the page does.
 */
export const AdminOnly: FC<{ children: ReactNode }> = ({ children }) => {
  const [t] = useTranslation();
  const { data: user, isLoading } = useProfile();
  const authState = useAuthLinkState();

  if (isLoading) return <PageSkeleton />;
  if (!user) return <Navigate to="/auth" state={authState} replace />;
  if (user.role !== "admin") {
    return (
      <SectionContainer>
        <Card>
          <p>{t("admin_only")}</p>
        </Card>
      </SectionContainer>
    );
  }
  return <>{children}</>;
};

const UA_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
  "'": "",
  "’": "",
};

/** "Масаж спини" -> "masazh-spyny", matching the slug check in the database */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .split("")
    .map((ch) => UA_TO_LATIN[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const Card = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  padding: var(--space-5);
  color: ${(props) => props.theme.colors.text};

  @media screen and (min-width: 600px) {
    padding: var(--space-6);
  }
`;

export const PageTitle = styled.h1<{ theme?: ThemeType }>`
  font-size: var(--text-2xl);
  font-weight: 800;
  letter-spacing: -0.015em;
  color: ${(props) => props.theme.colors.text};
`;

export const TopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 22px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-size: var(--text-base);
  font-weight: 700;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

type GhostProps = { theme?: ThemeType; $danger?: boolean };

const ghost = ({ theme, $danger }: GhostProps) => {
  const tone = $danger ? "#d64545" : undefined;
  return `
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 10px 18px;
    border-radius: var(--radius-full);
    border: 1.5px solid ${tone ?? theme?.colors.border};
    color: ${tone ?? theme?.colors.text};
    font-size: var(--text-sm);
    font-weight: 600;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: color-mix(
        in srgb,
        ${tone ?? "var(--color-primary)"} 10%,
        transparent
      );
    }
  `;
};

export const GhostButton = styled.button<GhostProps>`
  ${ghost}
`;

export const GhostLink = styled(Link)<GhostProps>`
  ${ghost}
`;

export const ErrorText = styled.p`
  color: #d64545;
  font-size: var(--text-sm);
  font-weight: 600;
`;
