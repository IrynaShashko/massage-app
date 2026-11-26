import { FC, useState } from "react";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import categories from "../../json/price.json";
import categoriesEn from "../../json/priceEn.json";

import { SectionContainer } from "../../App";

import BookNow from "../../components/BookNow";
import { useBooking } from "../../context/BookingContext";

import { Categories, PricePagePropsType } from "./types";

const PricePage: FC<PricePagePropsType> = ({ language }) => {
  const [t] = useTranslation();
  const categoriesData: Categories =
    language === "ua" ? categories : categoriesEn;
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const { startBooking } = useBooking();

  const currentCategoryKey = Object.keys(categoriesData)[
    activeCategory - 1
  ] as keyof Categories;
  const currentCategory = categoriesData[currentCategoryKey];

  return (
    <>
      <Wrapper>
        <BackgroundImageStyle>
          <SectionContainer>
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
                    <ServiceFooter>
                      <ServicePrice>{service.price}</ServicePrice>
                      <BookServiceButton
                        type="button"
                        onClick={() =>
                          startBooking({
                            category: currentCategoryKey,
                            service: service.service,
                          })
                        }
                      >
                        {t("book_service")}
                      </BookServiceButton>
                    </ServiceFooter>
                  </ServiceCard>
                ))}
              </ServiceGrid>
            </ServiceGridContainer>
          </SectionContainer>
        </BackgroundImageStyle>
      </Wrapper>
      <BookNow language={language} />
    </>
  );
};

export default PricePage;

const Wrapper = styled.div`
  position: relative;
`;

const BackgroundImageStyle = styled.div`
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.aboutBg};
  width: 100%;
  color: white;
  z-index: 3;
  clip-path: ellipse(300% 100% at 50% 0%);
  overflow: hidden;
  @media screen and (min-width: 1024px) {
    clip-path: ellipse(150% 100% at 50% 0%);
  }
  @media screen and (min-width: 1200px) {
    min-height: calc(100dvh - 80px);
    clip-path: ellipse(120% 100% at 50% 0%);
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

const TabButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>`
  padding: 12px 20px;
  border: none;
  border-radius: 90px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  background-color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.background};
  color: ${(props) => (props.active ? "#fff" : props.theme.colors.text)};
  box-shadow: ${(props) =>
    props.active ? "0 6px 16px -6px var(--color-primary-shadow)" : "none"};
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
  &:hover {
    background-color: ${(props) =>
      props.active
        ? props.theme.colors.primary
        : "color-mix(in srgb, var(--color-primary) 12%, " +
          props.theme.colors.background +
          ")"};
  }
  &:active {
    transform: scale(0.97);
  }
`;

const ServiceGridContainer = styled.div`
  overflow-y: auto;
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 20px;
  z-index: 5;
`;

const ServiceCard = styled.div`
  background-color: ${(props) => props.theme.colors.cardBg};
  box-shadow: 0 4px 12px ${(props) => props.theme.colors.boxShadow};
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px ${(props) => props.theme.colors.boxShadow};
  }
`;

const ServiceHeader = styled.div`
  margin-bottom: 1rem;
`;

const ServiceName = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-family: var(--font-body);
  margin: 0;
  line-height: 1.2;
  font-weight: 600;
  font-size: 1.05rem;
  margin-bottom: 6px;
`;

const ServiceDuration = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-size: 0.9rem;
  opacity: 0.7;
`;

const ServiceFooter = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
`;

const BookServiceButton = styled.button`
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  font-weight: 700;
  font-size: var(--text-sm);
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--color-primary);
    color: #fff;
  }
`;

const ServicePrice = styled.div`
  font-size: 1.35rem;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 700;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
`;
