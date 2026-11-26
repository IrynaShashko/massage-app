import { FC } from "react";

import styled from "@emotion/styled";
import { motion, Variants } from "framer-motion";

import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ThemeType } from "../../theme/theme";

import bg from "../../images/10.jpg";

import { useBooking } from "../../context/BookingContext";

import { PhoneButton } from "../PhoneButton/PhoneButton";

import { HeroPropsType } from "./types";

const BENEFITS = [
  "harmony",
  "balance",
  "stressRelief",
  "painRelief",
  "restoreFunction",
];

// Soft, unhurried reveal: gentle ease-in-out and a longer duration.
const SOFT_EASE = [0.4, 0, 0.2, 1] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.25 },
  },
};

const item: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: SOFT_EASE },
  },
};

export const Hero: FC<HeroPropsType> = () => {
  const [t] = useTranslation();
  const { startBooking } = useBooking();

  return (
    <>
      <PhoneButton />
      <PageContainer>
        <Background
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease: SOFT_EASE }}
        />
        <Gradient />
        <Content variants={container} initial="hidden" animate="visible">
          <Title variants={item}>{t("welcome")}</Title>

          <Lead variants={item}>{t("hereYouCan")}</Lead>

          <BenefitList>
            {BENEFITS.map((key) => (
              <Benefit key={key} variants={item}>
                <Check aria-hidden>✔&#xFE0E;</Check>
                {t(key)}
              </Benefit>
            ))}
          </BenefitList>

          <StyledButton
            type="button"
            variants={item}
            onClick={() => startBooking()}
          >
            {t("cta_button")}
            <ChevronDown size={22} aria-hidden />
          </StyledButton>
        </Content>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.section`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 85dvh;
  background-color: #1f1b18;
  overflow: hidden;
  clip-path: ellipse(150% 100% at 50% 0%);

  @media screen and (min-width: 768px) {
    min-height: calc(100dvh - var(--header-height));
    clip-path: ellipse(120% 100% at 50% 0%);
  }
`;

const Background = styled(motion.div)`
  position: absolute;
  inset: 0;
  background-image: url(${bg});
  background-size: cover;
  background-position: center;
  will-change: transform, opacity;
`;

const Gradient = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(41, 37, 37, 0.72) 0%,
    rgba(20, 16, 13, 0.45) 55%,
    rgba(3, 0, 0, 0.3) 100%
  );
`;

const Content = styled(motion.div)`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) 20px var(--space-9);
  text-align: center;
  color: #fff;
`;

const Title = styled(motion.h1)<{ theme?: ThemeType }>`
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: clamp(2.5rem, 1.4rem + 4.5vw, 4.75rem);
  line-height: 1.15;
  color: ${(props) => props.theme.colors.heroText};
  text-wrap: balance;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
`;

const Lead = styled(motion.p)`
  margin-top: var(--space-6);
  font-size: var(--text-xl);
  font-weight: 600;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
`;

const BenefitList = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
`;

const Benefit = styled(motion.li)`
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  max-width: 36ch;
  font-size: clamp(1.05rem, 0.95rem + 0.5vw, 1.3rem);
  line-height: 1.45;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
`;

const Check = styled.span`
  flex-shrink: 0;
  color: var(--color-primary-light);
`;

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-7);
  padding: 18px 44px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-size: var(--text-lg);
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 12px 28px -8px var(--color-primary-shadow);
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: var(--color-primary-hover);
    box-shadow: 0 16px 32px -8px var(--color-primary-shadow);
  }
`;
