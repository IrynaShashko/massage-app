import { useTranslation } from "react-i18next";

import styled from "@emotion/styled";

import { cardSurface, cardTitle } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

import { SectionContainer } from "../../App";
import { SectionHeading } from "../SectionHeading";
import { Glow } from "../SectionHeading/Glow";
import { ConnectionButtons } from "../ConnectionButton";
import { ConnectionForm } from "../ConnectionForm";
import { BOOKING_SECTION_ID } from "../../context/BookingContext";

export default function BookNow({ language }: { language: string }) {
  const [t] = useTranslation();

  return (
    <Section>
      <Glow $flip />
      <SectionContainer>
        <SectionHeading
          id="contacts"
          lead={t("contacts_lead")}
          accent={t("contacts_accent")}
        />

        <Grid>
          <LeftColumn>
            <CardHeading>{t("footer_contacts")}</CardHeading>
            <ConnectionButtons
              background={"var(--color-primary)"}
              color={"var(--color-primary)"}
            />
          </LeftColumn>

          <RightColumn id={BOOKING_SECTION_ID}>
            <ConnectionForm language={language} onClose={() => {}} />
          </RightColumn>
        </Grid>
      </SectionContainer>
      <MapPlaceholder
        title="Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.273356384819!2d30.35803687630494!3d50.4546341870629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cc9a797be691%3A0x6529cfbd9c11e34!2zMTIx0JAsINC_0YDQvtGB0L_QtdC60YIg0J_QtdGA0LXQvNC-0LPQuCwgMTE10JAsINCa0LjRl9CyLCAwMjAwMA!5e0!3m2!1suk!2sua!4v1692952327783!5m2!1suk!2sua"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Section>
  );
}

/* Transparent so the dotted page background shows through; holds the glow */
const Section = styled.section`
  position: relative;
  isolation: isolate;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  align-items: start;

  & > *:first-of-type {
    order: 2;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 0.75fr 1.25fr;

    & > *:first-of-type {
      order: 0;
    }
  }
`;

const cardBox = (theme: ThemeType) => `
  ${cardSurface(theme)}
  padding: var(--space-5);

  @media screen and (min-width: 600px) {
    padding: var(--space-6);
  }
`;

/* No frame: the contacts sit on the page background, aligned with the form's content */
const LeftColumn = styled.div`
  @media (min-width: 1024px) {
    padding-top: var(--space-6);
    position: sticky;
    top: calc(var(--header-height) + var(--space-5));
  }
`;

const CardHeading = styled.h3<{ theme?: ThemeType }>`
  ${(props) => cardTitle(props.theme as ThemeType)}
  margin-bottom: var(--space-5);
`;

const RightColumn = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardBox(props.theme as ThemeType)}
  scroll-margin-top: calc(var(--header-height) + var(--space-5));
`;

/* Full-bleed map closing the section, edge to edge */
const MapPlaceholder = styled.iframe<{ theme?: ThemeType }>`
  display: block;
  width: 100%;
  height: clamp(320px, 40vw, 460px);
  border: 0;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.cardBg};

  [data-theme="dark"] & {
    filter: invert(0.9) hue-rotate(180deg) brightness(0.95) contrast(0.9);
  }
`;
