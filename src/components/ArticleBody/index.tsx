import { FC, ReactNode } from "react";

import { ArticleAfterTitle, ArticleText } from "../../pages/ArticlePage";
import { parseArticle } from "./parseArticle";

/**
 * Renders the small text format the admin writes articles in:
 *
 *   ## Subheading
 *   A paragraph. Blank lines separate paragraphs.
 *   - list item, **bold** works anywhere
 *
 * Everything becomes React elements (no innerHTML), so article text can never
 * inject markup into the page.
 */

const inline = (text: string): ReactNode[] =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );

export const ArticleBody: FC<{ source: string }> = ({ source }) => (
  <>
    {parseArticle(source).map((block, i) => {
      if (block.kind === "heading") {
        return (
          <ArticleAfterTitle key={i}>{inline(block.text)}</ArticleAfterTitle>
        );
      }
      if (block.kind === "list") {
        return (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <ArticleText>{inline(item)}</ArticleText>
              </li>
            ))}
          </ul>
        );
      }
      return <ArticleText key={i}>{inline(block.text)}</ArticleText>;
    })}
  </>
);
