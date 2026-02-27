import styled from "styled-components";

import { ThemeType } from "../../theme/theme";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <CopyrightContainer>
      <CopyrightText>
        © {currentYear} Maria Glushenko. All rights reserved
      </CopyrightText>
    </CopyrightContainer>
  );
};

const CopyrightContainer = styled.footer`
  padding-top: 20px;
  padding-bottom: 20px;
  max-width: 300px;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  text-align: center;
  @media screen and (min-width: 768px) {
    max-width: 600px;
  }
`;

const CopyrightText = styled.p<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.text};
`;
