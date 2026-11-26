import { useEffect, useState } from "react";

import styled from "@emotion/styled";
import { MessageSquareHeart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SectionContainer } from "../../App";
import BookNow from "../../components/BookNow";
import { Loader } from "../../components/Loader";
import { SectionHeading } from "../../components/SectionHeading";
import { Glow, GlowSection } from "../../components/SectionHeading/Glow";

import { useModal } from "../../context/ModalContext";
import { cardSurface, cardTitle, iconTile } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

import { useProfile, useUpdateProfile } from "../../hooks/useAuth";
import { useCreateReview, useReviews } from "../../hooks/useReviews";

import { Review } from "./types";

const REVIEWS_PER_PAGE = 4;

/** Labels in the translations end with ":"; drop it to match other forms */
const label = (text: string) => text.replace(/:\s*$/, "");

const ReviewsPage = ({ language }: { language: string }) => {
  const [t] = useTranslation();
  const { data: user } = useProfile();
  const isAuthenticated = !!user;
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

  const { data: reviews = [], isLoading, isError, refetch } = useReviews();
  const createReviewMutation = useCreateReview();
  const updateProfileMutation = useUpdateProfile();
  const { openModal } = useModal();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  const showInfo = (kind: "success" | "error", text: string) => {
    setInfo({ kind, text });
    setTimeout(() => setInfo(null), 4000);
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
        name: newReview.name,
        comment: newReview.comment,
        rating: newReview.rating,
        userId: user?.id || "",
      });
      setNewReview({
        name: newReview.name,
        comment: "",
        rating: 0,
        userId: user?.id || "",
      });
      showInfo("success", t("review_added"));
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      showInfo("error", t("review_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview({ ...newReview, comment: e.target.value });
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const sortedReviews = [...reviews].reverse();
  const currentReviews = sortedReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
              {isLoading ? (
                <Loader />
              ) : isError ? (
                <EmptyCard role="alert">
                  <CardTitle>{t("reviews_load_error")}</CardTitle>
                  <RetryButton type="button" onClick={() => refetch()}>
                    {t("retry")}
                  </RetryButton>
                </EmptyCard>
              ) : currentReviews.length === 0 ? (
                <EmptyCard>
                  <EmptyIcon aria-hidden>
                    <MessageSquareHeart size={28} />
                  </EmptyIcon>
                  <CardTitle>{t("reviews_empty_title")}</CardTitle>
                  <Muted>{t("reviews_empty_text")}</Muted>
                </EmptyCard>
              ) : (
                <ReviewList>
                  {currentReviews.map((review, index) => (
                    <ReviewCard key={review.id ?? index}>
                      <ReviewHeader>
                        <Avatar aria-hidden>
                          {(review.user?.name || "?").trim().charAt(0)}
                        </Avatar>
                        <div>
                          <UserName>{review.user?.name}</UserName>
                          <Stars aria-label={`${review.rating} / 5`}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={16}
                                aria-hidden
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                                strokeWidth={i < review.rating ? 0 : 1.6}
                              />
                            ))}
                          </Stars>
                        </div>
                      </ReviewHeader>
                      <ReviewText>{review.comment}</ReviewText>
                    </ReviewCard>
                  ))}
                </ReviewList>
              )}

              {totalPages > 1 && (
                <Pagination aria-label="Pagination">
                  <PageButton
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </PageButton>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PageButton
                      type="button"
                      key={i}
                      $active={currentPage === i + 1}
                      aria-current={currentPage === i + 1 ? "page" : undefined}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </PageButton>
                  ))}
                  <PageButton
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    ›
                  </PageButton>
                </Pagination>
              )}
            </ListColumn>

            <FormCard
              onSubmit={(e) => {
                e.preventDefault();
                handleAddReview();
              }}
              noValidate
            >
              <CardTitle>{t("leave_review")}</CardTitle>

              <Field>
                <FieldLabel htmlFor="review-name">
                  {label(t("your_name_label"))}
                </FieldLabel>
                <TextInput
                  type="text"
                  id="review-name"
                  autoComplete="name"
                  value={newReview.name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, name: e.target.value })
                  }
                  placeholder={t("your_name_placeholder")}
                  $invalid={errors.name}
                  aria-invalid={errors.name}
                />
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
                />
              </Field>

              <Field>
                <FieldLabel as="span">{label(t("rating_label"))}</FieldLabel>
                <RatingRow role="radiogroup" aria-label={t("rating_label")}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <RatingStar
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={newReview.rating === i + 1}
                      aria-label={`${i + 1} / 5`}
                      $on={i < newReview.rating}
                      onClick={() =>
                        setNewReview((prev) => ({ ...prev, rating: i + 1 }))
                      }
                    >
                      <Star
                        size={30}
                        aria-hidden
                        fill={i < newReview.rating ? "currentColor" : "none"}
                      />
                    </RatingStar>
                  ))}
                </RatingRow>
                {errors.stars && (
                  <ErrorText role="alert">{t("rating_required")}</ErrorText>
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

const STAR_GOLD = "#e9b949";

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

const ReviewCard = styled.li<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  padding: var(--space-5) var(--space-6);
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--gradient-accent);
  color: #fff;
  font-weight: 800;
  font-size: var(--text-lg);
  text-transform: uppercase;
`;

const UserName = styled.p<{ theme?: ThemeType }>`
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 2px;
  color: ${STAR_GOLD};
`;

const ReviewText = styled.p<{ theme?: ThemeType }>`
  line-height: 1.7;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.85;
  white-space: pre-line;
  overflow-wrap: anywhere;
`;

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

const Pagination = styled.nav`
  display: flex;
  justify-content: center;
  gap: var(--space-2);
`;

const PageButton = styled.button<{ $active?: boolean; theme?: ThemeType }>`
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-primary)" : "var(--surface-border)"};
  background: ${(props) =>
    props.$active ? "var(--color-primary)" : "var(--surface-glass)"};
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  font-weight: 700;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

/* ---------- form ---------- */

const FormCard = styled.form<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);

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

const RatingRow = styled.div`
  display: flex;
  gap: var(--space-1);
`;

const RatingStar = styled.button<{ $on: boolean; theme?: ThemeType }>`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  color: ${(props) => (props.$on ? STAR_GOLD : props.theme.colors.text)};
  opacity: ${(props) => (props.$on ? 1 : 0.35)};
  transition:
    transform 0.15s ease,
    opacity 0.15s ease,
    color 0.15s ease;

  &:hover {
    transform: scale(1.12);
    opacity: 1;
    color: ${STAR_GOLD};
  }
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
