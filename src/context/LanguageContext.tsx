import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export type Lang = "en" | "hi";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
}

const LanguageContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

/* Resolve the starting language: a shared link's ?lang= wins over the saved
   preference, which wins over the English default. */
const readInitialLang = (): Lang => {
  try {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param === "en" || param === "hi") return param;
  } catch { /* ignore */ }
  return localStorage.getItem("nk_lang") === "hi" ? "hi" : "en";
};

/* Reflect the active language in the current URL so it travels with any shared link. */
const writeLangToUrl = (l: Lang) => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== l) {
      url.searchParams.set("lang", l);
      window.history.replaceState(window.history.state, "", url);
    }
  } catch { /* ignore */ }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  /* On first load, make everything agree with the resolved language — this
     matters when a shared ?lang= link differs from the visitor's saved value. */
  useEffect(() => {
    localStorage.setItem("nk_lang", lang);
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    writeLangToUrl(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("nk_lang", l);
    i18n.changeLanguage(l);
    writeLangToUrl(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
