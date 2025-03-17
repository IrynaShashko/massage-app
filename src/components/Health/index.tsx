import { FC } from "react";

import health from "../../json/health.json";
import healthEn from "../../json/healthEn.json";

import {
  ArticleAfterTitle,
  ArticleText,
  ArticleTitle,
} from "../../pages/ArticlePage";

import { ArticlePagePropsType } from "../../pages/ArticlePage/types";

const Health: FC<ArticlePagePropsType> = ({ language }) => {
  const { content, feedback, title, after_title } =
    language === "ua" ? health : healthEn;

  const contentItem = content.map((item) => (
    <div>
      <ArticleText>{item.text}</ArticleText>
    </div>
  ));

  const listItem = feedback.map((item) => (
    <li>
      <ArticleText>
        <strong>{item.title}: </strong>
        {item.text}
      </ArticleText>
    </li>
  ));

  return (
    <div>
      <ArticleTitle>{title}</ArticleTitle>
      {contentItem}
      <div>
        <ArticleAfterTitle>{after_title}</ArticleAfterTitle>
        <ul>{listItem}</ul>
      </div>
    </div>
  );
};

export default Health;
