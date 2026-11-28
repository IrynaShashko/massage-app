import { KeyboardEvent, useRef, useState } from "react";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ThemeType } from "../../theme/theme";

import { STAR_GOLD } from "./ReviewItem";

const MAX = 5;
const LABEL_KEYS = [
  "rating_1",
  "rating_2",
  "rating_3",
  "rating_4",
  "rating_5",
] as const;

type Props = {
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  /** id of the visible label, for aria-labelledby */
  labelId: string;
  errorId?: string;
};

/**
 * Star rating as an accessible radio group:
 * one Tab stop, arrow keys change the value, hover previews it,
 * and a word ("Excellent", ...) describes the current choice.
 */
export const RatingInput = ({
  value,
  onChange,
  invalid,
  labelId,
  errorId,
}: Props) => {
  const [t] = useTranslation();
  const [hover, setHover] = useState(0);
  // Bumped on every pick so the pop animation replays even for the same value
  const [popKey, setPopKey] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const shown = hover || value;

  const pick = (next: number, focus = false) => {
    const clamped = Math.min(MAX, Math.max(1, next));
    onChange(clamped);
    setPopKey((k) => k + 1);
    if (focus) refs.current[clamped - 1]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const current = value || 0;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        pick(current + 1, true);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        pick(current - 1, true);
        break;
      case "Home":
        e.preventDefault();
        pick(1, true);
        break;
      case "End":
        e.preventDefault();
        pick(MAX, true);
        break;
    }
  };

  return (
    <Wrapper>
      <Row
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onPointerLeave={() => setHover(0)}
      >
        {Array.from({ length: MAX }, (_, i) => {
          const n = i + 1;
          const isOn = n <= shown;
          // Roving tabindex: only the chosen star (or the first) is tabbable
          const isTabStop = value ? n === value : n === 1;

          return (
            <StarButton
              key={n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} / ${MAX}, ${t(LABEL_KEYS[i])}`}
              tabIndex={isTabStop ? 0 : -1}
              $on={isOn}
              $invalid={!!invalid}
              // mouse only: a tap would leave the preview stuck on touch screens
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(n)}
              onFocus={() => setHover(0)}
              onClick={() => pick(n)}
              onKeyDown={onKeyDown}
            >
              <StarGlyph
                // Remount on each pick so the stagger animation runs again
                key={n <= value ? `on-${popKey}` : "off"}
                $pop={n <= value && popKey > 0}
                $delay={i * 50}
              >
                <Star size={30} strokeWidth={1.5} aria-hidden />
              </StarGlyph>
            </StarButton>
          );
        })}
      </Row>

      <Caption aria-hidden $visible={shown > 0}>
        {shown > 0 ? t(LABEL_KEYS[shown - 1]) : " "}
      </Caption>
    </Wrapper>
  );
};

const pop = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.28) rotate(-6deg); }
  70% { transform: scale(0.94); }
  100% { transform: scale(1); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--space-4);
  row-gap: var(--space-1);
`;

const Row = styled.div`
  display: flex;
  /* Hit areas stay 44px; the visible stars sit closer together */
  margin-inline: -7px;
`;

const StarButton = styled.button<{
  $on: boolean;
  $invalid: boolean;
  theme?: ThemeType;
}>`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);

  svg {
    display: block;
    transition:
      color 0.18s ease,
      fill 0.18s ease,
      filter 0.25s ease,
      transform 0.2s var(--ease-out);
    color: ${(props) =>
      props.$on
        ? STAR_GOLD
        : props.$invalid
          ? "#d64545"
          : `color-mix(in srgb, ${props.theme.colors.text} 38%, transparent)`};
    fill: ${(props) =>
      props.$on
        ? STAR_GOLD
        : `color-mix(in srgb, ${props.theme.colors.text} 7%, transparent)`};
    filter: ${(props) =>
      props.$on
        ? `drop-shadow(0 2px 6px color-mix(in srgb, ${STAR_GOLD} 45%, transparent))`
        : "none"};
  }

  @media (hover: hover) {
    &:hover svg {
      transform: scale(1.12);
    }
  }

  &:active svg {
    transform: scale(0.92);
  }

  &:focus-visible {
    outline-offset: 0;
    border-radius: var(--radius-full);
  }
`;

const StarGlyph = styled.span<{ $pop: boolean; $delay: number }>`
  display: block;
  animation: ${(props) => (props.$pop ? pop : "none")} 0.42s
    cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: ${(props) => props.$delay}ms;
`;

const Caption = styled.span<{ $visible: boolean; theme?: ThemeType }>`
  min-width: 8ch;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  opacity: ${(props) => (props.$visible ? 0.85 : 0)};
  transform: translateX(${(props) => (props.$visible ? "0" : "-4px")});
  transition:
    opacity 0.2s ease,
    transform 0.2s var(--ease-out);
`;
