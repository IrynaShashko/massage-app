import { FC, useState } from "react";

import styled from "styled-components";

import { useTranslation } from "react-i18next";

import circleRight from "../../images/circleRight.png";
import leftCircle from "../../images/leftCircle.png";

import categories from "../../json/price.json";
import categoriesEn from "../../json/priceEn.json";

import { Container } from "../../App";
import { Contacts } from "../../components/Contacts";

import { Categories, PricePagePropsType } from "./types";

const PricePage: FC<PricePagePropsType> = ({ language }) => {
  const [t] = useTranslation();
  const categoriesData: Categories =
    language === "ua" ? categories : categoriesEn;
  const [activeCategory, setActiveCategory] = useState<number>(1);

  const currentCategoryKey = Object.keys(categoriesData)[
    activeCategory - 1
  ] as keyof Categories;
  const currentCategory = categoriesData[currentCategoryKey];

  return (
    <>
      <Wrapper>
        <DecorativeElementLeft />
        <DecorativeElementBottomRight />
        <BackgroundImageStyle>
          <Container>
            <CategoryTabs>
              {Object.keys(categoriesData).map((categoryKey, index) => (
                <TabButton
                  type="button"
                  key={categoryKey}
                  active={index + 1 === activeCategory}
                  onClick={() => setActiveCategory(index + 1)}
                >
                  {t(categoryKey)}
                </TabButton>
              ))}
            </CategoryTabs>
            <ServiceGridContainer>
              <ServiceGrid>
                {currentCategory?.map((service, index) => (
                  <ServiceCard key={index}>
                    <ServiceHeader>
                      <ServiceName>{service.service}</ServiceName>
                      {service.time && (
                        <ServiceDuration>{service.time}</ServiceDuration>
                      )}
                      {service.description && <p>{service.description}</p>}
                    </ServiceHeader>
                    <ServicePrice>{service.price}</ServicePrice>
                  </ServiceCard>
                ))}
              </ServiceGrid>
            </ServiceGridContainer>
          </Container>
        </BackgroundImageStyle>
      </Wrapper>
      <Contacts />
    </>
  );
};

export default PricePage;

const Wrapper = styled.div`
  position: relative;
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
    top: 60%;
  }
  @media screen and (min-width: 1024px) {
    top: 50%;
  }
  @media screen and (min-width: 1440px) {
    top: 70%;
  }
`;

const DecorativeElementBottomRight = styled.div`
  position: absolute;
  right: 1%;
  bottom: 5%;
  width: 400px;
  height: 400px;
  background-image: url(${circleRight});
  background-size: contain;
  background-repeat: no-repeat;
  @media screen and (min-width: 1024px) {
    bottom: 1%;
    right: 1%;
    width: 500px;
    height: 500px;
  }
`;

const BackgroundImageStyle = styled.div`
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.aboutBg};
  width: 100%;
  padding: 12vw;
  padding-top: 20px;
  color: white;
  z-index: 3;
  min-height: 100vh;
  @media screen and (min-width: 768px) {
    padding-top: 50px;
    padding-bottom: 50px;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  z-index: 5;
  max-width: 100%;
  margin-inline: auto;
  @media screen and (min-width: 580px) {
    max-width: 80%;
  }
  @media screen and (min-width: 768px) {
    max-width: 100%;
  }
`;

const TabButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>`
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  background-color: ${(props) =>
    props.active ? props.theme.colors.primary : "#F7F7F7"};
  color: ${(props) => (props.active ? "#F7F7F7" : "#2c3e50")};
  &:hover {
    background-color: ${(props) =>
      props.active ? props.theme.colors.primary : "#e9ecef"};
  }
`;

const ServiceGridContainer = styled.div`
  overflow-y: auto;
  padding-bottom: 10px;
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 260px);
  gap: 20px;
  z-index: 5;
  justify-content: center;
  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, 260px);
  }
  @media screen and (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, 280px);
  }
  @media screen and (min-width: 1440px) {
    grid-template-columns: repeat(auto-fit, 260px);
  }
`;

const ServiceCard = styled.div`
  background-color: ${(props) => props.theme.colors.cardBg};
  box-shadow: 0 4px 12px ${(props) => props.theme.colors.boxShadow};
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 180px;
`;

const ServiceHeader = styled.div`
  margin-bottom: 1rem;
`;

const ServiceName = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0;
  margin-bottom: 0.5rem;
`;

const ServiceDuration = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-size: 0.9rem;
`;

const ServicePrice = styled.div`
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.text};
  font-weight: bold;
  margin-top: auto;
`;
