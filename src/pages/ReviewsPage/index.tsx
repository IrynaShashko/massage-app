import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Container } from "../../App";
import { IconStyled } from "../../components/ConnectionButton";
import { Label } from "../../components/ConnectionForm";
import { Loader } from "../../components/Loader";
import { ReactComponent as StarSvg } from "../../icons/star.svg";
import { ReactComponent as StarActiveSvg } from "../../icons/starActive.svg";
import dotArrowRight from "../../images/dotArrowRight.png";
import reviewImage from "../../images/flowers.png";

import BookNow from "../../components/BookNow";
import { useModal } from "../../context/ModalContext";
import { useProfile, useUpdateProfile } from "../../hooks/useAuth";
import { useCreateReview, useReviews } from "../../hooks/useReviews";
import { Review } from "./types";

const ReviewsPage = ({ language }: { language: string }) => {
  const [t] = useTranslation();
  const { data: user } = useProfile();
  const isAuthenticated = !!user;
  const [info, setInfo] = useState<string>("");
  const [newReview, setNewReview] = useState<Review>({
    name: user?.name || "",
    comment: "",
    rating: 0,
    userId: user?.id || "",
  });
  const [isNameInitialized, setIsNameInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name: boolean;
    comment: boolean;
    stars: boolean;
  }>({
    name: false,
    comment: false,
    stars: false,
  });

  const { data: reviews = [], isLoading } = useReviews();
  const createReviewMutation = useCreateReview();
  const updateProfileMutation = useUpdateProfile();

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const { openModal } = useModal();

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
      setInfo("");

      if (newReview.name !== user?.name) {
        await updateProfileMutation.mutateAsync({
          name: newReview.name,
        });
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
      setInfo("Відгук успішно додано!");
      setTimeout(() => setInfo(""), 2000);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      setInfo("Сталася помилка при додаванні відгуку.");
      setTimeout(() => setInfo(""), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (stars: number) => {
    setNewReview((prev) => ({ ...prev, rating: stars }));
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview({ ...newReview, comment: e.target.value });
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const sortedReviews = [...reviews].reverse();

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sortedReviews.slice(
    indexOfFirstReview,
    indexOfLastReview,
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
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <ReviewsContainer>
            <Container>
              <ReviewsWrapper>
                <LeftColumn>
                  <ReviewList>
                    {currentReviews.map((review, index) => (
                      <ReviewItem key={index}>
                        <UserName>{review.user.name}</UserName>
                        <UserIconDiv>
                          <StarsContainer>
                            <Stars>
                              {Array.from({ length: 5 }, (_, i) => (
                                <StarIconStyled
                                  key={i}
                                  as={
                                    i < review.rating ? StarActiveSvg : StarSvg
                                  }
                                />
                              ))}
                            </Stars>
                            <ImageStyled src={reviewImage} alt="Review Image" />
                          </StarsContainer>
                        </UserIconDiv>
                        <Text>{review.comment}</Text>
                      </ReviewItem>
                    ))}
                  </ReviewList>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination>
                      <PageButton
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        {"<"}
                      </PageButton>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PageButton
                          key={i}
                          $active={currentPage === i + 1}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </PageButton>
                      ))}
                      <PageButton
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        {">"}
                      </PageButton>
                    </Pagination>
                  )}
                </LeftColumn>

                <FeedbackForm>
                  <DecorativeElementTopRight />
                  <FormTitle>{t("leave_review")}</FormTitle>
                  <Label htmlFor="name">{t("your_name_label")}</Label>
                  <Input
                    type="text"
                    id="name"
                    value={newReview.name}
                    onChange={(e) =>
                      setNewReview({ ...newReview, name: e.target.value })
                    }
                    placeholder={t("your_name_placeholder")}
                    required
                    style={{ borderColor: errors.name ? "red" : "#ccc" }}
                  />
                  <Label htmlFor="comment">{t("your_review_label")}</Label>
                  <Comment
                    id="comment"
                    value={newReview.comment}
                    placeholder={t("your_review_placeholder")}
                    required
                    onChange={handleInput}
                    rows={1}
                    style={{ borderColor: errors.comment ? "red" : "#ccc" }}
                  />
                  <StarsWrapper>
                    <RatingLabel>{t("rating_label")}</RatingLabel>
                    <StarsRating>
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIconStyled
                          key={i}
                          as={i < newReview.rating ? StarActiveSvg : StarSvg}
                          onClick={() => handleStarClick(i + 1)}
                        />
                      ))}
                    </StarsRating>
                    {errors.stars && (
                      <ErrorText>{t("rating_required")}</ErrorText>
                    )}
                  </StarsWrapper>
                  {info && <p>{info}</p>}
                  <button onClick={handleAddReview} disabled={isSubmitting}>
                    {isSubmitting ? "Відправка..." : t("add_review")}
                  </button>
                </FeedbackForm>
              </ReviewsWrapper>
            </Container>
          </ReviewsContainer>
          <BookNow language={language} />
        </>
      )}
    </>
  );
};

