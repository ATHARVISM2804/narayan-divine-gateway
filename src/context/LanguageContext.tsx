import { createContext, useContext, useState, ReactNode } from "react";
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

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("nk_lang") as Lang) || "en"
  );

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("nk_lang", l);
    i18n.changeLanguage(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
