import styled from "@emotion/styled";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { SectionContainer } from "../../App";
import { articleIcon } from "../../config/articleIcons";
import { iconTile } from "../../theme/surfaces";
import {
  Article,
  useArticles,
  useDeleteArticle,
} from "../../hooks/useArticles";
import { ThemeType } from "../../theme/theme";

import {
  AdminOnly,
  Card,
  ErrorText,
  GhostButton,
  GhostLink,
  PageTitle,
  PrimaryButton,
  TopBar,
} from "./shared";
import { SkeletonRows } from "../../components/Skeleton";

const ArticleIcon = ({ icon }: { icon: string }) => {
  const Icon = articleIcon(icon);
  return <Icon size={20} />;
};

const ArticleList = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const { data: articles = [], isLoading, isError } = useArticles();
  const deleteMutation = useDeleteArticle();

  const handleDelete = (article: Article) => {
    if (
      !window.confirm(t("admin_confirm_delete", { title: article.title_ua }))
    ) {
      return;
    }
    deleteMutation.mutate(article.id);
  };

  return (
    <SectionContainer>
      <TopBar>
        <PageTitle>{t("admin_articles")}</PageTitle>
        <TopActions>
          <GhostLink to="/article">
            <ArrowLeft size={16} aria-hidden />
            {t("admin_to_articles")}
          </GhostLink>
          <PrimaryButton
            type="button"
            onClick={() => navigate("/admin/articles/new")}
          >
            <Plus size={18} aria-hidden />
            {t("admin_new_article")}
          </PrimaryButton>
        </TopActions>
      </TopBar>

      <Card>
        {isLoading && <SkeletonRows count={4} actions={2} />}
        {isError && <ErrorText>{t("admin_load_error")}</ErrorText>}
        {deleteMutation.isError && (
          <ErrorText>{t("admin_delete_error")}</ErrorText>
        )}
        {!isLoading && !isError && articles.length === 0 && (
          <p>{t("admin_no_articles")}</p>
        )}

        <Rows>
          {articles.map((article) => (
            <Row key={article.id}>
              <RowMain>
                <RowIcon aria-hidden>
                  <ArticleIcon icon={article.icon} />
                </RowIcon>
                <div>
                  <RowTitle>{article.title_ua}</RowTitle>
                  <Meta>
                    <Status $published={article.published}>
                      {article.published
                        ? t("admin_published")
                        : t("admin_draft")}
                    </Status>
                    /article/{article.slug}
                  </Meta>
                </div>
              </RowMain>
              <Actions>
                <GhostLink
                  to={`/article/${article.slug}`}
                  aria-label={t("admin_view")}
                >
                  <Eye size={16} aria-hidden />
                </GhostLink>
                <GhostLink to={`/admin/articles/${article.id}`}>
                  <Pencil size={16} aria-hidden />
                  {t("admin_edit")}
                </GhostLink>
                <GhostButton
                  type="button"
                  $danger
                  onClick={() => handleDelete(article)}
                  disabled={deleteMutation.isPending}
                  aria-label={t("admin_delete")}
                >
                  <Trash2 size={16} aria-hidden />
                </GhostButton>
              </Actions>
            </Row>
          ))}
        </Rows>
      </Card>
    </SectionContainer>
  );
};

const AdminArticlesPage = () => (
  <AdminOnly>
    <ArticleList />
  </AdminOnly>
);

export default AdminArticlesPage;

const TopActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
`;

const Rows = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
`;

const Row = styled.li<{ theme?: ThemeType }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

const RowMain = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
`;

const RowIcon = styled.span`
  ${iconTile(40)}
  border-radius: var(--radius-md);
`;

const RowTitle = styled.p`
  font-size: var(--text-lg);
  font-weight: 700;
  overflow-wrap: anywhere;
`;

const Meta = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  opacity: 0.75;
  overflow-wrap: anywhere;
`;

const Status = styled.span<{ $published: boolean }>`
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-weight: 700;
  background: ${(props) =>
    props.$published
      ? "color-mix(in srgb, #2e9d5b 18%, transparent)"
      : "color-mix(in srgb, var(--color-primary) 14%, transparent)"};
`;

const Actions = styled.div`
  display: flex;
  gap: var(--space-2);
`;
