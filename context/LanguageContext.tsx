"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "id" | "en";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (id: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");

  const toggleLang = () => setLang((prev) => (prev === "id" ? "en" : "id"));

  const t = (id: string, en: string) => (lang === "id" ? id : en);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLang must be used within LanguageProvider");
  return context;
}
