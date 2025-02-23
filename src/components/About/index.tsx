import styled from "@emotion/styled";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

import education from "../../images/education.png";
import lotos from "../../images/lotos.png";
import massage from "../../images/massage.png";

import { ThemeType } from "../../theme/theme";

export const About = () => {
  const [t] = useTranslation();

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

  return (
    <Container>
      <Title>{t("whyChooseMe")}</Title>
      <InfoContainer
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={animationElement}
        ref={ref}
        custom={1}
      >
        <InfoItem variants={animationElement} custom={2}>
          <IconContainer>
            <img src={lotos} alt="lotos" />
            <BlurEffect />
          </IconContainer>
          <InfoCard>
            <InfoTitle>{t("moreThanAService")}</InfoTitle>
            <MainText>{t("moreThanAServiceText")}</MainText>
          </InfoCard>
        </InfoItem>
        <InfoItem variants={animationElement} custom={4}>
          <IconContainer>
            <img src={education} alt="education" />
            <BlurEffect />
          </IconContainer>
          <InfoCard>
            <InfoTitle>{t("medicalEducation")}</InfoTitle>
            <MainText>{t("medicalEducationText")}</MainText>
          </InfoCard>
        </InfoItem>
        <InfoItem variants={animationElement} custom={6}>
          <IconContainer>
            <img src={massage} alt="massage" />
            <BlurEffect />
          </IconContainer>
          <InfoCard>
            <InfoTitle>{t("authorsTechniques")}</InfoTitle>
            <MainText>{t("authorsTechniquesText")}</MainText>
          </InfoCard>
        </InfoItem>
      </InfoContainer>
    </Container>
  );
};

const Container = styled.section`
  padding: 20px;
  @media screen and (min-width: 900px) {
    padding: 50px;
  }
`;

const InfoContainer = styled(motion.ul)`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 70px;
  @media screen and (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
`;

const InfoItem = styled(motion.li)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
`;

const InfoCard = styled.div<{ theme?: ThemeType }>`
  padding: 50px;
  background-color: ${(props) => props.theme.colors.cardBg};
  border-radius: 12px;
  box-shadow: 0 4px 12px ${(props) => props.theme.colors.boxShadow};
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  text-align: left;
  overflow-y: auto;
`;

const InfoTitle = styled.p<{ theme?: ThemeType }>`
  font-size: 20px;
  margin-bottom: 10px;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
`;

const IconContainer = styled.div<{ theme?: ThemeType }>`
  position: absolute;
  top: -55px;
  left: 20px;
  width: 100px;
  height: 100px;
  padding: 20px;
  background-color: ${(props) => props.theme.colors.aboutBg};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px ${(props) => props.theme.colors.boxShadow};
  color: white;
`;

const BlurEffect = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  filter: blur(6px);
  z-index: 0;
`;

const Title = styled.h3<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.primary};
  font-size: 30px;
  font-weight: lighter;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 70px;
  @media screen and (min-width: 1024px) {
    margin-bottom: 100px;
  }
`;

const MainText = styled.p<{ theme?: ThemeType }>`
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};

  @media screen and (min-width: 1440px) {
    font-size: 18px;
  }
`;
