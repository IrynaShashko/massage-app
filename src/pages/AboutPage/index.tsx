import { FC } from "react";

import styled from "@emotion/styled";
import { ArrowRight, BookOpen, Briefcase, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import photo from "../../images/photo.jpg";

import experience from "../../json/experience.json";
import experienceEn from "../../json/experienceEn.json";

import { SectionContainer } from "../../App";

import BookNow from "../../components/BookNow";
import { SectionHeading } from "../../components/SectionHeading";
import { Glow, GlowSection } from "../../components/SectionHeading/Glow";

import { useBooking } from "../../context/BookingContext";
import { cardSurface, cardTitle, iconTile } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

import { AboutPagePropsType } from "./types";

/** Section labels in the translations end with ":"; drop it for headings */
const label = (text: string) => text.replace(/:\s*$/, "");

const STORY = ["massage_benefits", "oils", "about_session"];

const AboutPage: FC<AboutPagePropsType> = ({ language }) => {
  const [t] = useTranslation();
  const { startBooking } = useBooking();

  const data = language === "ua" ? experience : experienceEn;

  return (
    <>
      <GlowSection>
        <Glow />
        <SectionContainer>
          <Intro>
            <Aside>
              <PhotoCard>
                <Photo src={photo} alt={t("name_title")} />
                <PhotoBadge>
                  <strong>{t("name_title")}</strong>
                  <span>{t("profession")}</span>
                </PhotoBadge>
              </PhotoCard>
            </Aside>

            <Story>
              <SectionHeading
                level="h1"
                align="left"
                lead={t("about_hello")}
                accent={t("about_name")}
              />
              <Lead>{t("about_lead")}</Lead>
              {STORY.map((key) => (
                <Paragraph key={key}>{t(key)}</Paragraph>
              ))}
              <Quote>{t("goal")}</Quote>
              <Paragraph>{t("about_cta")}</Paragraph>
              <BookButton type="button" onClick={() => startBooking()}>
                {t("cta_button")}
                <ArrowRight size={20} aria-hidden />
              </BookButton>
            </Story>
          </Intro>
        </SectionContainer>
      </GlowSection>

      <GlowSection>
        <Glow $flip />
        <SectionContainer>
          <SectionHeading
            lead={t("journey_lead")}
            accent={t("journey_accent")}
          />
          <JourneyGrid>
            <Card $area="education">
              <CardHeader>
                <IconTile aria-hidden>
                  <BookOpen size={26} />
                </IconTile>
                <CardTitle>{label(t("education"))}</CardTitle>
              </CardHeader>
              <Timeline>
                {data.study.map((item) => (
                  <TimelineItem key={item.id}>
                    <DateChip>{item.data}</DateChip>
                    <TimelineText>{item.type}</TimelineText>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>

            <Card $area="experience">
              <CardHeader>
                <IconTile aria-hidden>
                  <Briefcase size={26} />
                </IconTile>
                <CardTitle>{label(t("experience"))}</CardTitle>
              </CardHeader>
              <Timeline>
                {data.experience.map((item) => (
                  <TimelineItem key={item.id}>
                    <DateChip>{item.data}</DateChip>
                    <TimelineText>{item.type}</TimelineText>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>

            <Card $area="skills">
              <CardHeader>
                <IconTile aria-hidden>
                  <Sparkles size={26} />
                </IconTile>
                <CardTitle>{label(t("additional_skills"))}</CardTitle>
              </CardHeader>
              <Skills>
                {data.else.map((item) => (
                  <Skill key={item.id}>{item.type}</Skill>
                ))}
              </Skills>
            </Card>
          </JourneyGrid>
        </SectionContainer>
      </GlowSection>

      <BookNow language={language} />
    </>
  );
};

export default AboutPage;

/* ---------- intro ---------- */

const Intro = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-7);
  /* centred so whichever column is shorter never leaves a hole at the bottom */
  align-items: center;

  @media screen and (min-width: 900px) {
    grid-template-columns: 0.8fr 1.2fr;
    gap: var(--space-8);
  }
`;

/* Photo with the "my goal" quote under it, so both columns end together */
const Aside = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
`;

const PhotoCard = styled.figure<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  position: relative;
  width: 100%;
  padding: var(--space-3);
`;

const Photo = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: center 20%;
  border-radius: calc(var(--radius-xl) - var(--space-3));
`;

const PhotoBadge = styled.figcaption<{ theme?: ThemeType }>`
  position: absolute;
  left: var(--space-6);
  right: var(--space-6);
  bottom: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--surface-glass);
  border: 1px solid var(--surface-border);
  color: ${(props) => props.theme.colors.text};

  strong {
    font-size: var(--text-lg);
  }

  span {
    font-size: var(--text-sm);
    opacity: 0.75;
  }
`;

const Story = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 68ch;

  /* the heading component brings a large bottom margin of its own */
  & > div:first-of-type {
    margin-bottom: var(--space-2);
  }
`;

const Lead = styled.p<{ theme?: ThemeType }>`
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.4;
  color: ${(props) => props.theme.colors.text};
`;

const Paragraph = styled.p<{ theme?: ThemeType }>`
  font-size: var(--text-lg);
  line-height: 1.7;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.85;
`;

const Quote = styled.blockquote<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  margin: var(--space-2) 0;
  padding: var(--space-5) var(--space-6);
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.text};
`;

const BookButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
  padding: 16px 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-size: var(--text-lg);
  font-weight: 700;
  box-shadow: 0 12px 28px -10px var(--color-primary-shadow);
  transition:
    background-color 0.2s ease,
    transform 0.2s var(--ease-out);

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-primary-hover);
      transform: translateY(-1px);
    }
  }
`;

/* ---------- education & experience ---------- */

const JourneyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  align-items: start;

  /* the long education list on the left, experience and skills stacked on the right */
  @media screen and (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "education experience"
      "education skills";
    /* first row hugs the experience card so skills sit right under it */
    grid-template-rows: auto 1fr;
  }
`;

const Card = styled.section<{
  $area: "education" | "experience" | "skills";
  theme?: ThemeType;
}>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  padding: var(--space-6);

  @media screen and (min-width: 900px) {
    grid-area: ${(props) => props.$area};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
`;

const IconTile = styled.div`
  ${iconTile(56)}
`;

const CardTitle = styled.h3<{ theme?: ThemeType }>`
  ${(props) => cardTitle(props.theme as ThemeType)}
`;

const Timeline = styled.ol`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-left: 6px;
  padding-left: var(--space-5);
  border-left: 2px solid
    color-mix(in srgb, var(--color-primary) 25%, transparent);
`;

const TimelineItem = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);

  /* dot sitting on the line */
  &::before {
    content: "";
    position: absolute;
    left: calc(-1 * var(--space-5) - 7px);
    top: 7px;
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
    background: var(--gradient-accent);
  }
`;

const DateChip = styled.span`
  display: inline-flex;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 700;
`;

const TimelineText = styled.p<{ theme?: ThemeType }>`
  line-height: 1.6;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.85;
`;

const Skills = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const Skill = styled.li<{ theme?: ThemeType }>`
  position: relative;
  padding-left: var(--space-5);
  line-height: 1.6;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.85;

  /* small accent dot, same as the timeline markers */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.6em;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--gradient-accent);
  }
`;
