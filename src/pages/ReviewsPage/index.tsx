import { useEffect, useMemo, useRef, useState } from "react";

import styled from "@emotion/styled";
import { LogIn, MessageSquareHeart, PenLine, Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SectionContainer } from "../../App";
import BookNow from "../../components/BookNow";
import { SectionHeading } from "../../components/SectionHeading";
import { Glow, GlowSection } from "../../components/SectionHeading/Glow";

import { useModal } from "../../context/ModalContext";
import { cardSurface, cardTitle, iconTile } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

import { useProfile, useUpdateProfile } from "../../hooks/useAuth";
import { useCreateReview, useReviews } from "../../hooks/useReviews";

import {
  Card as ReviewCard,
  Header as ReviewHeader,
  RatingStars,
  ReviewItem,
} from "./ReviewItem";
import { RatingInput } from "./RatingInput";
import { Review } from "./types";
import { SkeletonBlock, SkeletonStack } from "../../components/Skeleton";

const REVIEWS_PER_PAGE = 4;
const FORM_ID = "leave-review";

/** Labels in the translations end with ":"; drop it to match other forms */
const label = (text: string) => text.replace(/:\s*$/, "");

const toLocale = (language: string) => (language === "ua" ? "uk" : language);

/** "1 відгук / 3 відгуки / 5 відгуків": the app's "ua" code has no i18next plural rules */
const pluralForm = (n: number, language: string) => {
  const rule = new Intl.PluralRules(toLocale(language)).select(n);
  return rule === "one" ? "one" : rule === "few" ? "few" : "many";
};

