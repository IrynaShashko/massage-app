import { FC } from "react";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import photo from "../../images/photo.jpg";

import experience from "../../json/experience.json";
import experienceEn from "../../json/experienceEn.json";

import { Container } from "../../App";
import { Contacts } from "../../components/Contacts";

import { ThemeType } from "../../theme/theme";

import { AboutPagePropsType } from "./types";

export const AboutPage: FC<AboutPagePropsType> = ({ language }) => {
  const [t] = useTranslation();

  const data = language === "ua" ? experience : experienceEn;

  const studyItems = data.study.map((item) => (
    <li key={item.id}>
      <DataTitle>{item.data}</DataTitle>
      <ItemText>{item.type}</ItemText>
    </li>
  ));

  const experienceItems = data.experience.map((item) => (
    <li key={item.id}>
      <DataTitle>{item.data}</DataTitle>
      <ItemText>{item.type}</ItemText>
    </li>
  ));

  const elseItems = data.else.map((item) => (
    <li key={item.id}>
      <ItemText style={{ textIndent: "0px" }}>{item.type}</ItemText>
    </li>
  ));

  return (
    <>
      <AboutContainer>
        <StudyContainer>
          <BackgroundContainer>
            <Container>
              <ImageContainer>
                <ImageWrapper>
                  <ImageBorder>
                    <Image src={photo} alt="masseur" />
                  </ImageBorder>
                  <TitleContainer>
                    <Title>{t("name_title")}</Title>
                    <AfterTitle>{t("profession")}</AfterTitle>
                  </TitleContainer>
                </ImageWrapper>
                <TitleContainer>
                  <TitleText>{t("about_title")}</TitleText>
                  <Text>{t("about_text")}</Text>
                  <Text>{t("goal")}</Text>
                  <Text>{t("massage_benefits")}</Text>
                  <Text>{t("oils")}</Text>
                  <Text>{t("invitation")}</Text>
                  <Text>{t("escape")}</Text>
                  <Text>{t("book_now")}</Text>
                </TitleContainer>
              </ImageContainer>
            </Container>
          </BackgroundContainer>
        </StudyContainer>
        <Container>
          <ItemWrapper>
            <ItemTitle>{t("education")}</ItemTitle>
            <ul>{studyItems}</ul>
            <ItemTitle>{t("experience")}</ItemTitle>
            <ul>{experienceItems}</ul>
            <ItemTitle>{t("additional_skills")}</ItemTitle>
            <ul>{elseItems}</ul>
          </ItemWrapper>
        </Container>
      </AboutContainer>
      <Contacts />
    </>
  );
};

export const AboutContainer = styled.div<{ theme?: ThemeType }>`
  background-color: ${(props) => props.theme.colors.background};
  @media screen and (min-width: 768px) {
  }
`;

export const StudyContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

const BackgroundContainer = styled.div<{ theme?: ThemeType }>`
  width: 100%;
  background-color: ${(props) => props.theme.colors.aboutBg};
`;

export const ImageContainer = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 50px;
  @media screen and (min-width: 768px) {
    padding: 50px;
  }
  @media screen and (min-width: 970px) {
    display: flex;
    padding: 50px;

    flex-direction: row;
    justify-content: center;
  }
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  max-width: 400px;
`;

const ImageBorder = styled.div`
  padding: 20px;
  border-radius: 50%;
  background: linear-gradient(
    45deg,
    var(--color-primary-light),
    var(--color-primary-dark)
  );
  box-shadow: 0px 4px 20px var(--color-box-shadow-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const scaleUp = keyframes`
  0% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  border-radius: 400px;
  object-fit: cover;
  box-shadow: 0px 5px 15px var(--color-box-shadow-dark);
  transition:
    transform var(--transition-duration) ease,
    box-shadow var(--transition-duration) ease;

  animation: ${scaleUp} 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0px 10px 25px var(--color-box-shadow-light);
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  max-width: 1000px;
  @media screen and (min-width: 768px) {
  }
`;

const Title = styled.h2`
  font-size: 30px;
  margin-top: 20px;
  color: #fff;
  margin-bottom: 20px;
  font-weight: lighter;
  text-shadow: 0px 0px 7px rgba(255, 255, 255, 0.8);
  letter-spacing: 5px;
  text-align: center;
  @media screen and (min-width: 768px) {
    font-size: 35px;
  }
`;

const AfterTitle = styled.p<{ theme?: ThemeType }>`
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 5px;
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  @media screen and (min-width: 768px) {
    font-size: 20px;
  }
`;

const TitleText = styled.p<{ theme?: ThemeType }>`
  font-size: 22px;
  line-height: 30px;
  color: ${(props) => props.theme.colors.aboutText};
  margin-bottom: 20px;
  text-align: center;
  @media screen and (min-width: 768px) {
    font-size: 30px;
  }
`;

const ItemWrapper = styled.div`
  padding: 20px;
  @media screen and (min-width: 768px) {
    padding: 50px;
  }
`;

const Text = styled.p<{ theme?: ThemeType }>`
  font-size: 18px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 20px;
  text-align: left;
  @media screen and (min-width: 768px) {
    font-size: 20px;
  }
`;

const ItemText = styled.p<{ theme?: ThemeType }>`
  font-size: 18px;
  margin-bottom: 10px;
  color: ${(props) => props.theme.colors.text};
  text-align: left;
  @media screen and (min-width: 768px) {
    font-size: 20px;
  }
`;

const ItemTitle = styled.h4`
  font-size: 20px;
  color: #007586;
  margin-bottom: 10px;
  text-transform: uppercase;
  line-height: 50px;
  text-align: left;
`;

const DataTitle = styled.span<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  font-weight: 800;
  @media screen and (min-width: 768px) {
    font-size: 18px;
  }
`;
