import { FC } from "react";

import styled from "@emotion/styled";

import { ThemeType } from "../../theme/theme";

type SectionHeadingProps = {
  lead: string;
  accent: string;
  id?: string;
  /** Page title uses h1; sections inside a page use h2 (default) */
  level?: "h1" | "h2";
  align?: "center" | "left";
};

/** Section title with its key words in a gradient */
export const SectionHeading: FC<SectionHeadingProps> = ({
  lead,
  accent,
  id,
  level = "h2",
  align = "center",
}) => (
  <Header id={id} $align={align}>
    <Heading as={level}>
      {lead} <GradientText>{accent}</GradientText>
    </Heading>
  </Header>
);

const Header = styled.div<{ $align: "center" | "left" }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) =>
    props.$align === "left" ? "flex-start" : "center"};
  gap: var(--space-4);
  margin-bottom: var(--space-7);
  text-align: ${(props) => props.$align};
`;

const Heading = styled.h2<{ theme?: ThemeType }>`
  font-family: var(--font-heading);
  font-size: clamp(2rem, 1.4rem + 2.4vw, 3rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: ${(props) => props.theme.colors.text};
  text-wrap: balance;
`;

export const GradientText = styled.span`
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--color-primary);
`;
