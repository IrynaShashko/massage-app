import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Container } from "../../App";
import { IconStyled } from "../../components/ConnectionButton";
import { Label } from "../../components/ConnectionForm";
import { Contacts } from "../../components/Contacts";
import { Loader } from "../../components/Loader";
import {
  auth,
  database,
  writeReview,
  writeReviewToFirestore,
} from "../../firebase";
import { ReactComponent as StarSvg } from "../../icons/star.svg";
import { ReactComponent as StarActiveSvg } from "../../icons/starActive.svg";
import circleRight from "../../images/circleRight.png";
import dotArrowRight from "../../images/dotArrowRight.png";
import reviewImage from "../../images/flowers.png";
import leftCircle from "../../images/leftCircle.png";

import { Review } from "./types";

const ReviewsPage = () => {
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthState = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user);
        setIsAuthenticated(true);
      } else {
        console.log("No user logged in");
        setIsAuthenticated(false);
      }
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

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
    if (!isAuthenticated) {
      alert("Please sign in to add a review");
      return;
    }

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

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview({ ...newReview, comment: event.target.value });
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
    <>
      {!reviews.length ? (
        <Loader />
      ) : (
        <ReviewDecContainer>
          <DecorativeElementLeft />
          <DecorativeElementBottomRight />
          <ReviewsContainer>
            <Container>
              <ReviewsWrapper>
                <ReviewList>
                  {reviews.map((review, index) => (
                    <ReviewItem key={index}>
                      <UserName>{review.name}</UserName>
                      <UserIconDiv>
                        <StarsContainer>
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
                          <ImageStyled src={reviewImage} alt="Review Image" />
                        </StarsContainer>
                      </UserIconDiv>
                      <Text>{review.comment}</Text>
                    </ReviewItem>
                  ))}
                </ReviewList>
                <FeedbackForm>
                  <DecorativeElementTopRight />
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
                      placeholder={t("your_review_placeholder")}
                      required
                      onChange={handleInput}
                      rows={1}
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
                    {errors.stars && (
                      <ErrorText>{t("rating_required")}</ErrorText>
                    )}
                  </StarsWrapper>
                  {isAuthenticated && (
                    <button onClick={handleAddReview}>{t("add_review")}</button>
                  )}
                  {!isAuthenticated && (
                    <button onClick={signInWithGoogle}>
                      {t("add_review")}
                    </button>
                  )}
                </FeedbackForm>
              </ReviewsWrapper>
            </Container>
          </ReviewsContainer>
        </ReviewDecContainer>
      )}
      <Contacts />
    </>
  );
};

export default ReviewsPage;

const ReviewDecContainer = styled.div`
  position: relative;
`;

const ReviewsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(props) => props.theme.colors.aboutBg};
  padding: 30px;
  justify-content: center;
`;

const DecorativeElementLeft = styled.div`
  position: absolute;
  left: 0;
  top: 40%;
  width: 300px;
  height: 700px;
  background-image: url(${leftCircle});
  background-size: contain;
  background-repeat: no-repeat;
  transform: translateY(-70%);
  @media screen and (min-width: 768px) {
    width: 500px;
    height: 1000px;
  }
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

const DecorativeElementBottomRight = styled.div`
  position: absolute;
  right: 5%;
  bottom: 10%;
  width: 400px;
  height: 400px;
  background-image: url(${circleRight});
  background-size: contain;
  background-repeat: no-repeat;
  @media screen and (min-width: 768px) {
    bottom: 15%;
    width: 700px;
    height: 700px;
  }
`;

const ReviewList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
  @media screen and (min-width: 768px) {
    width: 50%;
  }
`;

const ReviewItem = styled.li`
  background-color: ${(props) => props.theme.colors.cardBg};
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px ${(props) => props.theme.colors.boxShadow};
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
  padding-bottom: 10px;
`;

const UserName = styled.p`
  color: ${(props) => props.theme.colors.aboutText};
  font-size: 18px;
  margin-bottom: 5px;
  z-index: 3;
  max-width: 260px;
  word-wrap: break-word;
  white-space: normal;
  @media screen and (min-width: 425px) {
    max-width: 340px;
  }
  @media screen and (min-width: 1024px) {
    max-width: 500px;
  }
`;

const Stars = styled.div`
  color: orange;
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
  justify-content: center;
  @media screen and (min-width: 700px) {
    flex-direction: row;
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
  @media screen and (min-width: 768px) {
    width: 45%;
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
    border-color: ${(props) => props.theme.colors.primary};
    outline: none;
  }

  button {
    padding: 12px;
    font-size: 16px;
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.buttonText};
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
  color: orange;
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
