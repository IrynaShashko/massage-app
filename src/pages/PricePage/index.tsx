import { FC, useState } from "react";

import styled from "styled-components";

import { useTranslation } from "react-i18next";

import backgroundImage from "../../images/11.jpg";

import categories from "../../json/price.json";
import categoriesEn from "../../json/priceEn.json";

import { Container } from "../../App";
import { Contacts } from "../../components/Contacts";

import { Categories, PricePagePropsType } from "./types";

export const PricePage: FC<PricePagePropsType> = ({ language }) => {
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
      <BackgroundImageStyle>
        <Container>
          <CategoryTabs>
            {Object.keys(categoriesData).map((categoryKey, index) => (
              <TabButton
                key={categoryKey}
                active={index + 1 === activeCategory}
                onClick={() => setActiveCategory(index + 1)}
              >
                {t(categoryKey)}
              </TabButton>
            ))}
          </CategoryTabs>
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
        </Container>
      </BackgroundImageStyle>
      <Contacts />
    </>
  );
};

const BackgroundImageStyle = styled.div`
  position: relative;
  box-sizing: border-box;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  min-height: 90vh;
  width: 100%;
  padding: 20px;
  padding-top: 20px;
  color: white;
  z-index: 1;
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

const TabButton = styled.button<{ active: boolean }>`
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

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 300px);
  gap: 1rem;
  z-index: 5;
  justify-content: center;
`;

const ServiceCard = styled.div`
  background-color: ${(props) => props.theme.colors.cardBg};
  box-shadow: 0 4px 12px ${(props) => props.theme.colors.boxShadow};
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
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
