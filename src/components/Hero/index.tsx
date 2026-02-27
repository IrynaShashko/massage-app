import { FC } from "react";

import styled from "@emotion/styled";
import { motion, Variants, easeOut } from "framer-motion";

import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

import { ThemeType } from "../../theme/theme";

import bg from "../../images/10.jpg";

import { PhoneButton } from "../PhoneButton/PhoneButton";

import { HeroPropsType } from "./types";

export const Hero: FC<HeroPropsType> = ({ language }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  const [t] = useTranslation();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const handleBookNowButton = () => {
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <PhoneButton />
      <PageContainer>
        <Gradient />
        <Content
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Title variants={itemVariants}>{t("welcome")}</Title>

          <TextContainer
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={animationElement}
            ref={ref}
            custom={1}
          >
            <Text variants={animationElement} custom={3}>
              {t("hereYouCan")}
            </Text>

            <Text variants={animationElement} custom={4}>
              {"✔ "}
              {t("harmony")}
            </Text>

            <Text variants={animationElement} custom={5}>
              {"✔ "}
              {t("balance")}
            </Text>

            <Text variants={animationElement} custom={6}>
              {"✔ "}
              {t("stressRelief")}
            </Text>

            <Text variants={animationElement} custom={7}>
              {"✔ "}
              {t("painRelief")}
            </Text>

            <Text variants={animationElement} custom={8}>
              {"✔ "}
              {t("restoreFunction")}
            </Text>
          </TextContainer>

          <StyledButton onClick={handleBookNowButton}>
            <p>{t("cta_button")}</p>
            <ChevronDown />
          </StyledButton>
        </Content>
      </PageContainer>
    </>
  );
};

const Content = styled(motion.div)`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  padding: 0 20px;
  max-width: 300px;
  margin: 0 auto;
  padding: 80px 0;
  gap: 2rem;
  @media screen and (min-width: 600px) {
    max-width: 350px;
  }
  @media screen and (min-width: 769px) {
    max-width: 500px;
  }
  @media screen and (min-width: 1024px) {
    max-width: 600px;
  }
  @media screen and (min-width: 1280px) {
    max-width: 1000px;
  }
`;

const Title = styled(motion.h1)`
  font-size: 2rem;
  /* font-weight: 700; */
  line-height: 1.1;
  letter-spacing: 0.05em;
  font-weight: lighter;
  font-family: "Great Vibes", cursive;
  @media screen and (min-width: 1024px) {
    font-size: 2.5rem;
  }
  @media screen and (min-width: 1280px) {
    font-size: 4.5rem;
  }
`;

export const TextContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 3;
  & p:not(:last-child) {
    margin-bottom: 10px;
    @media screen and (min-width: 1440px) {
      margin-bottom: 20px;
    }
  }
`;

export const Text = styled(motion.p)<{ theme?: ThemeType }>`
  font-size: 18px;
  color: ${(props) => props.theme.colors.heroText};
  display: flex;
  text-align: center;
  align-items: center;
  max-width: 300px;
  flex-direction: row;
  display: inline-flex;
  align-items: flex-start;

  @media screen and (min-width: 425px) {
    max-width: 500px;
  }
  @media screen and (min-width: 768px) {
    line-height: 30px;
    font-size: 25px;
    max-width: 700px;
  }
  @media screen and (min-width: 1024px) {
    line-height: 20px;
    max-width: 800px;
  }
`;

const StyledButton = styled.button`
  background-color: #007586;
  color: white;
  padding: 18px 48px;
  border-radius: 9999px;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  gap: 12px;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px -5px rgba(0, 117, 134, 0.4);

  &:hover {
    background-color: #005f6e;
    transform: scale(1.05);
  }
`;

const animationElement: Variants = {
  hidden: {
    y: -50,
    opacity: 0,
  },
  visible: (custom: number) => ({
    y: 0,
    opacity: 1,
    transition: { ease: easeOut, duration: 2, delay: custom * 0.3 },
  }),
};

const PageContainer = styled.div`
  background-image: url(${bg});
  background-size: cover;
  background-position: center;
  width: 100%;
  min-height: 85dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: column;
  flex-grow: 1;

  @media screen and (min-width: 768px) {
    min-height: 90vh;
  }
`;

export const Gradient = styled.div`
  background-image: linear-gradient(
    180deg,
    rgba(41, 37, 37, 0.7) 0%,
    rgba(3, 0, 0, 0.15) 100%
  );
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;
