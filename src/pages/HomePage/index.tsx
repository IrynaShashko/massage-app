import { FC } from "react";

import styled from "@emotion/styled";

import "../../index.css";

import { About } from "../../components/About";
import { Hero } from "../../components/Hero";

import BookNow from "../../components/BookNow";
import { HomePagePropsType } from "./types";

const HomePage: FC<HomePagePropsType> = ({ language }) => {
  return (
    <>
      <Hero language={language} />
      <InfoDiv>
        <About />
      </InfoDiv>
      <BookNow language={language} />
    </>
  );
};

export default HomePage;

export const LocationText = styled.p`
  text-decoration: none;
  color: #fff;
  font-size: 20px;
  font-weight: lighter;
  text-shadow: 0px 0px 7px rgba(255, 255, 255, 1);
`;

export const ModalNumber = styled.a`
  text-decoration: none;
  color: #fff;
  font-size: 25px;
  font-weight: lighter;
  text-shadow: 0px 0px 7px rgba(255, 255, 255, 1);
`;

export const LocationButton = styled.a`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: #fff;
  margin-bottom: 20px;
`;

export const InfoDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;
