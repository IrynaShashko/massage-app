import styled from "@emotion/styled";
import { HeartPulse, HelpCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";

import lady from "../../images/lady.png";

import { SectionContainer } from "../../App";
import BookNow from "../../components/BookNow";
import { SectionHeading } from "../../components/SectionHeading";
import { Glow, GlowSection } from "../../components/SectionHeading/Glow";

import { cardSurface, iconTile } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

const ARTICLES = [
  { to: "/article/questions", key: "questions", Icon: HelpCircle },
  { to: "/article/health", key: "health", Icon: HeartPulse },
  { to: "/article/expectation", key: "expectation", Icon: Sparkles },
];

const ArticlePage = ({ language }: { language: string }) => {
  const [t] = useTranslation();

  return (
    <>
      <GlowSection>
        <Glow />
        <SectionContainer>
          <SectionHeading
            level="h1"
            lead={t("articles_lead")}
            accent={t("articles_accent")}
          />
          <Layout>
            <Sidebar>
              <Illustration src={lady} alt="" aria-hidden />
              <nav aria-label={t("article_button")}>
                <ArticleList>
                  {ARTICLES.map(({ to, key, Icon }) => (
                    <li key={to}>
                      <ArticleLink to={to}>
                        <LinkIcon aria-hidden>
                          <Icon size={20} />
                        </LinkIcon>
                        {/* titles in the translations end with a full stop */}
                        <span>{t(key).replace(/\.$/, "")}</span>
                      </ArticleLink>
                    </li>
                  ))}
                </ArticleList>
              </nav>
            </Sidebar>

            <Content>
              <Outlet />
            </Content>
          </Layout>
        </SectionContainer>
      </GlowSection>
      <BookNow language={language} />
    </>
  );
};

export default ArticlePage;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  align-items: start;

  @media screen and (min-width: 900px) {
    grid-template-columns: 320px minmax(0, 1fr);
  }
`;

const Sidebar = styled.aside<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  --sidebar-pad: var(--space-4);
  padding: var(--sidebar-pad);
  overflow: hidden;

  @media screen and (min-width: 900px) {
    position: sticky;
    top: calc(var(--header-height) + var(--space-5));
  }
`;

/* The drawing is cropped on its right side, so it runs into the card's right
   border: the cut then reads as the card edge rather than a clipped picture */
const Illustration = styled.img`
  display: block;
  width: calc(100% + var(--sidebar-pad));
  max-width: none;
  height: auto;
  margin: var(--space-2) calc(-1 * var(--sidebar-pad)) var(--space-4) 0;

  /* the drawing is black ink on transparent: lighten it at night */
  [data-theme="dark"] & {
    filter: invert(0.88);
  }

  @media screen and (max-width: 899px) {
    display: none;
  }
`;

const ArticleList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const LinkIcon = styled.span`
  ${iconTile(40)}
  border-radius: var(--radius-md);
`;

const ArticleLink = styled(NavLink)<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  line-height: 1.35;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  &.active {
    background: color-mix(in srgb, var(--color-primary) 12%, transparent);
    color: var(--color-primary);
    font-weight: 700;
  }

  &.active > span:first-of-type {
    background: var(--color-primary);
    color: #fff;
  }
`;

const Content = styled.article<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  padding: var(--space-5);

  @media screen and (min-width: 600px) {
    padding: var(--space-6);
  }

  @media screen and (min-width: 1100px) {
    padding: var(--space-6) var(--space-7);
  }

  /* lists inside the articles */
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: var(--space-3) 0 var(--space-5);
  }

  ul li {
    position: relative;
    padding-left: var(--space-5);
  }

  ul li::before {
    content: "";
    position: absolute;
    left: 2px;
    top: 0.7em;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--gradient-accent);
  }

  strong {
    font-weight: 700;
  }
`;

/* ---------- article typography (used by the article components) ---------- */

export const ArticleTitle = styled.h2<{ theme?: ThemeType }>`
  margin-bottom: var(--space-5);
  font-size: clamp(1.6rem, 1.3rem + 1.2vw, 2.2rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: ${(props) => props.theme.colors.text};
  text-wrap: balance;
`;

export const ArticleAfterTitle = styled.h3<{ theme?: ThemeType }>`
  margin: var(--space-6) 0 var(--space-3);
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.3;
  color: ${(props) => props.theme.colors.text};
`;

export const ArticleText = styled.p<{ theme?: ThemeType }>`
  max-width: 72ch;
  margin-bottom: var(--space-3);
  font-size: var(--text-lg);
  line-height: 1.75;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.88;
`;
