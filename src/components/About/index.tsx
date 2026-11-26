import styled from "@emotion/styled";
import { motion, Variants } from "framer-motion";

import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

import education from "../../images/education.png";
import lotos from "../../images/lotos.png";
import massage from "../../images/massage.png";

import { SectionContainer } from "../../App";
import { SectionHeading } from "../SectionHeading";
import { Glow } from "../SectionHeading/Glow";
import { cardSurface, cardTitle, iconTile } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

const SOFT_EASE = [0.4, 0, 0.2, 1] as const;

const list: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const card: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.1, ease: SOFT_EASE },
  },
};

const ITEMS = [
  { icon: lotos, title: "moreThanAService", text: "moreThanAServiceText" },
  { icon: education, title: "medicalEducation", text: "medicalEducationText" },
  { icon: massage, title: "authorsTechniques", text: "authorsTechniquesText" },
];

export const About = () => {
  const [t] = useTranslation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <GlowSection>
      <Glow />
      <SectionContainer>
        <SectionHeading lead={t("why_lead")} accent={t("why_accent")} />
        <Grid
          ref={ref}
          variants={list}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {ITEMS.map((item) => (
            <Card key={item.title} variants={card}>
              <CardHeader>
                <IconTile aria-hidden>
                  <Icon $src={item.icon} />
                </IconTile>
                <CardTitle>{t(item.title)}</CardTitle>
              </CardHeader>
              <CardText>{t(item.text)}</CardText>
            </Card>
          ))}
        </Grid>
      </SectionContainer>
    </GlowSection>
  );
};

const GlowSection = styled.section`
  position: relative;
  isolation: isolate;
  /* Full width so the glow is never clipped by the centred wrapper */
  width: 100%;
  align-self: stretch;
`;

const Grid = styled(motion.ul)`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);

  /* Tablet / small laptop: two short cards on top, the long one full width below */
  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "first third"
      "second second";
  }

  /* Wide screens: one row, the middle card (longest text) gets more width */
  @media screen and (min-width: 1200px) {
    grid-template-columns: 1fr 1.7fr 1fr;
    grid-template-areas: "first second third";
  }
`;

const Card = styled(motion.li)<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}

  @media screen and (min-width: 768px) {
    &:nth-of-type(1) {
      grid-area: first;
    }
    &:nth-of-type(2) {
      grid-area: second;
    }
    &:nth-of-type(3) {
      grid-area: third;
    }
  }

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  height: 100%;
  padding: var(--space-6);
  text-align: left;
  transition:
    box-shadow 0.4s ease,
    border-color 0.4s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: color-mix(in srgb, var(--color-primary) 35%, transparent);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-2);
`;

const IconTile = styled.div`
  ${iconTile(60)}
`;

/** The PNG icons are black line art: use them as a mask so they take the brand colour in both themes */
const Icon = styled.span<{ $src: string }>`
  width: 38px;
  height: 38px;
  background-color: var(--color-primary);
  -webkit-mask: url(${(props) => props.$src}) center / contain no-repeat;
  mask: url(${(props) => props.$src}) center / contain no-repeat;
`;

const CardTitle = styled.h3<{ theme?: ThemeType }>`
  ${(props) => cardTitle(props.theme as ThemeType)}
  text-wrap: balance;
`;

const CardText = styled.p<{ theme?: ThemeType }>`
  font-size: var(--text-base);
  line-height: 1.65;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.82;
`;

/** Section heading shared across the site: calm, dark text with a short brand accent underneath */
export const Title = styled.h2<{ theme?: ThemeType }>`
  font-family: var(--font-heading);
  font-size: clamp(1.875rem, 1.4rem + 2vw, 2.6rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  text-wrap: balance;
  margin-bottom: var(--space-7);

  &::after {
    content: "";
    display: block;
    width: 48px;
    height: 3px;
    margin: var(--space-4) auto 0;
    border-radius: var(--radius-full);
    background-color: var(--color-primary);
  }
`;
