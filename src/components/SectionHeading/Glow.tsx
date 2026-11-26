import styled from "@emotion/styled";

/**
 * Soft coloured light behind a section. The parent needs
 * `position: relative; isolation: isolate;`.
 */
export const Glow = styled.div<{ $flip?: boolean }>`
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background:
    radial-gradient(
      38% 46% at ${(props) => (props.$flip ? "82%" : "18%")} 32%,
      var(--glow-a),
      transparent 72%
    ),
    radial-gradient(
      34% 42% at ${(props) => (props.$flip ? "16%" : "84%")} 68%,
      var(--glow-b),
      transparent 72%
    );
`;

/** Full-width section that can hold a Glow behind its content */
export const GlowSection = styled.section`
  position: relative;
  isolation: isolate;
  width: 100%;
  align-self: stretch;
`;
