import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import { cardSurface } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

/**
 * Grey placeholders in the shape of the content that is loading, so a page
 * keeps its layout instead of showing an empty space or a spinner.
 */

const shimmer = keyframes`
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
`;

export const SkeletonStack = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: ${(props) => props.$gap ?? "8px"};
`;

export const SkeletonBlock = styled.span<{
  $w: string;
  $h: string;
  $round?: boolean;
  theme?: ThemeType;
}>`
  display: block;
  flex-shrink: 0;
  max-width: 100%;
  width: ${(props) => props.$w};
  height: ${(props) => props.$h};
  border-radius: ${(props) => (props.$round ? "var(--radius-full)" : "6px")};
  background: linear-gradient(
    90deg,
    color-mix(in srgb, ${(props) => props.theme.colors.text} 8%, transparent)
      25%,
    color-mix(in srgb, ${(props) => props.theme.colors.text} 16%, transparent)
      50%,
    color-mix(in srgb, ${(props) => props.theme.colors.text} 8%, transparent)
      75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/** Wraps placeholders: announced once as "loading", hidden from screen readers inside */
export const SkeletonRegion: FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const [t] = useTranslation();
  return (
    <div
      className={className}
      role="status"
      aria-busy="true"
      aria-label={t("loading")}
    >
      <div aria-hidden>{children}</div>
    </div>
  );
};

/** Varied widths so a block of text does not look like a barcode */
const LINE_WIDTHS = ["100%", "92%", "97%", "64%", "88%", "76%"];

export const SkeletonLines: FC<{ count?: number; height?: string }> = ({
  count = 3,
  height = "14px",
}) => (
  <SkeletonStack $gap="10px">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonBlock
        key={i}
        $w={i === count - 1 ? "60%" : LINE_WIDTHS[i % LINE_WIDTHS.length]}
        $h={height}
      />
    ))}
  </SkeletonStack>
);

/** List rows: optional leading circle, a title and a sub line, optional action pills */
export const SkeletonRows: FC<{
  count?: number;
  avatar?: boolean;
  actions?: number;
  /** a third, longer line (e.g. a review's text) */
  body?: boolean;
}> = ({ count = 3, avatar = false, actions = 0, body = false }) => (
  <SkeletonRegion>
    <Rows>
      {Array.from({ length: count }, (_, i) => (
        <Row key={i}>
          {avatar && <SkeletonBlock $w="40px" $h="40px" $round />}
          <SkeletonStack>
            <SkeletonBlock $w={i % 2 ? "38%" : "52%"} $h="16px" />
            <SkeletonBlock $w={i % 2 ? "24%" : "30%"} $h="12px" />
            {body && (
              <SkeletonBlock
                $w={i % 2 ? "70%" : "86%"}
                $h="12px"
                style={{ marginTop: 4 }}
              />
            )}
          </SkeletonStack>
          {Array.from({ length: actions }, (_, j) => (
            <SkeletonBlock key={j} $w="96px" $h="38px" $round />
          ))}
        </Row>
      ))}
    </Rows>
  </SkeletonRegion>
);

/** A form: label + input pairs, then a button */
export const SkeletonForm: FC<{ fields?: number; tall?: boolean }> = ({
  fields = 3,
  tall = false,
}) => (
  <SkeletonRegion>
    <SkeletonStack $gap="var(--space-5)">
      {Array.from({ length: fields }, (_, i) => (
        <SkeletonStack key={i} $gap="10px">
          <SkeletonBlock $w={i % 2 ? "90px" : "130px"} $h="14px" />
          <SkeletonBlock
            $w="100%"
            $h={tall && i === fields - 1 ? "220px" : "48px"}
            style={{ borderRadius: "var(--radius-md)" }}
          />
        </SkeletonStack>
      ))}
      <SkeletonBlock $w="160px" $h="46px" $round />
    </SkeletonStack>
  </SkeletonRegion>
);

/** An article: title, then paragraphs */
export const SkeletonArticle: FC = () => (
  <SkeletonRegion>
    <SkeletonStack $gap="var(--space-5)">
      <SkeletonBlock $w="70%" $h="32px" />
      <SkeletonLines count={4} />
      <SkeletonLines count={5} />
      <SkeletonBlock $w="45%" $h="22px" />
      <SkeletonLines count={3} />
    </SkeletonStack>
  </SkeletonRegion>
);

/** Whole page while its code or the signed-in user loads: a title and a card of rows */
export const PageSkeleton: FC = () => (
  <PageWrap>
    <SkeletonRegion>
      <SkeletonStack $gap="var(--space-5)">
        <SkeletonBlock $w="min(320px, 70%)" $h="36px" />
        <SkeletonCard>
          <SkeletonRows count={4} />
        </SkeletonCard>
      </SkeletonStack>
    </SkeletonRegion>
  </PageWrap>
);

/** Card surface for placeholders, same as the real cards */
export const SkeletonCard = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  padding: var(--space-5);

  @media screen and (min-width: 600px) {
    padding: var(--space-6);
  }
`;

const PageWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-7) 20px;

  @media screen and (min-width: 900px) {
    padding: var(--space-8) 40px;
  }
`;

const Rows = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;

  & > * {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }

  & > * + * {
    border-top: 1px solid ${(props) => props.theme.colors.border};
  }

  & > *:first-of-type {
    padding-top: 0;
  }

  & > *:last-of-type {
    padding-bottom: 0;
  }
`;

const Row = styled.div``;