const ReviewsPage = ({ language }: { language: string }) => {
  const [t] = useTranslation();
  const { data: user } = useProfile();
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const [info, setInfo] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [newReview, setNewReview] = useState<Review>({
    name: user?.name || "",
    comment: "",
    rating: 0,
    userId: user?.id || "",
  });
  const [isNameInitialized, setIsNameInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    comment: false,
    stars: false,
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { data: reviews = [], isLoading, isError, refetch } = useReviews();
  const createReviewMutation = useCreateReview();
  const updateProfileMutation = useUpdateProfile();
  const { openModal } = useModal();

  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  // Newest first by date; reviews without a date keep the API order at the end
  const sortedReviews = useMemo(
    () =>
      reviews
        .map((review, index) => ({ review, index }))
        .sort((a, b) => {
          const ta = Date.parse(a.review.createdAt) || 0;
          const tb = Date.parse(b.review.createdAt) || 0;
          return tb - ta || b.index - a.index;
        })
        .map(({ review }) => review),
    [reviews],
  );

  const visibleReviews = sortedReviews.slice(0, visibleCount);
  const remaining = sortedReviews.length - visibleReviews.length;

  const average = useMemo(() => {
    const rated = reviews.filter((r) => r.rating > 0);
    if (!rated.length) return 0;
    return rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
  }, [reviews]);

  const averageText = new Intl.NumberFormat(toLocale(language), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average);

  const countText = t(`reviews_count_${pluralForm(reviews.length, language)}`, {
    n: reviews.length,
  });

  const showInfo = (kind: "success" | "error", text: string) => {
    setInfo({ kind, text });
    setTimeout(() => setInfo(null), 4000);
  };

  const scrollToForm = () => {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    // Land the form's top just below the sticky header
    const headerHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-height",
        ),
      ) || 0;
    const top =
      form.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });

    // Focus only after the scroll has finished, and not on touch screens:
    // the on-screen keyboard would resize the page and stop the scroll halfway
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let done = false;
    const focusName = () => {
      if (done) return;
      done = true;
      nameInputRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener("scrollend", focusName, { once: true });
    window.setTimeout(focusName, 900);
  };

  const handleAddReview = async () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }

    const newErrors = {
      name: newReview.name.trim() === "",
      comment: newReview.comment.trim() === "",
      stars: newReview.rating === 0,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setIsSubmitting(true);
      setInfo(null);

      if (newReview.name !== user?.name) {
        await updateProfileMutation.mutateAsync({ name: newReview.name });
      }
      await createReviewMutation.mutateAsync({
        comment: newReview.comment,
        rating: newReview.rating,
      });
      setNewReview({
        name: newReview.name,
        comment: "",
        rating: 0,
        userId: user?.id || "",
      });
      showInfo("success", t("review_added"));
    } catch (error) {
      console.error(error);
      showInfo("error", t("review_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview({ ...newReview, comment: e.target.value });
    if (errors.comment) setErrors((prev) => ({ ...prev, comment: false }));
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    if (user && !isNameInitialized) {
      setNewReview((prev) => ({
        ...prev,
        name: user.name || "",
        userId: user.id || "",
      }));
      setIsNameInitialized(true);
    }
  }, [user, isNameInitialized]);

  return (
    <>
      <GlowSection>
        <Glow />
        <SectionContainer>
          <SectionHeading
            level="h1"
            lead={t("reviews_lead")}
            accent={t("reviews_accent")}
          />

          <Layout>
            <ListColumn>
              {isAdmin && (
                <AdminLink to="/admin/reviews">
                  <Settings2 size={18} aria-hidden />
                  {t("admin_reviews")}
                </AdminLink>
              )}
              {!isLoading && !isError && reviews.length > 0 && (
                <Summary>
                  <SummaryScore>
                    <AverageValue>{averageText}</AverageValue>
                    <div>
                      <RatingStars
                        value={Math.round(average * 10) / 10}
                        size={20}
                        label={`${averageText} / 5`}
                      />
                      <SummaryCount>{countText}</SummaryCount>
                    </div>
                  </SummaryScore>
                  <JumpToForm type="button" onClick={scrollToForm}>
                    <PenLine size={18} aria-hidden />
                    {t("leave_review_short")}
                  </JumpToForm>
                </Summary>
              )}

              {isLoading ? (
                <ReviewList aria-busy="true" aria-label={t("loading")}>
                  {Array.from({ length: REVIEWS_PER_PAGE }, (_, i) => (
                    <ReviewCard key={i} aria-hidden>
                      <ReviewHeader>
                        <SkeletonBlock $w="44px" $h="44px" $round />
                        <SkeletonStack>
                          <SkeletonBlock
                            $w={i % 2 ? "96px" : "140px"}
                            $h="16px"
                          />
                          <SkeletonBlock $w="88px" $h="12px" />
                        </SkeletonStack>
                      </ReviewHeader>
                      <SkeletonStack $gap="10px">
                        <SkeletonBlock $w="100%" $h="14px" />
                        <SkeletonBlock $w={i % 2 ? "55%" : "72%"} $h="14px" />
                      </SkeletonStack>
                    </ReviewCard>
                  ))}
                </ReviewList>
              ) : isError ? (
                <EmptyCard role="alert">
                  <CardTitle>{t("reviews_load_error")}</CardTitle>
                  <RetryButton type="button" onClick={() => refetch()}>
                    {t("retry")}
                  </RetryButton>
                </EmptyCard>
              ) : visibleReviews.length === 0 ? (
                <EmptyCard>
                  <EmptyIcon aria-hidden>
                    <MessageSquareHeart size={28} />
                  </EmptyIcon>
                  <CardTitle>{t("reviews_empty_title")}</CardTitle>
                  <Muted>{t("reviews_empty_text")}</Muted>
                </EmptyCard>
              ) : (
                <ReviewList>
                  {visibleReviews.map((review, index) => (
                    <ReviewItem
                      key={review.id ?? index}
                      review={review}
                      language={language}
                    />
                  ))}
                </ReviewList>
              )}

              {!isLoading && remaining > 0 && (
                <ShowMore
                  type="button"
                  onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
                >
                  {t("show_more")}
                  <ShowMoreCount>{remaining}</ShowMoreCount>
                </ShowMore>
              )}
            </ListColumn>

            <FormCard
              id={FORM_ID}
              onSubmit={(e) => {
                e.preventDefault();
                handleAddReview();
              }}
              noValidate
            >
              <CardTitle>{t("leave_review")}</CardTitle>

              {!isAuthenticated && (
                <LoginHint>
                  <p>{t("review_login_hint")}</p>
                  <LoginButton type="button" onClick={() => openModal()}>
                    <LogIn size={18} aria-hidden />
                    {t("login_action")}
                  </LoginButton>
                </LoginHint>
              )}

              <Field>
                <FieldLabel htmlFor="review-name">
                  {label(t("your_name_label"))}
                </FieldLabel>
                <TextInput
                  ref={nameInputRef}
                  type="text"
                  id="review-name"
                  autoComplete="name"
                  value={newReview.name}
                  onChange={(e) => {
                    setNewReview({ ...newReview, name: e.target.value });
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder={t("your_name_placeholder")}
                  $invalid={errors.name}
                  aria-invalid={errors.name}
                  aria-describedby={
                    errors.name ? "review-name-error" : undefined
                  }
                />
                {errors.name && (
                  <ErrorText id="review-name-error" role="alert">
                    {t("name_required")}
                  </ErrorText>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="review-comment">
                  {label(t("your_review_label"))}
                </FieldLabel>
                <TextArea
                  id="review-comment"
                  value={newReview.comment}
                  placeholder={t("your_review_placeholder")}
                  onChange={handleInput}
                  rows={3}
                  $invalid={errors.comment}
                  aria-invalid={errors.comment}
                  aria-describedby={
                    errors.comment ? "review-comment-error" : undefined
                  }
                />
                {errors.comment && (
                  <ErrorText id="review-comment-error" role="alert">
                    {t("comment_required")}
                  </ErrorText>
                )}
              </Field>

              <Field>
                <FieldLabel as="span" id="review-rating-label">
                  {label(t("rating_label"))}
                </FieldLabel>
                <RatingInput
                  value={newReview.rating}
                  labelId="review-rating-label"
                  errorId="review-rating-error"
                  invalid={errors.stars}
                  onChange={(rating) => {
                    setNewReview((prev) => ({ ...prev, rating }));
                    if (errors.stars)
                      setErrors((prev) => ({ ...prev, stars: false }));
                  }}
                />
                {errors.stars && (
                  <ErrorText id="review-rating-error" role="alert">
                    {t("rating_required")}
                  </ErrorText>
                )}
              </Field>

              {info && (
                <InfoBox role="status" $kind={info.kind}>
                  {info.text}
                </InfoBox>
              )}

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("sending") : t("add_review")}
              </SubmitButton>
            </FormCard>
          </Layout>
        </SectionContainer>
      </GlowSection>
      <BookNow language={language} />
    </>
  );
};

export default ReviewsPage;

/* ---------- summary & list controls ---------- */

const Summary = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
`;

const SummaryScore = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
`;

const AverageValue = styled.span<{ theme?: ThemeType }>`
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 2rem + 2vw, 3.25rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: ${(props) => props.theme.colors.text};
`;

const SummaryCount = styled.p<{ theme?: ThemeType }>`
  margin-top: 4px;
  font-size: var(--text-sm);
  color: ${(props) => props.theme.colors.text};
  opacity: 0.7;
`;

/* Only on narrow screens, where the form sits below the whole list */
const JumpToForm = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 20px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--color-primary);
    color: #fff;
  }

  @media screen and (min-width: 960px) {
    display: none;
  }
`;

const ShowMore = styled.button<{ theme?: ThemeType }>`
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--surface-border);
  background: var(--surface-glass);
  color: ${(props) => props.theme.colors.text};
  font-weight: 700;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
  }
