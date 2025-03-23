import { FC } from "react";

import expectation from "../../json/expectation.json";
import expectationEn from "../../json/expectationEn.json";

import {
  ArticleAfterTitle,
  ArticleText,
  ArticleTitle,
} from "../../pages/ArticlePage";

import { ArticlePagePropsType } from "../../pages/ArticlePage/types";

const Expectation: FC<ArticlePagePropsType> = ({ language }) => {
  const { title, sections } = language === "ua" ? expectation : expectationEn;

  const contentList = sections.map((item, index) => (
    <div key={index}>
      <ArticleAfterTitle>{item.subtitle}</ArticleAfterTitle>
      <ArticleText>{item.content}</ArticleText>
      {item.points.map(({ title, description }, index) => (
        <ul>
          <li key={index}>
            <ArticleText>
              <strong>{title}: </strong> {description}
            </ArticleText>
          </li>
        </ul>
      ))}
    </div>
  ));

  return (
    <div>
      <ArticleTitle>{title}</ArticleTitle>
      {contentList}
    </div>
  );
};

export default Expectation;
