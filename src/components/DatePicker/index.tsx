import {
  FC,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

import { ThemeType } from "../../theme/theme";

/* ---------- date helpers (local time, no timezone surprises) ---------- */

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

const isSameDay = (a: Date | null, b: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export const fromIsoDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

/** Monday-based index: Mon = 0 … Sun = 6 */
const weekdayIndex = (date: Date) => (date.getDay() + 6) % 7;

/* ---------- component ---------- */

type DatePickerProps = {
  id: string;
  value: string;
  onChange: (isoDate: string) => void;
  /** BCP-47 locale for month and weekday names, e.g. "uk-UA" */
  locale: string;
  labels: {
    placeholder: string;
    clear: string;
    today: string;
    previousMonth: string;
    nextMonth: string;
  };
};

export const DatePicker: FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  locale,
  labels,
}) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const selected = fromIsoDate(value);

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    addMonths(selected ?? today, 0),
  );
  const [focusedDate, setFocusedDate] = useState<Date>(selected ?? today);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const monthTitle = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2024-01-01 was a Monday
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(2024, 0, 1 + i)),
    );
  }, [locale]);

  const days = useMemo(() => {
    const first = addMonths(viewMonth, 0);
    const offset = weekdayIndex(first);
    const daysInMonth = new Date(
      first.getFullYear(),
      first.getMonth() + 1,
      0,
    ).getDate();
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1),
      ),
    ];
  }, [viewMonth]);

  const displayValue = selected
    ? new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selected)
    : "";

  const canGoBack =
    viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() &&
      viewMonth.getMonth() > today.getMonth());

  const open = () => {
    const start = selected ?? today;
    setViewMonth(addMonths(start, 0));
    setFocusedDate(start);
    setIsOpen(true);
  };

  const close = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const select = (date: Date) => {
    onChange(toIsoDate(date));
    close();
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keep keyboard focus on the focused day
  useLayoutEffect(() => {
    if (!isOpen) return;
    const button = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-date="${toIsoDate(focusedDate)}"]`,
    );
    button?.focus({ preventScroll: true });
  }, [isOpen, focusedDate, viewMonth]);

  const moveFocus = (date: Date) => {
    const target = date < today ? today : date;
    setFocusedDate(target);
    if (
      target.getMonth() !== viewMonth.getMonth() ||
      target.getFullYear() !== viewMonth.getFullYear()
    ) {
      setViewMonth(addMonths(target, 0));
    }
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (event.key in moves) {
      event.preventDefault();
      moveFocus(addDays(focusedDate, moves[event.key]));
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const delta = event.key === "PageUp" ? -1 : 1;
      moveFocus(
        new Date(
          focusedDate.getFullYear(),
          focusedDate.getMonth() + delta,
          focusedDate.getDate(),
        ),
      );
    }
  };

  const fullDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Root
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.stopPropagation();
          close();
        }
      }}
    >
      <Trigger
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        $open={isOpen}
        onClick={() => (isOpen ? close() : open())}
      >
        <TriggerText $placeholder={!selected}>
          {selected ? displayValue : labels.placeholder}
        </TriggerText>
        <CalendarDays size={20} aria-hidden />
      </Trigger>

      {selected && !isOpen && (
        <ClearInline
          type="button"
          aria-label={labels.clear}
          onClick={() => onChange("")}
        >
          <X size={16} aria-hidden />
        </ClearInline>
      )}

      <AnimatePresence>
        {isOpen && (
          <Popover
            role="dialog"
            aria-modal="false"
            aria-label={monthTitle}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Header>
              <MonthTitle aria-live="polite">{monthTitle}</MonthTitle>
              <NavGroup>
                <NavButton
                  type="button"
                  aria-label={labels.previousMonth}
                  disabled={!canGoBack}
                  onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                >
                  <ChevronLeft size={18} aria-hidden />
                </NavButton>
                <NavButton
                  type="button"
                  aria-label={labels.nextMonth}
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                >
                  <ChevronRight size={18} aria-hidden />
                </NavButton>
              </NavGroup>
            </Header>

            <Weekdays aria-hidden>
              {weekdays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </Weekdays>

            <DaysGrid ref={gridRef} role="grid" onKeyDown={onGridKeyDown}>
              {days.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} />;
                const isPast = date < today;
                const isSelected = isSameDay(date, selected);
                const isFocused = isSameDay(date, focusedDate);
                return (
                  <Day
                    key={toIsoDate(date)}
                    type="button"
                    role="gridcell"
                    data-date={toIsoDate(date)}
                    disabled={isPast}
                    tabIndex={isFocused ? 0 : -1}
                    aria-selected={isSelected}
                    aria-current={isSameDay(date, today) ? "date" : undefined}
                    aria-label={fullDate.format(date)}
                    $selected={isSelected}
                    $today={isSameDay(date, today)}
                    onClick={() => select(date)}
                  >
                    {date.getDate()}
                  </Day>
                );
              })}
            </DaysGrid>

            <Footer>
              <TextButton
                type="button"
                onClick={() => {
                  onChange("");
                  close();
                }}
              >
                {labels.clear}
              </TextButton>
              <TextButton type="button" onClick={() => select(today)}>
                {labels.today}
              </TextButton>
            </Footer>
          </Popover>
        )}
      </AnimatePresence>
    </Root>
  );
};

/* ---------- styles ---------- */

const Root = styled.div`
  position: relative;
`;

const Trigger = styled.button<{ $open: boolean; theme?: ThemeType }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid
    ${(props) =>
      props.$open ? "var(--color-primary)" : props.theme.colors.border};
  box-shadow: ${(props) =>
    props.$open ? "0 0 0 4px var(--color-primary-ring)" : "none"};
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  svg {
    flex-shrink: 0;
    color: var(--color-primary);
  }

  &:hover {
    border-color: var(--color-primary);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-ring);
  }
`;

const TriggerText = styled.span<{ $placeholder: boolean }>`
  opacity: ${(props) => (props.$placeholder ? 0.5 : 1)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const ClearInline = styled.button<{ theme?: ThemeType }>`
  position: absolute;
  top: 50%;
  right: 46px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  color: ${(props) => props.theme.colors.text};
  opacity: 0.55;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;

const Popover = styled(motion.div)<{ theme?: ThemeType }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  width: min(320px, calc(100vw - 40px));
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background-color: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: var(--shadow-lg);
  color: ${(props) => props.theme.colors.text};
  transform-origin: top left;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
`;

const MonthTitle = styled.span`
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const NavGroup = styled.div`
  display: flex;
  gap: var(--space-1);
`;

const NavButton = styled.button<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  color: ${(props) => props.theme.colors.text};
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-primary) 14%, transparent);
    color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: var(--space-1);

  span {
    text-align: center;
    font-size: var(--text-sm);
    font-weight: 600;
    opacity: 0.55;
    padding: 6px 0;
    text-transform: lowercase;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const Day = styled.button<{
  $selected: boolean;
  $today: boolean;
  theme?: ThemeType;
}>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: ${(props) => (props.$selected || props.$today ? 700 : 500)};
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$selected ? "#fff" : props.theme.colors.text)};
  background-color: ${(props) =>
    props.$selected ? "var(--color-primary)" : "transparent"};
  box-shadow: ${(props) =>
    props.$today && !props.$selected
      ? "inset 0 0 0 1.5px var(--color-primary)"
      : "none"};
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.$selected
        ? "var(--color-primary-hover)"
        : "color-mix(in srgb, var(--color-primary) 14%, transparent)"};
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.28;
    cursor: default;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
`;

const TextButton = styled.button`
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-weight: 700;
  font-size: var(--text-sm);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;
