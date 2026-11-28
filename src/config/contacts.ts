import { FC, SVGProps } from "react";

import { ReactComponent as Instagram } from "../icons/instagram.svg";
import { ReactComponent as Phone } from "../icons/phone.svg";
import { ReactComponent as Telegram } from "../icons/telegram.svg";
import { ReactComponent as Viber } from "../icons/viber.svg";
import { ReactComponent as Whatsapp } from "../icons/whatsapp.svg";

/**
 * Single source of truth for every contact link on the site
 * (header menu, footer, contacts section, floating button, mobile contact sheet).
 */

export const PHONE = "+380936193616";
export const PHONE_DISPLAY = "+38 093 619 36 16";
export const PHONE_HREF = `tel:${PHONE}`;

export const TELEGRAM_HANDLE = "MashaHlushenko";
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLE}`;

export const INSTAGRAM_HANDLE = "mariia.hlushenko";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${PHONE.slice(1)}`;
// "+" must be encoded, otherwise some devices read it as a space and Viber can't find the number
export const VIBER_URL = `viber://chat?number=${encodeURIComponent(PHONE)}`;

export const MAPS_URL = "https://goo.gl/maps/o3qvsXRkfv8h3hdw5";

type IconType = FC<SVGProps<SVGSVGElement>>;

/** Opens in a new tab only for web links; app links (tel:, viber:) would leave an empty tab */
export const linkTarget = (href: string) =>
  href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

export type Contact = {
  id: "phone" | "telegram" | "whatsapp" | "viber";
  icon: IconType;
  /** Translation key or a brand name (brand names are not translated) */
  label: string;
  href: string;
};

/** Phone + messengers: the floating button and the mobile contact sheet */
export const CONTACTS: Contact[] = [
  { id: "phone", icon: Phone, label: "call", href: PHONE_HREF },
  { id: "telegram", icon: Telegram, label: "Telegram", href: TELEGRAM_URL },
  { id: "whatsapp", icon: Whatsapp, label: "WhatsApp", href: WHATSAPP_URL },
  { id: "viber", icon: Viber, label: "Viber", href: VIBER_URL },
];

/** Social icons row: the header menu and the footer */
export const SOCIALS: { label: string; href: string; Icon: IconType }[] = [
  { label: "Instagram", href: INSTAGRAM_URL, Icon: Instagram },
  { label: "Telegram", href: TELEGRAM_URL, Icon: Telegram },
  { label: "Viber", href: VIBER_URL, Icon: Viber },
  { label: "WhatsApp", href: WHATSAPP_URL, Icon: Whatsapp },
];
