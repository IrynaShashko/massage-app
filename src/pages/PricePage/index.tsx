import { FC, useState } from "react";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import categories from "../../json/price.json";
import categoriesEn from "../../json/priceEn.json";

import { SectionContainer } from "../../App";

import BookNow from "../../components/BookNow";
import { SectionHeading } from "../../components/SectionHeading";
import { Glow, GlowSection } from "../../components/SectionHeading/Glow";
import { cardSurface } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";
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
      <GlowSection>
        <Glow />
        <SectionContainer>
          <SectionHeading
            level="h1"
            lead={t("price_lead")}
            accent={t("price_accent")}
          />
          <CategoryTabs role="tablist">
            {Object.keys(categoriesData).map((categoryKey, index) => (
              <TabButton
                type="button"
                key={categoryKey}
                role="tab"
                aria-selected={index + 1 === activeCategory}
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
        </SectionContainer>
      </GlowSection>
      <BookNow language={language} />
    </>
  );
};

export default PricePage;

/* Category switcher: one glass bar holding pill tabs */
const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-1);
  width: fit-content;
  max-width: 100%;
  margin: 0 auto var(--space-7);
  padding: 6px;
  border-radius: var(--radius-full);
  background: var(--surface-glass);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-glass);

  @media screen and (max-width: 600px) {
    border-radius: var(--radius-xl);
  }
`;

const TabButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean; theme?: ThemeType }>`
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 700;
  white-space: nowrap;
  color: ${(props) => (props.active ? "#fff" : props.theme.colors.text)};
  background: ${(props) =>
    props.active ? "var(--color-primary)" : "transparent"};
  box-shadow: ${(props) =>
    props.active ? "0 6px 16px -6px var(--color-primary-shadow)" : "none"};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.active
        ? "var(--color-primary)"
        : "color-mix(in srgb, var(--color-primary) 10%, transparent)"};
  }
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: var(--space-5);
`;

const ServiceCard = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  display: flex;
  flex-direction: column;
  padding: var(--space-5);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      var(--shadow-glass),
      0 18px 40px -18px var(--color-primary-shadow);
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
