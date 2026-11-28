import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";

import { User } from "../../hooks/useAuth";

/** "Iryna Shashko" -> "IS"; falls back to the email's first letter */
export const initials = (user: Pick<User, "name" | "email">) =>
  (user.name.trim() || user.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/**
 * The user's Google photo, or their initials when there is none or it fails
 * to load. Decorative: the link or button around it carries the label.
 */
export const UserAvatar: FC<{
  user: Pick<User, "name" | "email" | "avatarUrl">;
  size?: number;
}> = ({ user, size = 32 }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [user.avatarUrl]);

  return (
    <Circle $size={size} aria-hidden>
      {user.avatarUrl && !failed ? (
        <img
          src={user.avatarUrl}
          alt=""
          // Google photos refuse requests that carry a referrer
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(user)
      )}
    </Circle>
  );
};

const Circle = styled.span<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary) 22%, transparent),
    color-mix(in srgb, #6a7bd8 18%, transparent)
  );
  color: var(--color-primary);
  font-size: ${(p) => Math.round(p.$size * 0.4)}px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
