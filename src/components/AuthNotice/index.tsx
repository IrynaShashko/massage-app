import styled from "@emotion/styled";
import { Link } from "react-router-dom";

import { ThemeType } from "../../theme/theme";

/**
 * Compact tinted banner above a form that needs an account (reviews,
 * booking): text on the left, its action on the right, wrapping on phones
 */
export const NoticeBox = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-3);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: ${(props) => props.theme.colors.text};
  font-size: var(--text-sm);
  line-height: 1.45;

  & > p {
    flex: 1 1 220px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

/** Text and its smaller notes stacked on the left of a NoticeBox */
export const NoticeText = styled.div`
  display: flex;
  flex: 1 1 220px;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow-wrap: anywhere;

  small {
    font-size: var(--text-xs, 0.8125rem);
    opacity: 0.7;
  }
`;

export const NoticeActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
`;

const noticeButtonStyles = `
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 700;
  white-space: nowrap;
  text-decoration: none;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

export const NoticeButton = styled.button`
  ${noticeButtonStyles}
`;

export const NoticeLink = styled(Link)`
  ${noticeButtonStyles}
`;

/** Secondary action: a plain underlined link-style button */
export const NoticeTextButton = styled.button`
  padding: 4px 0;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;
