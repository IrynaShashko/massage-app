import { FC, useRef, useState } from "react";

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
import { priceVariants } from "../../utils/price";

import { Categories, PricePagePropsType } from "./types";

/** Phones get one compact list; wider screens a grid of cards */
const MOBILE = "@media screen and (max-width: 599px)";
const WIDE = "@media screen and (min-width: 600px)";

const PricePage: FC<PricePagePropsType> = ({ language }) => {
  const [t] = useTranslation();
  const categoriesData: Categories =
    language === "ua" ? categories : categoriesEn;
  const categoryKeys = Object.keys(categoriesData) as (keyof Categories)[];
  const [activeKey, setActiveKey] = useState<keyof Categories>(categoryKeys[0]);
  const { startBooking } = useBooking();
  /** where the tabs sit before they stick under the header */
  const tabsAnchorRef = useRef<HTMLDivElement>(null);

  const selectCategory = (key: keyof Categories, tab: HTMLElement) => {
    setActiveKey(key);
    // bring a half-hidden tab fully into the scrolling row
    tab.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    // the tabs stick on phones: after scrolling down a long list, start the
    // new one from its top instead of somewhere in the middle
    const anchor = tabsAnchorRef.current;
    if (!anchor) return;
    const headerHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-height",
        ),
      ) || 0;
    const anchorTop = anchor.getBoundingClientRect().top;
    if (anchorTop < headerHeight) {
      window.scrollTo({
        top: anchorTop + window.scrollY - headerHeight,
        behavior: "smooth",
      });
    }
  };

  const services = categoriesData[activeKey] ?? [];

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
          <div ref={tabsAnchorRef} />
          <TabsBar>
            <CategoryTabs role="tablist">
              {categoryKeys.map((key) => (
                <TabButton
                  type="button"
                  key={key}
                  role="tab"
                  aria-selected={key === activeKey}
                  $active={key === activeKey}
                  onClick={(event) => selectCategory(key, event.currentTarget)}
                >
                  {t(key)}
                </TabButton>
              ))}
            </CategoryTabs>
          </TabsBar>
          <ServiceList role="tabpanel">
            {services.map((service, index) => (
              <ServiceItem key={`${service.service}-${index}`}>
                <ServiceInfo>
                  <ServiceName>{service.service}</ServiceName>
                  {service.description && (
                    <ServiceDescription>
                      {service.description}
                    </ServiceDescription>
                  )}
                  <Variants>
                    {priceVariants(service.price, service.time, language).map(
                      (variant) => (
                        <li key={`${variant.duration}-${variant.price}`}>
                          {variant.duration && (
                            <Duration>{variant.duration}</Duration>
                          )}
                          <Price>{variant.price}</Price>
                        </li>
                      ),
                    )}
                  </Variants>
                </ServiceInfo>
                <BookServiceButton
                  type="button"
                  onClick={() =>
                    startBooking({
                      category: activeKey,
                      service: service.service,
                    })
                  }
                >
                  {t("book_service")}
                </BookServiceButton>
              </ServiceItem>
            ))}
          </ServiceList>
        </SectionContainer>
      </GlowSection>
      <BookNow language={language} />
    </>
  );
};

export default PricePage;

/*
 * Category switcher. Phones: one row that scrolls sideways and sticks under
 * the header, so the category can change anywhere in a long list.
 * Wider screens: the centred glass bar of pill tabs.
 */
const TabsBar = styled.div<{ theme?: ThemeType }>`
  margin-bottom: var(--space-7);

  ${MOBILE} {
    position: sticky;
    top: var(--header-height);
    z-index: 5;
    /* full-bleed strip in the page colour, so the list slides under it */
    margin: 0 -20px var(--space-4);
    padding: var(--space-2) 0;
    background: ${(props) => props.theme.colors.background};
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: var(--space-1);

  ${WIDE} {
    flex-wrap: wrap;
    justify-content: center;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
    padding: 6px;
    border-radius: var(--radius-full);
    background: var(--surface-glass);
    border: 1px solid var(--surface-border);
    box-shadow: var(--shadow-glass);
  }

  ${MOBILE} {
    gap: var(--space-2);
    overflow-x: auto;
    padding: 0 20px;
    scroll-padding-inline: 20px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TabButton = styled.button<{ $active: boolean; theme?: ThemeType }>`
  flex-shrink: 0;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 700;
  white-space: nowrap;
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  background: ${(props) =>
    props.$active ? "var(--color-primary)" : "transparent"};
  box-shadow: ${(props) =>
    props.$active ? "0 6px 16px -6px var(--color-primary-shadow)" : "none"};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$active
        ? "var(--color-primary)"
        : "color-mix(in srgb, var(--color-primary) 10%, transparent)"};
  }

  ${MOBILE} {
    padding: 8px 16px;
    font-size: var(--text-sm);
    border: 1.5px solid
      ${(props) =>
        props.$active
          ? "var(--color-primary)"
          : `color-mix(in srgb, ${props.theme.colors.text} 18%, transparent)`};
    box-shadow: none;
  }
`;

/* Phones: one card holding rows split by hairlines. Wider: a grid of cards */
const ServiceList = styled.ul<{ theme?: ThemeType }>`
  list-style: none;
  margin: 0;
  padding: 0;

  ${MOBILE} {
    ${(props) => cardSurface(props.theme as ThemeType)}
    padding: 0 var(--space-4);
  }

  ${WIDE} {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-5);
  }
`;

const ServiceItem = styled.li<{ theme?: ThemeType }>`
  display: flex;
  gap: var(--space-3);

  ${MOBILE} {
    align-items: center;
    padding: var(--space-4) 0;

    & + & {
      border-top: 1px solid ${(props) => props.theme.colors.border};
    }
  }

  ${WIDE} {
    ${(props) => cardSurface(props.theme as ThemeType)}
    flex-direction: column;
    justify-content: space-between;
    padding: var(--space-5);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    /* lift only where there is a pointer to hover with */
    @media (hover: hover) {
      &:hover {
        transform: translateY(-3px);
        box-shadow:
          var(--shadow-glass),
          0 18px 40px -18px var(--color-primary-shadow);
      }
    }
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const ServiceName = styled.h3<{ theme?: ThemeType }>`
  margin: 0;
  color: ${(props) => props.theme.colors.text};
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.25;

  ${MOBILE} {
    font-size: var(--text-base);
  }
`;

const ServiceDescription = styled.p`
  font-size: var(--text-sm);
  opacity: 0.75;
`;

/* One line per option: "90 хв · 1200 ₴" */
const Variants = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0 var(--space-2);
  }

  ${WIDE} {
    margin-top: var(--space-2);
  }
`;

const Duration = styled.span<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.text};
  font-size: var(--text-sm);
  opacity: 0.65;

  &::after {
    content: "·";
    margin-left: var(--space-2);
  }
`;

const Price = styled.span<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.primary};
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  ${WIDE} {
    font-size: 1.35rem;
  }
`;

const BookServiceButton = styled.button`
  flex-shrink: 0;
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

  ${MOBILE} {
    padding: 6px 14px;
  }

  ${WIDE} {
    align-self: flex-start;
    margin-top: var(--space-4);
  }
`;
