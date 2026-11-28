import { FC } from "react";

import styled from "@emotion/styled";
import { MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ThemeType } from "../../theme/theme";

import logo from "../../images/logo.png";

import {
  linkTarget,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_HREF,
  SOCIALS,
} from "../../config/contacts";

const NAV = [
  { to: "/", key: "home_button" },
  { to: "/about", key: "about_button" },
  { to: "/price", key: "price_button" },
  { to: "/reviews", key: "reviews_button" },
  { to: "/article", key: "article_button" },
];

export const Footer: FC = () => {
  const [t] = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <FooterRoot>
      <Inner>
        <Brand>
          <Link to="/" aria-label={t("home_button")}>
            <Logo src={logo} alt={t("name_title")} />
          </Link>
          <Tagline>{t("footer_tagline")}</Tagline>
          <Socials>
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <SocialLink
                  href={href}
                  {...linkTarget(href)}
                  aria-label={label}
                >
                  <Icon aria-hidden />
                </SocialLink>
              </li>
            ))}
          </Socials>
        </Brand>

        <Column>
          <ColumnTitle>{t("footer_nav")}</ColumnTitle>
          <List>
            {NAV.map(({ to, key }) => (
              <li key={to}>
                <FooterLink to={to}>{t(key)}</FooterLink>
              </li>
            ))}
          </List>
        </Column>

        <Column>
          <ColumnTitle>{t("footer_contacts")}</ColumnTitle>
          <List>
            <li>
              <ContactLink href={PHONE_HREF}>
                <Phone size={18} aria-hidden />
                {PHONE_DISPLAY}
              </ContactLink>
            </li>
            <li>
              <ContactLink
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={18} aria-hidden />
                <span>
                  {t("address")}
                  <Small>{t("footer_directions")} →</Small>
                </span>
              </ContactLink>
            </li>
          </List>
        </Column>
      </Inner>

      <Bottom>
        <span>
          © {currentYear} {t("name_title")}. {t("footer_rights")}.
        </span>
      </Bottom>
    </FooterRoot>
  );
};

/* Sits right under the full-width map: no gap and no divider line */
const FooterRoot = styled.footer<{ theme?: ThemeType }>`
  color: ${(props) => props.theme.colors.text};
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) 20px var(--space-6);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-7);

  @media screen and (min-width: 700px) {
    grid-template-columns: 1fr 1fr;
  }

  @media screen and (min-width: 900px) {
    padding: var(--space-8) 40px var(--space-6);
    grid-template-columns: 1.6fr 1fr 1.2fr;
  }
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  @media screen and (min-width: 700px) and (max-width: 899px) {
    grid-column: 1 / -1;
  }
`;

const Logo = styled.img`
  width: 140px;
  height: auto;
`;

const Tagline = styled.p`
  max-width: 34ch;
  opacity: 0.75;
`;

const Socials = styled.ul`
  display: flex;
  gap: var(--space-3);
`;

const SocialLink = styled.a<{ theme?: ThemeType }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.text};
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  &:hover {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const ColumnTitle = styled.h2`
  font-size: var(--text-sm);
  font-family: var(--font-body);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const FooterLink = styled(Link)`
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary);
  }
`;

const ContactLink = styled.a`
  display: inline-flex;
  align-items: flex-start;
  gap: var(--space-3);
  transition: color 0.2s ease;

  svg {
    flex-shrink: 0;
    margin-top: 3px;
    color: var(--color-primary);
  }

  &:hover {
    color: var(--color-primary);
  }
`;

const Small = styled.small`
  display: block;
  margin-top: 2px;
  font-size: var(--text-sm);
  color: var(--color-primary);
  font-weight: 600;
`;

const Bottom = styled.div<{ theme?: ThemeType }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-5) 20px;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  font-size: var(--text-sm);
  opacity: 0.65;

  @media screen and (min-width: 900px) {
    padding: var(--space-5) 40px;
  }
`;
