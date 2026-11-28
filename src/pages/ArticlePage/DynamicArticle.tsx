import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ArticleTitle, ArticleText } from ".";
import { ArticleBody } from "../../components/ArticleBody";
import { useIsAdmin } from "../../hooks/useAuth";
import { localized, useArticle, useArticles } from "../../hooks/useArticles";
import { ArticlePagePropsType } from "./types";

/**
 * An article from Supabase, by its slug. On /article itself (no slug) it shows
 * the first article in the list.
 */
const DynamicArticle: FC<ArticlePagePropsType> = ({ language }) => {
  const [t] = useTranslation();
  const { slug: slugParam } = useParams();
  const isAdmin = useIsAdmin();
  const list = useArticles();
  const slug = slugParam ?? list.data?.[0]?.slug;
  const { data: article, isLoading, isError } = useArticle(slug);

  if (isLoading || (!slugParam && list.isLoading))
    return <ArticleText>…</ArticleText>;
  if (isError || !article) {
    return <ArticleText>{t("article_not_found")}</ArticleText>;
  }

  const { title, content } = localized(article, language);

  return (
    <div>
      {isAdmin && (
        <ArticleText>
          {!article.published && <strong>{t("admin_draft")} · </strong>}
          <Link to={`/admin/articles/${article.id}`}>
            {t("admin_edit_article")}
          </Link>
        </ArticleText>
      )}
      <ArticleTitle>{title}</ArticleTitle>
      <ArticleBody source={content} />
    </div>
  );
};

export default DynamicArticle;
