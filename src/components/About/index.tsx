import styled from "@emotion/styled";
import { motion, Variants } from "framer-motion";

import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

import education from "../../images/education.png";
import lotos from "../../images/lotos.png";
import massage from "../../images/massage.png";

import { SectionContainer } from "../../App";
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
    <SectionContainer>
      <Title>{t("whyChooseMe")}</Title>
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
  );
};

const Grid = styled(motion.ul)`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);

  /* The middle card has by far the longest text, so it gets more width */
  @media screen and (min-width: 1024px) {
    grid-template-columns: 1fr 1.7fr 1fr;
  }
`;

const Card = styled(motion.li)<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  height: 100%;
  padding: var(--space-6);
  text-align: left;
  border-radius: var(--radius-xl);
  background-color: ${(props) => props.theme.colors.cardBg};
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: var(--shadow-sm);
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
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  background-color: color-mix(in srgb, var(--color-primary) 16%, transparent);
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
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.3;
  color: ${(props) => props.theme.colors.text};
  text-wrap: balance;
`;

const CardText = styled.p<{ theme?: ThemeType }>`
  font-size: var(--text-base);
  line-height: 1.65;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.82;
`;

export const Title = styled.h2<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.primary};
  font-size: 30px;
  font-weight: lighter;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 50px;
  @media screen and (min-width: 1024px) {
    margin-bottom: 70px;
  }
`;
