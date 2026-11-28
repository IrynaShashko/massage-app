import styled from "@emotion/styled";
import { ChevronDown, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import lady from "../../images/lady.png";

import { SectionContainer } from "../../App";
import BookNow from "../../components/BookNow";
import { SectionHeading } from "../../components/SectionHeading";
import { Glow, GlowSection } from "../../components/SectionHeading/Glow";
import { articleIcon } from "../../config/articleIcons";
import { useIsAdmin } from "../../hooks/useAuth";
import { localized, useArticles } from "../../hooks/useArticles";

import { cardSurface, iconTile } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";
import { SkeletonBlock } from "../../components/Skeleton";

const ArticlePage = ({ language }: { language: string }) => {
  const [t] = useTranslation();
  const isAdmin = useIsAdmin();
  // articles added in the admin panel; visitors only receive published ones
  const { data: articles = [], isLoading } = useArticles();

  // On phones the list is a collapsed picker showing the open article, so a
  // long list never pushes the article itself off screen
  const { pathname } = useLocation();
  const [isListOpen, setIsListOpen] = useState(false);
  useEffect(() => setIsListOpen(false), [pathname]);

  const slug = pathname.split("/")[2];
  const current =
    articles.find((a) => a.slug === slug) ?? (slug ? undefined : articles[0]);
  const CurrentIcon = articleIcon(current?.icon);
  const titleOf = (article: (typeof articles)[number]) =>
    // some titles end with a full stop
    localized(article, language).title.replace(/\.$/, "");

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
          {isAdmin && (
            <AdminBar>
              <AdminButton to="/admin/articles">
                <Settings2 size={18} aria-hidden />
                {t("admin_articles")}
              </AdminButton>
            </AdminBar>
          )}
          <Layout>
            <Sidebar>
              <Illustration src={lady} alt="" aria-hidden />
              <PickerButton
                type="button"
                aria-expanded={isListOpen}
                aria-controls="article-list"
                onClick={() => setIsListOpen((open) => !open)}
              >
                <LinkIcon aria-hidden>
                  <CurrentIcon size={20} />
                </LinkIcon>
                <PickerText>
                  <PickerHint>
                    {t("article_button")} · {articles.length}
                  </PickerHint>
                  <span>
                    {current ? titleOf(current) : t("article_button")}
                  </span>
                </PickerText>
                <Chevron $open={isListOpen} size={22} aria-hidden />
              </PickerButton>
              <ListPanel
                id="article-list"
                aria-label={t("article_button")}
                $open={isListOpen}
              >
                <ArticleList>
                  {isLoading &&
                    Array.from({ length: 4 }, (_, i) => (
                      <SkeletonItem key={i} aria-hidden>
                        <SkeletonBlock
                          $w="40px"
                          $h="40px"
                          style={{ borderRadius: "var(--radius-md)" }}
                        />
                        <SkeletonBlock $w={i % 2 ? "55%" : "75%"} $h="14px" />
                      </SkeletonItem>
                    ))}
                  {articles.map((article) => {
                    const Icon = articleIcon(article.icon);
                    return (
                      <li key={article.id}>
                        <ArticleLink to={`/article/${article.slug}`}>
                          <LinkIcon aria-hidden>
                            <Icon size={20} />
                          </LinkIcon>
                          <span>
                            {titleOf(article)}
                            {!article.published && ` (${t("admin_draft")})`}
                          </span>
                        </ArticleLink>
                      </li>
                    );
                  })}
                </ArticleList>
              </ListPanel>
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

const AdminBar = styled.div`
  display: flex;
  margin-bottom: var(--space-4);
`;

/* Same look as "Керування відгуками" on the reviews page */
const AdminButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  font-weight: 700;
  transition: background-color 0.2s ease;

  @media (hover: hover) {
    &:hover {
      background: color-mix(in srgb, var(--color-primary) 20%, transparent);
    }
  }
`;

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

  @media screen and (max-width: 899px) {
    --sidebar-pad: var(--space-2);
  }

  /* a long list scrolls inside the sticky card instead of being cut off */
  @media screen and (min-width: 900px) {
    position: sticky;
    top: calc(var(--header-height) + var(--space-5));
    display: flex;
    flex-direction: column;
    max-height: calc(100dvh - var(--header-height) - 2 * var(--space-5));
  }
`;

const PickerButton = styled.button<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  color: ${(props) => props.theme.colors.text};
  text-align: left;

  @media screen and (min-width: 900px) {
    display: none;
  }
`;

const PickerText = styled.span`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  font-weight: 700;
  line-height: 1.3;
`;

const PickerHint = styled.span`
  font-size: var(--text-sm);
  font-weight: 500;
  opacity: 0.65;
`;

const Chevron = styled(ChevronDown, {
  shouldForwardProp: (prop) => prop !== "$open",
})<{ $open: boolean }>`
  flex-shrink: 0;
  opacity: 0.7;
  transform: rotate(${(props) => (props.$open ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;

const ListPanel = styled.nav<{ $open: boolean }>`
  @media screen and (max-width: 899px) {
    display: ${(props) => (props.$open ? "block" : "none")};
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--surface-border);
  }

  @media screen and (min-width: 900px) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
`;

/* The drawing is cropped on its right side, so it runs into the card's right
   border: the cut then reads as the card edge rather than a clipped picture */
const Illustration = styled.img`
  display: block;
  flex-shrink: 0;
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

const SkeletonItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
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

  @media (hover: hover) {
    &:hover {
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    }
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
