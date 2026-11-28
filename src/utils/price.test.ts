import { priceVariants } from "./price";

describe("priceVariants", () => {
  it("formats a single price and duration", () => {
    expect(priceVariants("800грн.", "60хв.", "ua")).toEqual([
      { duration: "60 хв", price: "800 ₴" },
    ]);
    expect(priceVariants("₴800", "60 min.", "en")).toEqual([
      { duration: "60 min", price: "₴800" },
    ]);
  });

  it("pairs several prices with their durations", () => {
    expect(priceVariants("1200грн. 1600грн.", "90хв. 120хв.", "ua")).toEqual([
      { duration: "90 хв", price: "1200 ₴" },
      { duration: "120 хв", price: "1600 ₴" },
    ]);
  });

  it("keeps add-ons and 'from' prices", () => {
    expect(priceVariants("700грн. +400грн.", "60хв. +20хв.", "ua")).toEqual([
      { duration: "60 хв", price: "700 ₴" },
      { duration: "+20 хв", price: "+400 ₴" },
    ]);
    expect(priceVariants("₴700 + ₴400", "60 min. + 20 min.", "en")).toEqual([
      { duration: "60 min", price: "₴700" },
      { duration: "+20 min", price: "+₴400" },
    ]);
    expect(priceVariants("від 250грн.", "", "ua")).toEqual([
      { duration: "", price: "від 250 ₴" },
    ]);
    expect(priceVariants("from ₴50", undefined, "en")).toEqual([
      { duration: "", price: "from ₴50" },
    ]);
  });

  it("shows text it cannot read as it is", () => {
    expect(priceVariants("за домовленістю", "", "ua")).toEqual([
      { duration: "", price: "за домовленістю" },
    ]);
  });
});
