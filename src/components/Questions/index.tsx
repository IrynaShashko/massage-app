import { FC } from "react";

import question from "../../json/question.json";
import questionEn from "../../json/questionEn.json";

import {
  ArticleAfterTitle,
  ArticleText,
  ArticleTitle,
} from "../../pages/ArticlePage";

import { ArticlePagePropsType } from "../../pages/ArticlePage/types";

const Questions: FC<ArticlePagePropsType> = ({ language }) => {
  const { title, introduction, sections, points, conclusion } =
    language === "ua" ? question : questionEn;

  const sectionItem = sections.map((item, index) => (
    <div key={index}>
      <ArticleAfterTitle>{item.subtitle}</ArticleAfterTitle>
      <ArticleText>{item.content}</ArticleText>
    </div>
  ));

  const pointItem = points.map((item, index) => (
    <li key={index}>
      <ArticleText>
        <strong>{item.title}: </strong> {item.description}
      </ArticleText>
    </li>
  ));

  return (
    <div>
      <ArticleTitle>{title}</ArticleTitle>
      <ArticleText>{introduction}</ArticleText>
      {sectionItem}
      <ul>{pointItem}</ul>
      <ArticleText>{conclusion}</ArticleText>
    </div>
  );
};

export default Questions;
