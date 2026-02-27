import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import styled from "@emotion/styled";

import { ThemeType } from "../../theme/theme";

import { SectionContainer } from "../../App";
import { Title } from "../About";
import { ConnectionButtons } from "../ConnectionButton";
import { ConnectionForm } from "../ConnectionForm";

export default function BookNow({ language }: { language: string }) {
  const [t] = useTranslation();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  return (
    <Section>
      <SectionContainer>
        <Header id="contacts">
          <Title>{t("contact_information")}</Title>
        </Header>

        <Grid>
          <LeftColumn>
            <ConnectionButtons background={"#007586"} color={"#007586"} />
          </LeftColumn>

          <RightColumn id="booking-section">
            <ConnectionForm
              isOpen={true}
              language={language}
              onClose={() => {}}
            />
          </RightColumn>
        </Grid>
      </SectionContainer>
      <MapPlaceholder
        title="Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.273356384819!2d30.35803687630494!3d50.4546341870629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cc9a797be691%3A0x6529cfbd9c11e34!2zMTIx0JAsINC_0YDQvtGB0L_QtdC60YIg0J_QtdGA0LXQvNC-0LPQuCwgMTE10JAsINCa0LjRl9CyLCAwMjAwMA!5e0!3m2!1suk!2sua!4v1692952327783!5m2!1suk!2sua"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        theme={theme}
      />
    </Section>
  );
}

const Section = styled.section<{ theme?: ThemeType }>`
  background-color: ${(props) => props.theme.colors.background};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 64px;
  scroll-margin-top: 100px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const LeftColumn = styled.div``;
const RightColumn = styled.div`
  scroll-margin-top: 100px;
`;

const MapPlaceholder = styled.iframe`
  margin-top: 32px;
  height: 350px;
  width: 100%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  color: #6b7280;
`;
