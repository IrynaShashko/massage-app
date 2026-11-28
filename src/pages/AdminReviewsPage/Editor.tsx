import styled from "@emotion/styled";
import { ArrowLeft } from "lucide-react";
import { FC, FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { SectionContainer } from "../../App";
import { DatePicker } from "../../components/DatePicker";
import {
  AdminReviewInput,
  Review,
  useReviewById,
  useSaveReview,
} from "../../hooks/useReviews";
import { ThemeType } from "../../theme/theme";
import {
  AdminOnly,
  Card,
  ErrorText,
  GhostLink,
  PageTitle,
  PrimaryButton,
  TopBar,
} from "../AdminArticlesPage/shared";
import { RatingInput } from "../ReviewsPage/RatingInput";

/** yyyy-mm-dd in local time, the DatePicker's value format */
const toDateInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Midday local time, so the date never shifts across time zones */
const fromDateInput = (value: string) =>
  new Date(`${value}T12:00:00`).toISOString();

type FormState = {
  authorName: string;
  comment: string;
  rating: number;
  date: string;
};

const EditorForm: FC<{ review?: Review }> = ({ review }) => {
  const [t, i18n] = useTranslation();
  const navigate = useNavigate();
  const saveMutation = useSaveReview();

  const [form, setForm] = useState<FormState>({
    // for site users an empty name means "use the name from their profile"
    authorName: review?.authorName ?? "",
    comment: review?.comment ?? "",
    rating: review?.rating ?? 5,
    date: toDateInput(review?.createdAt ?? new Date().toISOString()),
  });
  const [validation, setValidation] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fromSite = !!review?.userId;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fromSite && !form.authorName.trim()) {
      return setValidation(t("admin_review_name_required"));
    }
    if (!form.comment.trim())
      return setValidation(t("admin_review_text_required"));
    if (!form.date) return setValidation(t("admin_review_date_required"));
    setValidation(null);

    const input: AdminReviewInput = {
      authorName: form.authorName,
      comment: form.comment.trim(),
      rating: form.rating,
      createdAt: fromDateInput(form.date),
    };
    saveMutation.mutate(
      { id: review?.id, input },
      { onSuccess: () => navigate("/admin/reviews") },
    );
  };

  const errorText =
    validation || (saveMutation.error && t("admin_review_save_error"));

  return (
    <SectionContainer>
      <TopBar>
        <PageTitle>
          {review ? t("admin_edit_review") : t("admin_new_review")}
        </PageTitle>
        <GhostLink to="/admin/reviews">
          <ArrowLeft size={16} aria-hidden />
          {t("admin_back")}
        </GhostLink>
      </TopBar>

      <Card>
        <form onSubmit={handleSubmit}>
          <Field>
            <label htmlFor="review-name">{t("admin_review_name")}</label>
            <input
              id="review-name"
              value={form.authorName}
              onChange={(e) => set("authorName", e.target.value)}
              placeholder={fromSite ? review?.user.name : ""}
              required={!fromSite}
            />
            <Hint>
              {fromSite
                ? t("admin_review_name_hint_site")
                : t("admin_review_name_hint")}
            </Hint>
          </Field>

          <Field>
            <span id="review-rating-label">{t("admin_review_rating")}</span>
            <RatingInput
              value={form.rating}
              onChange={(value) => set("rating", value)}
              labelId="review-rating-label"
            />
          </Field>

          <Field>
            <label htmlFor="review-text">{t("admin_review_text")}</label>
            <textarea
              id="review-text"
              rows={6}
              value={form.comment}
              onChange={(e) => set("comment", e.target.value)}
              required
            />
          </Field>

          <Field>
            <label htmlFor="review-date">{t("admin_review_date")}</label>
            <DateField>
              <DatePicker
                id="review-date"
                value={form.date}
                onChange={(date) => set("date", date)}
                locale={i18n.language === "en" ? "en-GB" : "uk-UA"}
                allow="past"
                clearable={false}
                labels={{
                  placeholder: t("date_placeholder"),
                  clear: t("date_clear"),
                  today: t("date_today"),
                  previousMonth: t("date_prev_month"),
                  nextMonth: t("date_next_month"),
                  previousYear: t("date_prev_year"),
                  nextYear: t("date_next_year"),
                }}
              />
            </DateField>
            <Hint>{t("admin_review_date_hint")}</Hint>
          </Field>

          {errorText && <ErrorText>{errorText}</ErrorText>}
          {!validation && saveMutation.error?.message && (
            <Hint>{saveMutation.error.message}</Hint>
          )}

          <Buttons>
            <PrimaryButton type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "…" : t("admin_save")}
            </PrimaryButton>
          </Buttons>
        </form>
      </Card>
    </SectionContainer>
  );
};

const LoadReview: FC<{ id: string }> = ({ id }) => {
  const [t] = useTranslation();
  const { data, isLoading, isError } = useReviewById(id);

  if (isLoading) return <SectionContainer>…</SectionContainer>;
  if (isError || !data) {
    return (
      <SectionContainer>
        <Card>
          <ErrorText>{t("admin_review_not_found")}</ErrorText>
        </Card>
      </SectionContainer>
    );
  }
  return <EditorForm key={data.id} review={data} />;
};

const ReviewEditorPage = () => {
  const { id } = useParams();
  return <AdminOnly>{id ? <LoadReview id={id} /> : <EditorForm />}</AdminOnly>;
};

export default ReviewEditorPage;

const Field = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);

  label,
  #review-rating-label {
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
    color-scheme: light dark;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-ring);
    }
  }

  textarea {
    resize: vertical;
    min-height: 140px;
  }
`;

/* a date needs ~22 characters; a full-width field looks empty */
const DateField = styled.div`
  width: 100%;
  max-width: 340px;
`;

const Hint = styled.span`
  font-size: var(--text-sm);
  opacity: 0.7;
`;

const Buttons = styled.div`
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-3);
`;
