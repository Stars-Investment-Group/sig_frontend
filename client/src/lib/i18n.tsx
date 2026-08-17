import { createContext, useContext, useState, ReactNode } from "react";

/**
 * SystÃ¨me d'internationalisation lÃ©ger (FR/EN/ES/PT/AR).
 * Fournit un contexte React `useI18n()` pour lire la langue active et `t(key)`.
 */

export type Language = "fr" | "en" | "es" | "pt" | "ar";

interface LanguageDef {
  code: string;       // code affichÃ© ex: "FR"
  label: string;      // nom natif de la langue
  flagCode: string;   // code drapeau pour <Flag />
  dir: "ltr" | "rtl";
}

export const LANGUAGES: LanguageDef[] = [
  { code: "EN", label: "English", flagCode: "GB", dir: "ltr" },
  { code: "FR", label: "FranÃ§ais", flagCode: "FR", dir: "ltr" },
  { code: "ES", label: "EspaÃ±ol", flagCode: "ES", dir: "ltr" },
  { code: "PT", label: "PortuguÃªs", flagCode: "PT", dir: "ltr" },
  { code: "AR", label: "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©", flagCode: "SA", dir: "rtl" },
];

/** Dictionnaire de traductions â€” approfondir au fil des besoins. */
const translations: Record<Language, Record<string, string>> = {
  fr: {
    "nav.globalOverview": "Global Overview",
    "nav.subtitle": "Macro regimes, key signals, and policy insights across regions.",
    "downloadPdf": "Download PDF",
    "header.search": "Search countries, indicators, events...",
    "header.watchlist": "Watchlist",
    "kpi.growth": "Global Growth",
    "kpi.inflation": "Global Inflation",
    "kpi.rate": "Global Policy Rate",
    "kpi.risk": "Global Risk Index",
    "house.title": "SIG House View",
    "house.summary":
      "Global momentum stays resilient thanks to easing inflation and softer expected financial conditions. Refinancing risks are concentrated on EM, with selective opportunities in the WAEMU.",
    "house.link": "View full house view â†’",
    "regimeMap.title": "Global Regime Map",
    "region.title": "Region Snapshot",
    "region.column": "Region",
    "region.regime": "Regime",
    "region.status": "Status",
    "region.risk": "Risk",
    "region.delta": "Î”",
    "topMovers.title": "Top Movers / Watchlist",
    "topMovers.manage": "Manage watchlist",
    "screener.open": "Open Screener",
    "whatChanged.title": "What Changed vs Previous Update",
    "screener.title": "Country Screener",
  },
  en: {
    "nav.globalOverview": "Global Overview",
    "nav.subtitle": "Macro regimes, key signals, and policy insights across regions.",
    "downloadPdf": "Download PDF",
    "header.search": "Search countries, indicators, events...",
    "header.watchlist": "Watchlist",
    "kpi.growth": "Global Growth",
    "kpi.inflation": "Global Inflation",
    "kpi.rate": "Global Policy Rate",
    "kpi.risk": "Global Risk Index",
    "house.title": "SIG House View",
    "house.summary":
      "Global momentum stays resilient thanks to easing inflation and softer expected financial conditions. Refinancing risks are concentrated on EM, with selective opportunities in the WAEMU.",
    "house.link": "View full house view â†’",
    "regimeMap.title": "Global Regime Map",
    "region.title": "Region Snapshot",
    "region.column": "Region",
    "region.regime": "Regime",
    "region.status": "Status",
    "region.risk": "Risk",
    "region.delta": "Î”",
    "topMovers.title": "Top Movers / Watchlist",
    "topMovers.manage": "Manage watchlist",
    "screener.open": "Open Screener",
    "whatChanged.title": "What Changed vs Previous Update",
    "screener.title": "Country Screener",
  },
  es: {
    "nav.globalOverview": "VisiÃ³n Global",
    "nav.subtitle": "RegÃ­menes macro, seÃ±ales clave y perspectivas de polÃ­tica por regiÃ³n.",
    "downloadPdf": "Descargar PDF",
    "header.search": "Buscar paÃ­ses, indicadores, eventos...",
    "header.watchlist": "Seguimiento",
    "kpi.growth": "Crecimiento Global",
    "kpi.inflation": "InflaciÃ³n Global",
    "kpi.rate": "Tasa de PolÃ­tica Global",
    "kpi.risk": "Ãndice de Riesgo Global",
    "house.title": "VisiÃ³n del SIG",
    "house.summary":
      "El impulso global se mantiene resiliente gracias a una inflaciÃ³n en desaceleraciÃ³n y condiciones financieras mÃ¡s laxas esperadas. Los riesgos de refinanciamiento se concentran en EM.",
    "house.link": "Ver visiÃ³n completa â†’",
    "regimeMap.title": "Mapa de RegÃ­menes",
    "region.title": "Resumen por RegiÃ³n",
    "region.column": "RegiÃ³n",
    "region.regime": "RÃ©gimen",
    "region.status": "Estado",
    "region.risk": "Riesgo",
    "region.delta": "Î”",
    "topMovers.title": "Principales Movimientos",
    "topMovers.manage": "Gestionar seguimiento",
    "screener.open": "Abrir Filtro",
    "whatChanged.title": "Cambios vs ActualizaciÃ³n Anterior",
    "screener.title": "Filtro de PaÃ­ses",
  },
  pt: {
    "nav.globalOverview": "VisÃ£o Geral",
    "nav.subtitle": "Regimes macro, sinais-chave e perspetivas de polÃ­tica por regiÃ£o.",
    "downloadPdf": "Baixar PDF",
    "header.search": "Pesquisar paÃ­ses, indicadores, eventos...",
    "header.watchlist": "Seguimento",
    "kpi.growth": "Crescimento Global",
    "kpi.inflation": "InflaÃ§Ã£o Global",
    "kpi.rate": "Taxa de PolÃ­tica Global",
    "kpi.risk": "Ãndice de Risco Global",
    "house.title": "Perspetiva SIG",
    "house.summary":
      "O Ã­mpeto global mantÃ©m-se resiliente graÃ§as Ã  inflaÃ§Ã£o em desaceleraÃ§Ã£o e a condiÃ§Ãµes financeiras esperadas mais suaves. Os riscos de refinanciamento concentram-se nos EM.",
    "house.link": "Ver perspetiva completa â†’",
    "regimeMap.title": "Mapa de Regimes",
    "region.title": "Resumo por RegiÃ£o",
    "region.column": "RegiÃ£o",
    "region.regime": "Regime",
    "region.status": "Estado",
    "region.risk": "Risco",
    "region.delta": "Î”",
    "topMovers.title": "Principais Movimentos",
    "topMovers.manage": "Gerir seguimento",
    "screener.open": "Abrir Filtro",
    "whatChanged.title": "AlteraÃ§Ãµes vs AtualizaÃ§Ã£o Anterior",
    "screener.title": "Filtro de PaÃ­ses",
  },
  ar: {
    "nav.globalOverview": "Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©",
    "nav.subtitle": "Ø§Ù„Ø£Ù†Ø¸Ù…Ø© Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© Ø§Ù„ÙƒÙ„ÙŠØ© ÙˆØ§Ù„Ø¥Ø´Ø§Ø±Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ÙˆØ±Ø¤Ù‰ Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª Ø¹Ø¨Ø± Ø§Ù„Ù…Ù†Ø§Ø·Ù‚.",
    "downloadPdf": "ØªØ­Ù…ÙŠÙ„ PDF",
    "header.search": "Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø¯ÙˆÙ„ ÙˆØ§Ù„Ù…Ø¤Ø´Ø±Ø§Øª ÙˆØ§Ù„Ø£Ø­Ø¯Ø§Ø«...",
    "header.watchlist": "Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©",
    "kpi.growth": "Ø§Ù„Ù†Ù…Ùˆ Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ",
    "kpi.inflation": "Ø§Ù„ØªØ¶Ø®Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ",
    "kpi.rate": "Ø³Ø¹Ø± Ø§Ù„ÙØ§Ø¦Ø¯Ø© Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ",
    "kpi.risk": "Ù…Ø¤Ø´Ø± Ø§Ù„Ù…Ø®Ø§Ø·Ø± Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ",
    "house.title": "Ø±Ø¤ÙŠØ© SIG",
    "house.summary":
      "ÙŠØ¸Ù„ Ø§Ù„Ø²Ø®Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ Ù…Ø±Ù†Ø§Ù‹ Ø¨ÙØ¶Ù„ ØªØ¨Ø§Ø·Ø¤ Ø§Ù„ØªØ¶Ø®Ù… ÙˆØªØ­Ø³Ù† Ø§Ù„Ø¸Ø±ÙˆÙ Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø©. ØªØªØ±ÙƒØ² Ù…Ø®Ø§Ø·Ø± Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªÙ…ÙˆÙŠÙ„ ÙÙŠ Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ù†Ø§Ø´Ø¦Ø©.",
    "house.link": "Ø¹Ø±Ø¶ Ø§Ù„Ø±Ø¤ÙŠØ© Ø§Ù„ÙƒØ§Ù…Ù„Ø© â†",
    "regimeMap.title": "Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ø£Ù†Ø¸Ù…Ø©",
    "region.title": "Ù…Ù„Ø®Øµ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚",
    "region.column": "Ø§Ù„Ù…Ù†Ø·Ù‚Ø©",
    "region.regime": "Ø§Ù„Ù†Ø¸Ø§Ù…",
    "region.status": "Ø§Ù„Ø­Ø§Ù„Ø©",
    "region.risk": "Ø§Ù„Ù…Ø®Ø§Ø·Ø±",
    "region.delta": "Î”",
    "topMovers.title": "Ø£Ø¨Ø±Ø² Ø§Ù„Ø­Ø±ÙƒØ§Øª",
    "topMovers.manage": "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©",
    "screener.open": "ÙØªØ­ Ø§Ù„Ù…ØµÙØ§Ø©",
    "whatChanged.title": "Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª Ù…Ù‚Ø§Ø¨Ù„ Ø§Ù„ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³Ø§Ø¨Ù‚",
    "screener.title": "Ù…ØµÙØ§Ø© Ø§Ù„Ø¯ÙˆÙ„",
  },
};

const defaultLocale: Language = "fr";
const STORAGE_KEY = "sig-lang";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return defaultLocale;
  const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved && LANGUAGES.some((l) => l.code.toLowerCase() === saved)) return saved;
  return defaultLocale;
}

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  current: LanguageDef;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const dir = LANGUAGES.find((l) => l.code.toLowerCase() === language)?.dir || "ltr";

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const current = LANGUAGES.find((l) => l.code.toLowerCase() === language)!;

  const t = (key: string) => translations[language][key] ?? translations.fr[key] ?? key;

  return (
    <I18nContext.Provider value={{ language, setLanguage, dir, t, current }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}





