import { FC } from "react";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import photo from "../../images/photo.jpg";

import experience from "../../json/experience.json";
import experienceEn from "../../json/experienceEn.json";

import { SectionContainer } from "../../App";

import { ThemeType } from "../../theme/theme";

import BookNow from "../../components/BookNow";
import { AboutPagePropsType } from "./types";

const AboutPage: FC<AboutPagePropsType> = ({ language }) => {
  const [t] = useTranslation();

  const data = language === "ua" ? experience : experienceEn;

  const studyItems = data.study.map((item) => (
    <ListItem key={item.id}>
      <DataTitle>{item.data}</DataTitle>
      <ItemText>{item.type}</ItemText>
    </ListItem>
  ));

  const experienceItems = data.experience.map((item) => (
    <ListItem key={item.id}>
      <DataTitle>{item.data}</DataTitle>
      <ItemText>{item.type}</ItemText>
    </ListItem>
  ));

  const elseItems = data.else.map((item) => (
    <ListItem key={item.id}>
      <ItemText style={{ textIndent: "0px" }}>{item.type}</ItemText>
    </ListItem>
  ));

  return (
    <>
      <AboutContainer>
        <StudyContainer>
          <BackgroundContainer>
            <SectionContainer>
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
            </SectionContainer>
          </BackgroundContainer>
        </StudyContainer>
        <SectionContainer>
          <ItemTitle>{t("education")}</ItemTitle>
          <ul>{studyItems}</ul>
          <ItemTitle>{t("experience")}</ItemTitle>
          <ul>{experienceItems}</ul>
          <ItemTitle>{t("additional_skills")}</ItemTitle>
          <ul>{elseItems}</ul>
        </SectionContainer>
      </AboutContainer>
      <BookNow language={language} />
    </>
  );
};

export default AboutPage;

export const AboutContainer = styled.div<{ theme?: ThemeType }>`
  background-color: ${(props) => props.theme.colors.background};
  min-height: 100dvh;
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
  gap: 20px;
  @media screen and (min-width: 768px) {
    gap: 50px;
  }
  @media screen and (min-width: 970px) {
    display: flex;
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
  @media screen and (min-width: 768px) {
    max-width: 450px;
  }
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
  color: #f7f7f7;
  margin-bottom: 20px;
  text-shadow: 0px 0px 7px rgba(255, 255, 255, 0.5);
  letter-spacing: 5px;
  text-align: center;
  @media screen and (min-width: 768px) {
    font-size: 35px;
  }
`;

const AfterTitle = styled.p<{ theme?: ThemeType }>`
  font-size: 18px;
  letter-spacing: 5px;
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  @media screen and (min-width: 768px) {
    font-size: 20px;
  }
`;

const TitleText = styled.h1<{ theme?: ThemeType }>`
  font-size: 22px;
  line-height: 30px;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 20px;
  text-align: center;
  @media screen and (min-width: 768px) {
    font-size: 30px;
  }
`;

const ListItem = styled.li<{ theme?: ThemeType }>`
  position: relative;
  padding-top: 16px;
  padding-bottom: 16px;
  display: block;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);

    width: 80%;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      ${(props) => props.theme.colors.text},
      transparent
    );
  }
`;

const Text = styled.p<{ theme?: ThemeType }>`
  font-size: 18px;
  line-height: 26px;
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

const ItemTitle = styled.h4<{ theme?: ThemeType }>`
  font-size: 30px;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 10px;
  text-transform: uppercase;
  font-weight: lighter;
  text-align: left;
`;

const DataTitle = styled.span<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  font-weight: 800;
  @media screen and (min-width: 768px) {
    font-size: 20px;
  }
`;
