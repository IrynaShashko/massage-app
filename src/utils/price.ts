/**
 * Turns price.json's free text into tidy pairs of duration and price:
 *   "1200грн. 1600грн." + "90хв. 120хв." -> 90 хв · 1200 ₴ / 120 хв · 1600 ₴
 *   "700грн. +400грн."  + "60хв. +20хв."  -> 60 хв · 700 ₴ / +20 хв · +400 ₴
 *   "від 250грн."       + ""              -> від 250 ₴
 * Text it cannot read is shown as it is, so a new format never disappears.
 */
export interface PriceVariant {
  /** "60 хв", "+20 хв"; empty when the service has no duration */
  duration: string;
  /** "800 ₴", "від 250 ₴", "+400 ₴" */
  price: string;
}

const PRICE_PART = /(\+)?\s*(від|from)?\s*₴?\s*(\d+)/gi;
const TIME_PART = /(\+)?\s*(\d+)/g;

export const priceVariants = (
  price: string,
  time: string | undefined,
  language: string,
): PriceVariant[] => {
  const en = language === "en";
  const prices = Array.from(price.matchAll(PRICE_PART), (m) => {
    const amount = en ? `₴${m[3]}` : `${m[3]} ₴`;
    const from = m[2] ? `${en ? "from" : "від"} ` : "";
    return `${m[1] ? "+" : ""}${from}${amount}`;
  });
  const times = Array.from(
    (time ?? "").matchAll(TIME_PART),
    (m) => `${m[1] ? "+" : ""}${m[2]} ${en ? "min" : "хв"}`,
  );

  if (prices.length === 0) {
    return [{ duration: time?.trim() ?? "", price: price.trim() }];
  }
  if (times.length === prices.length) {
    return prices.map((p, i) => ({ duration: times[i], price: p }));
  }
  // durations that do not pair up: keep them together on the first line
  return prices.map((p, i) => ({
    duration: i === 0 ? times.join(" / ") : "",
    price: p,
  }));
};
