import styled from "@emotion/styled";
import { ArrowLeft } from "lucide-react";
import { FC, FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { SectionContainer } from "../../App";
import {
  ARTICLE_ICONS,
  ArticleIconKey,
  DEFAULT_ARTICLE_ICON,
} from "../../config/articleIcons";
import { ArticleBody } from "../../components/ArticleBody";
import {
  Article,
  ArticleInput,
  useArticleById,
  useSaveArticle,
} from "../../hooks/useArticles";
import { ThemeType } from "../../theme/theme";
import { ArticleTitle } from "../ArticlePage";

import {
  AdminOnly,
  Card,
  ErrorText,
  GhostButton,
  GhostLink,
  PageTitle,
  PrimaryButton,
  SLUG_PATTERN,
  slugify,
  TopBar,
} from "./shared";
import { SkeletonCard, SkeletonForm } from "../../components/Skeleton";

type Lang = "ua" | "en";

const EMPTY: ArticleInput = {
  slug: "",
  title_ua: "",
  title_en: "",
  content_ua: "",
  content_en: "",
  published: false,
  icon: DEFAULT_ARTICLE_ICON,
};

const toInput = (a: Article): ArticleInput => ({
  slug: a.slug,
  title_ua: a.title_ua,
  title_en: a.title_en,
  content_ua: a.content_ua,
  content_en: a.content_en,
  published: a.published,
  icon: a.icon || DEFAULT_ARTICLE_ICON,
});

const EditorForm: FC<{ id?: string; initial: ArticleInput }> = ({
  id,
  initial,
}) => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const saveMutation = useSaveArticle();

  const [form, setForm] = useState<ArticleInput>(initial);
  // a new article's slug follows its title until the admin edits the slug
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [lang, setLang] = useState<Lang>("ua");
  const [showPreview, setShowPreview] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleUa = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title_ua: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const input = { ...form, slug: form.slug.trim() };

    if (!input.title_ua.trim()) return setValidation(t("admin_title_required"));
    if (!SLUG_PATTERN.test(input.slug)) {
      return setValidation(t("admin_slug_invalid"));
    }
    setValidation(null);

    saveMutation.mutate(
      { id, input },
      { onSuccess: () => navigate("/admin/articles") },
    );
  };

  // 23505 = unique violation: the slug is taken
  const saveError = saveMutation.error as {
    code?: string;
    message?: string;
  } | null;
  const errorText =
    validation ||
    (saveError &&
      (saveError.code === "23505"
        ? t("admin_slug_taken")
        : t("admin_save_error")));

  const titleKey = lang === "ua" ? "title_ua" : "title_en";
  const contentKey = lang === "ua" ? "content_ua" : "content_en";

  return (
    <SectionContainer>
      <TopBar>
        <PageTitle>
          {id ? t("admin_edit_article") : t("admin_new_article")}
        </PageTitle>
        <GhostLink to="/admin/articles">
          <ArrowLeft size={16} aria-hidden />
          {t("admin_back")}
        </GhostLink>
      </TopBar>

      <Card>
        <form onSubmit={handleSubmit}>
          <Tabs role="tablist" aria-label={t("admin_language")}>
            {(["ua", "en"] as Lang[]).map((l) => (
              <Tab
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                $active={lang === l}
                onClick={() => setLang(l)}
              >
                {l === "ua" ? "Українська" : "English"}
              </Tab>
            ))}
          </Tabs>

          <Field>
            <label htmlFor="article-title">
              {t("admin_field_title")}
              {lang === "en" && <Hint> · {t("admin_en_optional")}</Hint>}
            </label>
            <input
              id="article-title"
              value={form[titleKey]}
              onChange={(e) =>
                lang === "ua"
                  ? handleTitleUa(e.target.value)
                  : set("title_en", e.target.value)
              }
              required={lang === "ua"}
            />
          </Field>

          <Field>
            <label htmlFor="article-content">{t("admin_field_content")}</label>
            <textarea
              id="article-content"
              rows={16}
              value={form[contentKey]}
              onChange={(e) => set(contentKey, e.target.value)}
            />
            <Hint>{t("admin_format_hint")}</Hint>
          </Field>

          <Field>
            <label htmlFor="article-slug">{t("admin_field_slug")}</label>
            <input
              id="article-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase());
              }}
              required
            />
            <Hint>/article/{form.slug || "…"}</Hint>
          </Field>

          <Field>
            <span id="article-icon-label">{t("admin_field_icon")}</span>
            <IconGrid role="radiogroup" aria-labelledby="article-icon-label">
              {(Object.keys(ARTICLE_ICONS) as ArticleIconKey[]).map((key) => {
                const Icon = ARTICLE_ICONS[key];
                const selected = form.icon === key;
                return (
                  <IconOption
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={key}
                    title={key}
                    $selected={selected}
                    onClick={() => set("icon", key)}
                  >
                    <Icon size={20} aria-hidden />
                  </IconOption>
                );
              })}
            </IconGrid>
          </Field>

          <Checkbox>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              aria-describedby="publish-hint"
            />
            {t("admin_publish")}
          </Checkbox>
          <PublishHint id="publish-hint" $published={form.published}>
            {form.published
              ? t("admin_publish_hint_on")
              : t("admin_publish_hint_off")}
          </PublishHint>

          {errorText && <ErrorText>{errorText}</ErrorText>}
          {/* raw Supabase message: admin-only page, helps to see the cause */}
          {!validation && saveError?.code !== "23505" && saveError?.message && (
            <Hint>{saveError.message}</Hint>
          )}

          <Buttons>
            <PrimaryButton type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "…" : t("admin_save")}
            </PrimaryButton>
            <GhostButton
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              aria-expanded={showPreview}
            >
              {showPreview ? t("admin_hide_preview") : t("admin_preview")}
            </GhostButton>
          </Buttons>
        </form>
      </Card>

      {showPreview && (
        <Preview>
          <ArticleTitle>{form[titleKey] || form.title_ua}</ArticleTitle>
          <ArticleBody source={form[contentKey] || form.content_ua} />
        </Preview>
      )}
    </SectionContainer>
  );
};

