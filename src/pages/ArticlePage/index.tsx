import { NavLink, Outlet } from "react-router-dom";

import styled from "@emotion/styled";

import { Container } from "../../App";
import { Contacts } from "../../components/Contacts";

import lady from "../../images/lady.png";

import { ThemeType } from "../../theme/theme";

const ArticlePage = () => {
  return (
    <>
      <PageContainer>
        <Container>
          <PageWrapper>
            <Sidebar>
              <ImageStyled src={lady} alt="lady" />
              <ListContainer>
                <li>
                  <ArticleLink to="/article/questions">
                    <ArticleItem>Питання, які часто задають.</ArticleItem>
                  </ArticleLink>
                </li>
                <li>
                  <ArticleLink to="/article/health">
                    <ArticleItem>Здорове тіло.</ArticleItem>
                  </ArticleLink>
                </li>
                <li>
                  <ArticleLink to="/article/expectation">
                    <ArticleItem>Масаж: чого очікувати від сеансу?</ArticleItem>
                  </ArticleLink>
                </li>
              </ListContainer>
            </Sidebar>
            <Content>
              <Outlet />
            </Content>
          </PageWrapper>
        </Container>
      </PageContainer>
      <Contacts />
    </>
  );
};

export default ArticlePage;

export const PageContainer = styled.div<{ theme?: ThemeType }>`
  display: flex;
  min-height: 700px;
  gap: 20px;
  background-color: ${(props) => props.theme.colors.aboutBg};
  @media screen and (min-width: 769px) {
    padding: 30px;
  }
  @media screen and (min-width: 1024px) {
    padding: 50px;
  }
`;

const PageWrapper = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  @media screen and (min-width: 769px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const ListContainer = styled.ul`
  padding: 20px;
  @media screen and (min-width: 769px) {
    padding: 0;
    padding-right: 20px;
  }
`;

export const Sidebar = styled.aside<{ theme?: ThemeType }>`
  align-items: flex-end;
  flex-shrink: 0;
  border-radius: 8px;
  @media screen and (min-width: 769px) {
    width: 350px;
  }
  @media screen and (min-width: 769px) {
    width: 350px;
  }
  @media screen and (min-width: 1024px) {
    width: 450px;
  }
`;

export const Content = styled.section<{ theme?: ThemeType }>`
  flex-grow: 1;
  padding: 20px;
  margin: 0 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  background-color: ${(props) => props.theme.colors.cardBg};
  @media screen and (min-width: 769px) {
    margin: 0;
  }
  @media screen and (min-width: 1440px) {
    padding: 50px;
  }
`;

export const ArticleLink = styled(NavLink)<{ theme?: ThemeType }>`
  font-size: 20px;
  color: #000;
  cursor: pointer;
  text-decoration: none;
  display: block;
  margin-bottom: 10px;
  &.active {
    color: ${(props) => props.theme.colors.primary};
    font-weight: 850;
  }
`;

export const ArticleItem = styled.div`
  padding: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
  transition: background 0.6s ease;
  &:hover {
    background-color: #e4e4e4;
    transform: scale(1.02);
  }
`;

export const ArticleTitle = styled.h1`
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 800;
  @media screen and (min-width: 768px) {
    margin-bottom: 50px;
  }
`;

export const ArticleAfterTitle = styled.h2<{ theme?: ThemeType }>`
  font-size: 20px;
  color: ${(props) => props.theme.colors.primary};
  margin-top: 10px;
  margin-bottom: 10px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

export const ArticleText = styled.p<{ theme?: ThemeType }>`
  font-size: 18px;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 10px;
  text-indent: 50px;
  line-height: 30px;
`;

const ImageStyled = styled.img`
  width: auto;
  height: 150px;
  margin-top: 30px;
  margin-left: auto;
  cursor: pointer;
  @media screen and (min-width: 769px) {
    height: 180px;
    margin-top: 0;
  }
  @media screen and (min-width: 1024px) {
    height: 270px;
  }
`;