`;

const ShowMoreCount = styled.span`
  min-width: 24px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-primary);
  font-size: var(--text-sm);
`;

const LoginHint = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: ${(props) => props.theme.colors.text};
  line-height: 1.5;
`;

const LoginButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 20px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-weight: 700;

  &:hover {
    background-color: var(--color-primary-hover);
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  align-items: start;

  @media screen and (min-width: 960px) {
    grid-template-columns: 1.35fr 1fr;
  }
`;

const ListColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
`;

const ReviewList = styled.ul`
  list-style: none;
  display: grid;
  gap: var(--space-4);
`;

/* ---------- loading skeleton ---------- */

const EmptyCard = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-6);
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 10px 24px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-weight: 700;

  &:hover {
    background-color: var(--color-primary-hover);
  }
`;

const EmptyIcon = styled.div`
  ${iconTile(64)}
`;

const Muted = styled.p<{ theme?: ThemeType }>`
  max-width: 40ch;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.75;
`;

const CardTitle = styled.h2<{ theme?: ThemeType }>`
  ${(props) => cardTitle(props.theme as ThemeType)}
`;

/* ---------- form ---------- */

const FormCard = styled.form<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  scroll-margin-top: calc(var(--header-height) + var(--space-4));

  @media screen and (min-width: 960px) {
    position: sticky;
    top: calc(var(--header-height) + var(--space-5));
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const FieldLabel = styled.label<{ theme?: ThemeType }>`
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

const fieldStyles = (theme: ThemeType, invalid: boolean) => `
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid ${invalid ? "#d64545" : theme.colors.border};
  background: transparent;
  color: ${theme.colors.text};
  font-size: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${theme.colors.text};
    opacity: 0.5;
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-ring);
  }
`;

const TextInput = styled("input", {
  shouldForwardProp: (prop) => prop !== "$invalid",
})<{ $invalid: boolean; theme?: ThemeType }>`
  ${(props) => fieldStyles(props.theme as ThemeType, props.$invalid)}
`;

const TextArea = styled("textarea", {
  shouldForwardProp: (prop) => prop !== "$invalid",
})<{ $invalid: boolean; theme?: ThemeType }>`
  ${(props) => fieldStyles(props.theme as ThemeType, props.$invalid)}
  min-height: 110px;
  resize: vertical;
`;

const ErrorText = styled.p`
  color: #d64545;
  font-size: var(--text-sm);
  font-weight: 600;
`;

const InfoBox = styled.p<{ $kind: "success" | "error"; theme?: ThemeType }>`
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  color: ${(props) =>
    props.$kind === "error" ? "#d64545" : props.theme.colors.text};
  background: ${(props) =>
    props.$kind === "error"
      ? "rgba(214, 69, 69, 0.1)"
      : "color-mix(in srgb, var(--color-primary) 12%, transparent)"};
`;

const SubmitButton = styled.button`
  padding: 16px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-size: var(--text-lg);
  font-weight: 700;
  box-shadow: 0 12px 28px -10px var(--color-primary-shadow);
  transition:
    background-color 0.2s ease,
    transform 0.2s var(--ease-out);

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const AdminLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  font-weight: 700;
  transition: background-color 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
`;