const LoadArticle: FC<{ id: string }> = ({ id }) => {
  const [t] = useTranslation();
  const { data, isLoading, isError } = useArticleById(id);

  if (isLoading)
    return (
      <SectionContainer>
        <SkeletonCard>
          <SkeletonForm fields={4} tall />
        </SkeletonCard>
      </SectionContainer>
    );
  if (isError || !data) {
    return (
      <SectionContainer>
        <Card>
          <ErrorText>{t("article_not_found")}</ErrorText>
        </Card>
      </SectionContainer>
    );
  }
  return <EditorForm key={data.id} id={data.id} initial={toInput(data)} />;
};

const ArticleEditorPage = () => {
  const { id } = useParams();
  return (
    <AdminOnly>
      {id ? <LoadArticle id={id} /> : <EditorForm initial={EMPTY} />}
    </AdminOnly>
  );
};

export default ArticleEditorPage;

const Tabs = styled.div<{ theme?: ThemeType }>`
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
`;

const Tab = styled.button<{ theme?: ThemeType; $active: boolean }>`
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-weight: 700;
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  background: ${(props) =>
    props.$active
      ? "var(--color-primary)"
      : "color-mix(in srgb, var(--color-primary) 10%, transparent)"};
`;

const Field = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);

  label,
  #article-icon-label {
    font-weight: 700;
  }

  input,
  textarea {
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 1.5px solid ${(props) => props.theme.colors.border};
    background: transparent;
    color: ${(props) => props.theme.colors.text};
    font: inherit;
    font-size: 16px;
    line-height: 1.6;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-ring);
    }
  }

  textarea {
    resize: vertical;
    min-height: 240px;
  }
`;

const IconGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const IconOption = styled.button<{ theme?: ThemeType; $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  color: ${(props) => (props.$selected ? "#fff" : "var(--color-primary)")};
  background: ${(props) =>
    props.$selected
      ? "var(--color-primary)"
      : "color-mix(in srgb, var(--color-primary) 10%, transparent)"};
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px var(--color-primary-ring);
  }
`;

const Hint = styled.span`
  font-size: var(--text-sm);
  font-weight: 400;
  opacity: 0.7;
`;

const PublishHint = styled.p<{ $published: boolean }>`
  margin: 0 0 var(--space-4) 26px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.5;
  background: ${(props) =>
    props.$published
      ? "color-mix(in srgb, #2e9d5b 14%, transparent)"
      : "color-mix(in srgb, var(--color-primary) 12%, transparent)"};
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-weight: 600;
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-primary);
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-3);
`;

const Preview = styled(Card)`
  margin-top: var(--space-5);

  ul {
    list-style: disc;
    padding-left: var(--space-5);
    margin: var(--space-3) 0 var(--space-5);
  }
`;
