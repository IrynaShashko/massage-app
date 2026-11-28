import styled from "@emotion/styled";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { SectionContainer } from "../../App";
import { Review, useDeleteReview, useReviews } from "../../hooks/useReviews";
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
} from "../AdminArticlesPage/shared";
import { formatDate, RatingStars } from "../ReviewsPage/ReviewItem";
import { SkeletonRows } from "../../components/Skeleton";

const ReviewList = () => {
  const [t, i18n] = useTranslation();
  const navigate = useNavigate();
  const { data: reviews = [], isLoading, isError } = useReviews();
  const deleteMutation = useDeleteReview();

  const handleDelete = (review: Review) => {
    const name = review.user.name || "—";
    if (!window.confirm(t("admin_confirm_delete_review", { name }))) return;
    deleteMutation.mutate(review.id);
  };

  return (
    <SectionContainer>
      <TopBar>
        <PageTitle>{t("admin_reviews")}</PageTitle>
        <TopActions>
          <GhostLink to="/reviews">
            <ArrowLeft size={16} aria-hidden />
            {t("admin_to_reviews")}
          </GhostLink>
          <PrimaryButton
            type="button"
            onClick={() => navigate("/admin/reviews/new")}
          >
            <Plus size={18} aria-hidden />
            {t("admin_new_review")}
          </PrimaryButton>
        </TopActions>
      </TopBar>

      <Card>
        {isLoading && <SkeletonRows count={4} body actions={2} />}
        {isError && <ErrorText>{t("reviews_load_error")}</ErrorText>}
        {deleteMutation.isError && (
          <ErrorText>{t("admin_delete_error")}</ErrorText>
        )}
        {!isLoading && !isError && reviews.length === 0 && (
          <p>{t("reviews_empty_title")}</p>
        )}

        <Rows>
          {reviews.map((review) => (
            <Row key={review.id}>
              <RowMain>
                <RowHead>
                  <strong>{review.user.name || "—"}</strong>
                  <RatingStars value={review.rating} />
                  <Muted>{formatDate(review.createdAt, i18n.language)}</Muted>
                  {review.userId && (
                    <Badge title={t("admin_review_from_site_hint")}>
                      {t("admin_review_from_site")}
                    </Badge>
                  )}
                </RowHead>
                <Comment>{review.comment}</Comment>
              </RowMain>
              <Actions>
                <GhostLink to={`/admin/reviews/${review.id}`}>
                  <Pencil size={16} aria-hidden />
                  {t("admin_edit")}
                </GhostLink>
                <GhostButton
                  type="button"
                  $danger
                  onClick={() => handleDelete(review)}
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

const AdminReviewsPage = () => (
  <AdminOnly>
    <ReviewList />
  </AdminOnly>
);

export default AdminReviewsPage;

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
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

const RowMain = styled.div`
  flex: 1 1 320px;
  min-width: 0;
`;

const RowHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  overflow-wrap: anywhere;
`;

const Muted = styled.span`
  font-size: var(--text-sm);
  opacity: 0.7;
`;

const Badge = styled.span`
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
`;

/* three lines in the list; the full text is in the editor */
const Comment = styled.p`
  margin-top: var(--space-2);
  line-height: 1.55;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Actions = styled.div`
  display: flex;
  gap: var(--space-2);
`;
