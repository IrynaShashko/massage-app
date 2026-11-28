import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";

import { ThemeType } from "../../theme/theme";

const pad = (n: number) => String(n).padStart(2, "0");

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));

type TimePickerProps = {
  id: string;
  /** HH:MM, or "" when nothing is picked yet */
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  /** minutes between the options in the minute column */
  minuteStep?: number;
  /** hour to scroll to when nothing is picked yet */
  defaultHour?: number;
  invalid?: boolean;
};

/** Rough height of the open list, to decide whether it fits below */
const POPOVER_HEIGHT = 280;

/**
 * A time field in the site's style: clicking anywhere on it opens two
 * columns, hours and minutes. Picking a minute closes it.
 */
export const TimePicker: FC<TimePickerProps> = ({
  id,
  value,
  onChange,
  placeholder = "--:--",
  minuteStep = 5,
  defaultHour = 10,
  invalid = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const [hour = "", minute = ""] = value ? value.split(":") : [];
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) =>
    pad(i * minuteStep),
  );

  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setOpenUp(below < POPOVER_HEIGHT && rect.top > below);
    }
    setIsOpen(true);
  };

  const close = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
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

  // Scroll both columns so the current choice sits near the top
  useLayoutEffect(() => {
    if (!isOpen) return;
    const scrollTo = (column: HTMLDivElement | null, key: string) => {
      const option = column?.querySelector<HTMLElement>(
        `[data-value="${key}"]`,
      );
      if (column && option) column.scrollTop = option.offsetTop - 4;
    };
    scrollTo(hoursRef.current, hour || pad(defaultHour));
    scrollTo(minutesRef.current, minute || "00");
    // only when it opens, so the list doesn't jump while picking
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const pickHour = (h: string) => onChange(`${h}:${minute || "00"}`);
  const pickMinute = (m: string) => {
    onChange(`${hour || pad(defaultHour)}:${m}`);
    close();
  };

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
        aria-invalid={invalid || undefined}
        $open={isOpen}
        $invalid={invalid}
        onClick={() => (isOpen ? close() : open())}
      >
        <TriggerText $placeholder={!value}>{value || placeholder}</TriggerText>
        <Clock size={20} aria-hidden />
      </Trigger>

      <AnimatePresence>
        {isOpen && (
          <Popover
            role="dialog"
            aria-modal="false"
            $up={openUp}
            initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Column ref={hoursRef} role="listbox" aria-label="Hours">
              {HOURS.map((h) => (
                <Option
                  key={h}
                  type="button"
                  role="option"
                  data-value={h}
                  aria-selected={h === hour}
                  $selected={h === hour}
                  onClick={() => pickHour(h)}
                >
                  {h}
                </Option>
              ))}
            </Column>
            <Divider aria-hidden>:</Divider>
            <Column ref={minutesRef} role="listbox" aria-label="Minutes">
              {minutes.map((m) => (
                <Option
                  key={m}
                  type="button"
                  role="option"
                  data-value={m}
                  aria-selected={m === minute}
                  $selected={m === minute}
                  onClick={() => pickMinute(m)}
                >
                  {m}
                </Option>
              ))}
            </Column>
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

const Trigger = styled.button<{
  $open: boolean;
  $invalid: boolean;
  theme?: ThemeType;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  min-height: 48px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid
    ${(props) =>
      props.$invalid
        ? "#d64545"
        : props.$open
          ? "var(--color-primary)"
          : props.theme.colors.border};
  box-shadow: ${(props) =>
    props.$open ? "0 0 0 4px var(--color-primary-ring)" : "none"};
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  svg {
    flex-shrink: 0;
    color: var(--color-primary);
  }

  @media (hover: hover) {
    &:hover {
      border-color: var(--color-primary);
    }
  }

  &:focus-visible {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-ring);
  }
`;

const TriggerText = styled.span<{ $placeholder: boolean }>`
  opacity: ${(props) => (props.$placeholder ? 0.5 : 1)};
`;

const Popover = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== "$up",
})<{ theme?: ThemeType; $up: boolean }>`
  position: absolute;
  ${(props) =>
    props.$up ? "bottom: calc(100% + 8px);" : "top: calc(100% + 8px);"}
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  align-items: stretch;
  gap: 4px;
  min-width: 156px;
  height: 248px;
  padding: 6px;
  border-radius: var(--radius-lg);
  background-color: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: var(--shadow-lg);
  color: ${(props) => props.theme.colors.text};
  transform-origin: ${(props) => (props.$up ? "bottom left" : "top left")};
`;

const Column = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Divider = styled.span`
  align-self: center;
  font-weight: 700;
  opacity: 0.4;
`;

const Option = styled.button<{ $selected: boolean; theme?: ThemeType }>`
  flex-shrink: 0;
  min-height: 40px;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: ${(props) => (props.$selected ? 700 : 500)};
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$selected ? "#fff" : props.theme.colors.text)};
  background-color: ${(props) =>
    props.$selected ? "var(--color-primary)" : "transparent"};
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: ${(props) =>
        props.$selected
          ? "var(--color-primary)"
          : "color-mix(in srgb, var(--color-primary) 12%, transparent)"};
    }
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
`;