export default ReviewsPage;

const ReviewsContainer = styled.div`
  background-color: ${(props) => props.theme.colors.aboutBg};
  padding: 30px;
  justify-content: center;
  min-height: calc(100vh - 80px);
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: calc(100vh - 120px);
`;

const DecorativeElementTopRight = styled.div`
  position: absolute;
  right: -4%;
  bottom: -12%;
  width: 150px;
  height: 150px;
  background-image: url(${dotArrowRight});
  background-size: contain;
  background-repeat: no-repeat;
  z-index: -1;
  @media screen and (min-width: 1024px) {
    right: -8%;
    bottom: -12%;
  }
`;

const ReviewList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 24px;
  padding: 0;
  margin: 0;
  height: 100%;
`;

const ReviewItem = styled.li`
  background: ${(props) => props.theme.colors.cardBg};
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 10px 25px ${(props) => props.theme.colors.boxShadow};
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 35px ${(props) => props.theme.colors.boxShadow};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  gap: 8px;
  margin-top: auto;
  padding-top: 20px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #007586;
  background-color: ${({ $active }) => ($active ? "#007586" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#007586")};
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StarsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ImageStyled = styled.img`
  width: auto;
  height: 40px;
  object-fit: cover;
  align-self: flex-end;
  cursor: pointer;
  @media screen and (min-width: 768px) {
    height: 50px;
  }
`;

const UserIconDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

const Stars = styled.div`
  color: #faf32e;
`;

const Text = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  @media screen and (min-width: 768px) {
    font-size: 18px;
  }
`;

const ReviewsWrapper = styled.div`
  display: grid;
  width: 100%;
  gap: 40px;

  @media screen and (min-width: 900px) {
    grid-template-columns: 1fr 420px;
    align-items: stretch;
  }
`;

const FeedbackForm = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBg};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px ${(props) => props.theme.colors.boxShadow};
  padding: 30px;
  height: fit-content;

  input,
  textarea {
    margin-bottom: 15px;
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #ccc;
    transition: border 0.3s ease;
  }

  input:focus,
  textarea:focus {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 95, 114, 0.1);
    outline: none;
  }

  button {
    padding: 14px;
    font-size: 16px;
    font-weight: 600;
    background: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.buttonText};
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.25s ease;
    margin-top: 10px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
  }
`;

const FormTitle = styled.h4`
  font-size: 20px;
  margin-bottom: 15px;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
`;

const StarsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const StarsRating = styled.div`
  display: flex;
  gap: 5px;
  color: #faf32e;
  cursor: pointer;
`;

const ErrorText = styled.span`
  color: #a11818;
  font-size: 12px;
  margin-top: 5px;
`;

const Input = styled.input`
  color: ${(props) => props.theme.colors.text};
  border-color: ${(errors) => (errors ? "red" : "#ccc")};
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
`;

const Comment = styled.textarea`
  color: ${(props) => props.theme.colors.text};
  border-color: ${(errors) => (errors ? "red" : "#ccc")};
  resize: vertical;
  width: 100%;
  min-height: 100px;
  max-height: 700px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 10px;
  height: auto;
`;

const StarIconStyled = styled(IconStyled)`
  width: 20px;
  height: 20px;
`;

const RatingLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${(props) => props.theme.colors.text};
`;
