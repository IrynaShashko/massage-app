import { useEffect, useState } from "react";

import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { onValue, ref } from "firebase/database";
import { database, writeReview, writeReviewToFirestore } from "../../firebase";

import { nanoid } from "nanoid";

import { ReactComponent as StarSvg } from "../../icons/star.svg";
import { ReactComponent as StarActiveSvg } from "../../icons/starActive.svg";

import { Contacts } from "../../components/Contacts";
import { Container } from "../../App";
import { IconStyled } from "../../components/ConnectionButton";
import { Label } from "../../components/ConnectionForm";

import { Review } from "./types";

export const ReviewsPage = () => {
  const [t] = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<Review>({
    name: "",
    comment: "",
    totalPositiveStars: 0,
    timestamp: new Date(),
  });
  const [errors, setErrors] = useState<{
    name: boolean;
    comment: boolean;
    stars: boolean;
  }>({
    name: false,
    comment: false,
    stars: false,
  });

  const fetchReviews = () => {
    const reviewsRef = ref(database, "reviews");
    onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      const reviewsList = data
        ? Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }))
        : [];

      reviewsList.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });
      setReviews(reviewsList);
    });
  };
  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAddReview = async () => {
    const { name, comment, totalPositiveStars } = newReview;

    setErrors({
      name: !name,
      comment: !comment,
      stars: totalPositiveStars === 0,
    });

    if (!name || !comment || totalPositiveStars === 0) {
      return;
    }

    const timestamp = new Date().getTime();

    try {
      await writeReview(
        newReview.comment,
        `${nanoid()}`,
        newReview.name,
        newReview.totalPositiveStars,
        timestamp,
      );
      await writeReviewToFirestore(
        newReview.comment,
        newReview.name,
        newReview.totalPositiveStars,
        timestamp,
      );
    } catch (error) {
      console.error("Error writing review to database:", error);
    }

    setNewReview({
      name: "",
      comment: "",
      totalPositiveStars: 0,
      timestamp: new Date(),
    });
  };

  const handleStarClick = (stars: number) => {
    setNewReview((prevReview) => ({
      ...prevReview,
      totalPositiveStars: stars,
    }));
  };

  return (
    <>
      <ReviewsContainer>
        <Container>
          <ReviewsWrapper>
            <ReviewList>
              {reviews.map((review, index) => (
                <ReviewItem key={index}>
                  <TitleDiv>
                    <UserIconDiv>
                      <UserName>{review.name}</UserName>
                      <Stars>
                        {Array.from({ length: 5 }, (_, i) => (
                          <StarIconStyled
                            key={i}
                            as={
                              i < review.totalPositiveStars
                                ? StarActiveSvg
                                : StarSvg
                            }
                          />
                        ))}
                      </Stars>
                    </UserIconDiv>
                  </TitleDiv>
                  <ScrollableText>
                    <Text>{review.comment}</Text>
                  </ScrollableText>
                </ReviewItem>
              ))}
            </ReviewList>

            <FeedbackForm>
              <FormTitle>{t("leave_review")}</FormTitle>
              <Label htmlFor="name">
                {t("your_name_label")}
                <Input
                  type="text"
                  id="name"
                  value={newReview.name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, name: e.target.value })
                  }
                  placeholder={t("your_name_placeholder")}
                  required
                  style={{
                    borderColor: errors.name ? "red" : "#ccc",
                  }}
                />
              </Label>
              <Label htmlFor="comment">
                {t("your_review_label")}
                <Comment
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  placeholder={t("your_review_placeholder")}
                  required
                  style={{
                    borderColor: errors.comment ? "red" : "#ccc",
                  }}
                />
              </Label>
              <StarsWrapper>
                <span>{t("rating_label")}</span>
                <StarsRating>
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIconStyled
                      key={i}
                      as={
                        i < newReview.totalPositiveStars
                          ? StarActiveSvg
                          : StarSvg
                      }
                      onClick={() => handleStarClick(i + 1)}
                    />
                  ))}
                </StarsRating>
                {errors.stars && <ErrorText>{t("rating_required")}</ErrorText>}
              </StarsWrapper>
              <button onClick={handleAddReview}>{t("add_review")}</button>
            </FeedbackForm>
          </ReviewsWrapper>
        </Container>
      </ReviewsContainer>
      <Contacts />
    </>
  );
};

const ReviewsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(props) => props.theme.colors.aboutBg};
  padding: 30px;
  justify-content: center;
`;

const ReviewList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
  @media screen and (min-width: 769px) {
    max-width: 50vw;
  }
`;

const ReviewItem = styled.li`
  background-color: ${(props) => props.theme.colors.cardBg};
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px ${(props) => props.theme.colors.boxShadow};
`;

const TitleDiv = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const UserIconDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 10px;
`;

const UserName = styled.p`
  color: #007586;
  font-size: 18px;
  margin-bottom: 5px;
`;

const Stars = styled.div`
  display: flex;
  justify-content: center;
  color: orange;
`;

const ScrollableText = styled.div`
  max-height: 230px;
  overflow-y: auto;
`;

const Text = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  @media screen and (min-width: 768px) {
    font-size: 18px;
  }
`;

const ReviewsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column-reverse;
  gap: 20px;

  @media screen and (min-width: 700px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const FeedbackForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBg};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px ${(props) => props.theme.colors.boxShadow};
  padding: 30px;
  height: fit-content;
  @media screen and (min-width: 768px) {
    width: 50vw;
  }

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
    border-color: #007586;
    outline: none;
  }

  button {
    padding: 12px;
    font-size: 16px;
    background-color: #007586;
    color: ${(props) => props.theme.colors.text};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;

    &:hover {
      background-color: #005f72;
    }
  }
`;

const FormTitle = styled.h4`
  font-size: 20px;
  margin-bottom: 15px;
  color: #007586;
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
  color: orange;
  cursor: pointer;
`;

const ErrorText = styled.span`
  color: red;
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
  box-sizing: border-box;
`;

const StarIconStyled = styled(IconStyled)`
  width: 20px;
  height: 20px;
`;
