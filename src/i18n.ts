import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";

/* Resolve the starting language: a shared link's ?lang= wins, then the saved
   preference, then English. Reading the URL here means the very first paint is
   already in the shared language (no English flash). */
const getInitialLang = (): "en" | "hi" => {
  try {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param === "en" || param === "hi") return param;
  } catch { /* ignore */ }
  return localStorage.getItem("nk_lang") === "hi" ? "hi" : "en";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: getInitialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
