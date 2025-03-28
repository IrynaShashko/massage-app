import { useEffect, useState } from "react";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import dotArrowLeft from "../../images/dotArrowLeft.png";

import { Container } from "../../App";
import { ConnectionButtons } from "../ConnectionButton";

import { ThemeType } from "../../theme/theme";

export const Contacts = () => {
  const [t] = useTranslation();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  return (
    <Wrapper>
      <ContactsContainer id="contacts">
        <Container>
          <GridContainer>
            <Grid1>
              <Title>{t("contact_information")}</Title>
              <ConnectionButtons background={"#F7F7F7"} color={"#F7F7F7"} />
            </Grid1>
            <Grid2>
              <DecorativeElementTopRight />
              <Location
                title="Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.273356384819!2d30.35803687630494!3d50.4546341870629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cc9a797be691%3A0x6529cfbd9c11e34!2zMTIx0JAsINC_0YDQvtGB0L_QtdC60YIg0J_QtdGA0LXQvNC-0LPQuCwgMTE10JAsINCa0LjRl9CyLCAwMjAwMA!5e0!3m2!1suk!2sua!4v1692952327783!5m2!1suk!2sua"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                theme={theme}
              />
            </Grid2>
          </GridContainer>
        </Container>
      </ContactsContainer>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  position: relative;
`;

const DecorativeElementTopRight = styled.div`
  position: absolute;
  left: -10%;
  bottom: -15%;
  width: 150px;
  height: 150px;
  background-image: url(${dotArrowLeft});
  background-size: contain;
  background-repeat: no-repeat;
  @media screen and (min-width: 768px) {
    bottom: -15%;
    width: 200px;
    height: 200px;
  }
  @media screen and (min-width: 1024px) {
    bottom: -15%;
  }
  @media screen and (min-width: 1440px) {
    left: -10%;
    bottom: -15%;
  }
`;

const ContactsContainer = styled.div<{ theme?: ThemeType }>`
  background-color: ${(props) => props.theme.colors.primary};
  text-align: center;
  padding: 50px 20px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 0.5fr 1fr;
  gap: 10px 10px;
  width: fit-content;
  margin: 0 auto;
  grid-template-areas:
    "grid1"
    "grid2";
  @media screen and (min-width: 1440px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "grid1 grid2";
  }
`;

const Grid1 = styled.div`
  grid-area: "grid1";
  align-self: center;
`;

const Grid2 = styled.div`
  grid-area: "grid2";
  display: flex;
  justify-content: center;
  position: relative;
`;

const Title = styled.h3`
  color: #f7f7f7;
  font-size: 30px;
  text-transform: uppercase;
  font-weight: lighter;
  margin-bottom: 20px;
`;

const Location = styled.iframe`
  width: 600px;
  height: 400px;
  border-radius: 12px;
  align-self: center;
  z-index: 5;
`;
