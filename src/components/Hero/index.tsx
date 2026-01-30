import { FC, useEffect, useState } from "react";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

import bg from "../../images/10.jpg";
import noise from "../../images/noise.png";

import { ConnectionForm } from "../ConnectionForm";
import { PhoneButton } from "../PhoneButton/PhoneButton";

import { ThemeType } from "../../theme/theme";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase";
import { HeroPropsType } from "./types";

export const Hero: FC<HeroPropsType> = ({ language }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [info, setInfo] = useState<string>("");

  const checkAuthState = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
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
      setInfo("");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const onCloseModal = () => {
    setIsModalOpen(false);
  };

  const animationElement = {
    hidden: {
      y: -50,
      opacity: 0,
    },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 2, delay: custom * 0.3 },
    }),
  };

  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  const handleBookNowButton = () => {
    if (!isAuthenticated) {
      setInfo(t("bookServices"));
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <>
      <PhoneButton />
      <PageContainer>
        <Gradient />
        <TextContainer
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={animationElement}
          ref={ref}
          custom={1}
        >
          <TitleText variants={animationElement} custom={2}>
            {t("welcome")}
          </TitleText>
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
          {info && <InfoText>{info}</InfoText>}
          {info && (
            <ModalSubmitBtn type="button" onClick={signInWithGoogle}>
              {t("googleButton")}
            </ModalSubmitBtn>
          )}
          <ButtonContainer>
            <motion.div
              variants={animationElement}
              custom={9}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              <ModalSubmitBtn type="button" onClick={handleBookNowButton}>
                {t("bookNow")}
              </ModalSubmitBtn>
            </motion.div>
          </ButtonContainer>
        </TextContainer>
        {isModalOpen && (
          <ConnectionForm
            isOpen={isModalOpen}
            onClose={onCloseModal}
            language={language}
          />
        )}
      </PageContainer>
    </>
  );
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
    rgba(41, 37, 37, 0.15) 0%,
    rgba(3, 0, 0, 0.15) 100%
  );
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

const InfoText = styled.p<{ theme?: ThemeType }>`
  color: #f7f7f7;
  text-decoration: underline;
  font-size: 15px;
  width: 300px;
  text-align: center;
  @media screen and (min-width: 1024px) {
    width: 500px;
    font-size: 20px;
  }
`;

export const Noise = styled.div`
  background-image: url(${noise});
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  opacity: 0.3;
  background-repeat: repeat;
  background-size: 100px 100px;
`;

const growFont = keyframes`
  from {
    opacity: 0;
    transform: translate(0px, 50px);
  }
  to {
    opacity: 1;
    transform: translate(0px, 0px);
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & button {
    animation: ${growFont} 0.3s ease-out forwards;
    opacity: 0;
  }
  & button:nth-of-type(1) {
    animation-delay: 3.2s;
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
    line-height: 25px;
    max-width: 800px;
  }
`;

const TitleText = styled(Text)`
  letter-spacing: 3px;
  font-size: 25px;
  font-weight: 800;
  @media screen and (min-width: 425px) {
    line-height: 1.5;
    font-size: 30px;
  }
`;

export const ModalSubmitBtn = styled(motion.button)<{ theme?: ThemeType }>`
  border: none;
  background-color: transparent;
  border-radius: 8px;
  align-self: center;
  padding: 10px;
  color: ${(props) => props.theme.colors.buttonText};
  width: 220px;
  font-size: 20px;
  font-family: 400;
  font-weight: lighter;
  cursor: pointer;
  box-shadow: 0px 0px 2px 1px rgba(255, 255, 255, 1);
  text-transform: uppercase;
  margin-top: 20px;
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: scale(1.1);
  }
  @media screen and (min-width: 425px) {
    width: 250px;
  }
  @media screen and (min-width: 768px) {
    width: 350px;
  }
`;
