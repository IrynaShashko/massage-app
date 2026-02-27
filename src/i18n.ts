import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ua from "./locales/ua.json";

i18n
  .use(initReactI18next as any)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ua: {
        translation: ua,
      },
    },
    lng: "ua",
    fallbackLng: "ua",
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((err) => {
    console.error("Error initializing i18next", err);
  });

i18n.on("languageChanged", (lng) => {
  const htmlLang = lng === "ua" ? "uk" : lng;
  document.documentElement.setAttribute("lang", htmlLang);
});

export default i18n;
