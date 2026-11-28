import { useLayoutEffect, useRef, useState } from "react";

import styled from "@emotion/styled";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cardSurface } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

import { Review } from "../../hooks/useReviews";

export const STAR_GOLD = "#e9b949";

/** Long reviews are collapsed to this many lines with a "Read more" toggle */
const CLAMP_LINES = 5;

const toLocale = (language: string) => (language === "ua" ? "uk" : language);

export const formatDate = (iso: string | undefined, language: string) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(toLocale(language), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

/**
 * Read-only stars. Fractional values fill the last star partially
 * (4.6 → four full stars and one 60% filled), like on Google or Booking.
 */
export const RatingStars = ({
  value,
  size = 16,
  label,
}: {
  value: number;
  size?: number;
  /** Accessible text; defaults to "value / 5" */
  label?: string;
}) => (
  <StarsRow role="img" aria-label={label ?? `${value} / 5`}>
    {Array.from({ length: 5 }, (_, i) => {
      const fill = Math.min(1, Math.max(0, value - i));
      return (
        <StarSlot key={i} style={{ width: size, height: size }}>
          <Star size={size} aria-hidden fill="none" strokeWidth={1.6} />
          {fill > 0 && (
            <StarFill style={{ width: `${fill * 100}%` }}>
              <Star
                size={size}
                aria-hidden
                fill="currentColor"
                strokeWidth={1.6}
              />
            </StarFill>
          )}
        </StarSlot>
      );
    })}
  </StarsRow>
);

export const ReviewItem = ({
  review,
  language,
}: {
  review: Review;
  language: string;
}) => {
  const [t] = useTranslation();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  // Show "Read more" only when the text really overflows the clamp
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || isExpanded) return;
    const measure = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isExpanded, review.comment]);

  const name = review.user?.name?.trim() || "—";
  const date = formatDate(review.createdAt, language);

  return (
    <Card>
      <Header>
        <Avatar aria-hidden>{name.charAt(0)}</Avatar>
        <HeaderText>
          <UserName>{name}</UserName>
          <Meta>
            <RatingStars value={review.rating} />
            {date && <DateText dateTime={review.createdAt}>{date}</DateText>}
          </Meta>
        </HeaderText>
      </Header>

      <Text ref={textRef} $clamped={!isExpanded}>
        {review.comment}
      </Text>

      {(isClamped || isExpanded) && (
        <ReadMore
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? t("show_less") : t("read_more")}
        </ReadMore>
      )}
    </Card>
  );
};

/* Shared with the loading skeleton so both have the same size */
export const Card = styled.li<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  padding: var(--space-5) var(--space-6);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--gradient-accent);
  color: #fff;
  font-weight: 800;
  font-size: var(--text-lg);
  text-transform: uppercase;
`;

const UserName = styled.p<{ theme?: ThemeType }>`
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  overflow-wrap: anywhere;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--space-3);
  row-gap: 2px;
  margin-top: 2px;
`;

const StarsRow = styled.span`
  display: inline-flex;
  gap: 2px;
  color: ${STAR_GOLD};
`;

const StarSlot = styled.span`
  position: relative;
  display: inline-block;
  flex-shrink: 0;

  & > svg {
    display: block;
    opacity: 0.55;
  }
`;

/* Clips a filled star to the fractional width */
const StarFill = styled.span`
  position: absolute;
  inset: 0 auto 0 0;
  overflow: hidden;

  svg {
    display: block;
  }
`;

const DateText = styled.time<{ theme?: ThemeType }>`
  font-size: var(--text-sm);
  color: ${(props) => props.theme.colors.text};
  opacity: 0.6;
`;

const Text = styled.p<{ $clamped: boolean; theme?: ThemeType }>`
  line-height: 1.7;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.85;
  white-space: pre-line;
  overflow-wrap: anywhere;

  ${(props) =>
    props.$clamped &&
    `
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: ${CLAMP_LINES};
    overflow: hidden;
  `}
`;

const ReadMore = styled.button`
  margin-top: var(--space-2);
  padding: 0;
  color: var(--color-primary);
  font-weight: 700;
  font-size: var(--text-sm);

  @media (hover: hover) {
    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
`;
