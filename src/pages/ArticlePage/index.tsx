import { NavLink, Outlet } from "react-router-dom";

import styled from "@emotion/styled";

import { Container } from "../../App";

import { Contacts } from "../../components/Contacts";

import { ThemeType } from "../../theme/theme";

export const ArticlePage = () => {
  return (
    <>
      <PageContainer>
        <Container>
          <PageWrapper>
            <Sidebar>
              <ul>
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
              </ul>
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

export const PageContainer = styled.div<{ theme?: ThemeType }>`
  display: flex;
  min-height: 700px;
  padding: 20px;
  gap: 20px;
  background-color: ${(props) => props.theme.colors.aboutBg};
  @media screen and (min-width: 768px) {
    padding-top: 50px;
    padding-bottom: 50px;
  }
`;

const PageWrapper = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media screen and (min-width: 769px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const Sidebar = styled.aside<{ theme?: ThemeType }>`
  @media screen and (min-width: 769px) {
    width: 250px;
    flex-shrink: 0;
    border-radius: 8px;
  }
`;

export const Content = styled.section<{ theme?: ThemeType }>`
  flex-grow: 1;
  padding: 50px;
  border-radius: 8px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  background-color: ${(props) => props.theme.colors.cardBg};
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
    font-weight: 600;
  }
`;

export const ArticleItem = styled.div`
  padding: 10px;
  border-radius: 8px;
  background-color: #e0e0e0;
  text-align: center;
  transition: background 0.3s ease;
  &:hover {
    background-color: #dbd9d9;
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
