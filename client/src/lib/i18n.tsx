import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Systéme d'internationalisation leger (FR/EN/ES/PT/AR).
 * Fournit un contexte React `useI18n()` pour lire la langue active et `t(key)`.
 */

export type Language = "fr" | "en" | "es" | "pt" | "ar";

interface LanguageDef {
  code: string;       // code affiché ex: "FR"
  label: string;      // nom natif de la langue
  flagCode: string;   // code drapeau pour <Flag />
  dir: "ltr" | "rtl";
}

export const LANGUAGES: LanguageDef[] = [
  { code: "EN", label: "English", flagCode: "GB", dir: "ltr" },
  { code: "FR", label: "Français", flagCode: "FR", dir: "ltr" },
  { code: "ES", label: "Espagnol", flagCode: "ES", dir: "ltr" },
  { code: "PT", label: "Portugués", flagCode: "PT", dir: "ltr" },
  { code: "AR", label: "Arabe", flagCode: "SA", dir: "rtl" },
];

/** Dictionnaire de traductions — à approfondir au fil des besoins. */
const translations: Record<Language, Record<string, string>> = {
  fr: {
    "nav.globalOverview": "Vue d'ensemble globale",
    "nav.subtitle":
      "Régimes macroéconomiques, signaux clés et perspectives de politique économique à travers les régions.",
    "downloadPdf": "Télécharger le PDF",
    "header.search": "Rechercher des pays, indicateurs, événements...",
    "header.watchlist": "Liste de suivi",

    "kpi.growth": "Croissance mondiale",
    "kpi.inflation": "Inflation mondiale",
    "kpi.rate": "Taux directeur mondial",
    "kpi.risk": "Indice de risque mondial",

    "house.title": "Vue SIG",
    "house.summary":
      "La dynamique mondiale reste résiliente grâce au ralentissement de l'inflation et à l'assouplissement attendu des conditions financières. Les risques de refinancement sont concentrés sur les marchés émergents, avec des opportunités sélectives dans l'UEMOA.",
    "house.link": "Voir la vue complète →",

    "regimeMap.title": "Carte des régimes mondiaux",

    "region.title": "Vue régionale",
    "region.column": "Région",
    "region.regime": "Régime",
    "region.status": "Statut",
    "region.risk": "Risque",
    "region.delta": "Δ",

    "topMovers.title": "Principaux mouvements / Liste de suivi",
    "topMovers.manage": "Gérer la liste de suivi",

    "screener.open": "Ouvrir le screener",

    "whatChanged.title": "Évolution depuis la mise à jour précédente",

    "screener.title": "Screener des pays",

    "matrix.title": "Matrice des régimes régionaux",
    "matrix.subtitle": "Statut des signaux macro par région",
    "matrix.region": "Région",
    "matrix.growth": "Momentum de croissance",
    "matrix.inflation": "Pression inflationniste",
    "matrix.external": "Balance externe",
    "matrix.policy": "Posture politique",
    "matrix.overall": "Régime global",

    "events.title": "Événements à venir & Calendrier de politique",
    "events.subtitle": "Prochains 30 jours",
    "events.viewFull": "Voir le calendrier complet →",
    "events.date": "Date",
    "events.event": "Événement",
    "events.region": "Région / Pays",
    "events.importance": "Importance",

    "footer.alertsTitle": "Alertes / Changements de signaux notables",
    "footer.alertsSubtitle": "Derniers changements de signaux macro",

    "footer.confidenceTitle": "Confiance & Couverture des données",
    "footer.coverage": "Couverture",
    "footer.conf.highconfidence": "Confiance élevée",
    "footer.conf.mediumconfidence": "Confiance moyenne",
    "footer.conf.lowconfidence": "Confiance faible",
    "footer.conf.nodata": "Pas de données",
    "footer.confidenceNote": "La couverture indique la part des indicateurs alimentés par des données gouvernées fiables.",

    "footer.guideTitle": "Comment utiliser cette page",
    "footer.guide.screener": "Filtrer les pays",
    "footer.guide.movers": "Suivre les mouvements",
    "footer.guide.events": "Anticiper les événements",
    "footer.guide.confidence": "Évaluer la confiance",

    /* Regions */
    "regions.growth": "Croissance",
    "regions.inflation": "Inflation",
    "regions.fiscal": "Solde budgétaire",
    "regions.risk": "Risque global",
    "regions.countriesTitle": "Pays surveillés",
    "regions.col.country": "Pays",
    "regions.col.code": "Code",
    "regions.col.region": "Région",
    "regions.col.regime": "Régime",
    "regions.col.risk": "Risque",
    "regions.col.status": "Statut",
  },

  en: {
    "nav.globalOverview": "Global Overview",
    "nav.subtitle":
      "Macro regimes, key signals, and policy insights across regions.",
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
    "house.link": "View full house view →",

    "regimeMap.title": "Global Regime Map",

    "region.title": "Region Snapshot",
    "region.column": "Region",
    "region.regime": "Regime",
    "region.status": "Status",
    "region.risk": "Risk",
    "region.delta": "Δ",

    "topMovers.title": "Top Movers / Watchlist",
    "topMovers.manage": "Manage watchlist",

    "screener.open": "Open Screener",

    "whatChanged.title": "What Changed vs Previous Update",

    "screener.title": "Country Screener",

    "matrix.title": "Regional Regime Matrix",
    "matrix.subtitle": "Macro signal status by region",
    "matrix.region": "Region",
    "matrix.growth": "Growth Momentum",
    "matrix.inflation": "Inflation Pressure",
    "matrix.external": "External Balance",
    "matrix.policy": "Policy Stance",
    "matrix.overall": "Overall Regime",

    "events.title": "Upcoming Events & Policy Calendar",
    "events.subtitle": "Next 30 days",
    "events.viewFull": "View full calendar →",
    "events.date": "Date",
    "events.event": "Event",
    "events.region": "Region / Country",
    "events.importance": "Importance",

    "footer.alertsTitle": "Alerts / Notable Signal Changes",
    "footer.alertsSubtitle": "Latest macro signal changes",

    "footer.confidenceTitle": "Data Confidence & Coverage",
    "footer.coverage": "Coverage",
    "footer.conf.highconfidence": "High Confidence",
    "footer.conf.mediumconfidence": "Medium Confidence",
    "footer.conf.lowconfidence": "Low Confidence",
    "footer.conf.nodata": "No Data",
    "footer.confidenceNote": "Coverage shows the share of indicators backed by reliable governed data.",

    "footer.guideTitle": "How to Use This Page",
    "footer.guide.screener": "Filter countries",
    "footer.guide.movers": "Track movers",
    "footer.guide.events": "Anticipate events",
    "footer.guide.confidence": "Assess confidence",

    /* Regions */
    "regions.growth": "Growth",
    "regions.inflation": "Inflation",
    "regions.fiscal": "Fiscal Balance",
    "regions.risk": "Global Risk",
    "regions.countriesTitle": "Tracked Countries",
    "regions.col.country": "Country",
    "regions.col.code": "Code",
    "regions.col.region": "Region",
    "regions.col.regime": "Regime",
    "regions.col.risk": "Risk",
    "regions.col.status": "Status",
  },

  es: {
    "nav.globalOverview": "Visión global",
    "nav.subtitle":
    "Regímenes macroeconómicos, señales clave y perspectivas de política económica por región.",
    "downloadPdf": "Descargar PDF",
    "header.search": "Buscar países, indicadores, eventos...",
    "header.watchlist": "Lista de seguimiento",

    "kpi.growth": "Crecimiento mundial",
    "kpi.inflation": "Inflación mundial",
    "kpi.rate": "Tasa de política monetaria mundial",
    "kpi.risk": "Índice de riesgo mundial",

    "house.title": "Visión SIG",
    "house.summary":
      "El impulso mundial se mantiene resiliente gracias a la moderación de la inflación y a unas condiciones financieras esperadas más favorables. Los riesgos de refinanciación se concentran en los mercados emergentes, con oportunidades selectivas en la UEMOA.",
    "house.link": "Ver la visión completa →",

    "regimeMap.title": "Mapa de regímenes mundiales",

    "region.title": "Resumen regional",
    "region.column": "Región",
    "region.regime": "Régimen",
    "region.status": "Estado",
    "region.risk": "Riesgo",
    "region.delta": "Δ",

    "topMovers.title": "Principales movimientos / Lista de seguimiento",
    "topMovers.manage": "Gestionar lista de seguimiento",

    "screener.open": "Abrir screener",

    "whatChanged.title": "Cambios desde la actualización anterior",

    "screener.title": "Screener de países",
  },

  pt: {
    "nav.globalOverview": "Visão geral global",
    "nav.subtitle":
      "Regimes macroeconómicos, sinais-chave e perspetivas de política económica por região.",
    "downloadPdf": "Descarregar PDF",
    "header.search": "Pesquisar países, indicadores, eventos...",
    "header.watchlist": "Lista de acompanhamento",

    "kpi.growth": "Crescimento global",
    "kpi.inflation": "Inflação global",
    "kpi.rate": "Taxa de política monetária global",
    "kpi.risk": "Índice de risco global",

    "house.title": "Visão SIG",
    "house.summary":
      "O dinamismo global mantém-se resiliente graças à moderação da inflação e às condições financeiras esperadas mais favoráveis. Os riscos de refinanciamento estão concentrados nos mercados emergentes, com oportunidades seletivas na UEMOA.",
    "house.link": "Ver a visão completa →",

    "regimeMap.title": "Mapa dos regimes globais",

    "region.title": "Resumo regional",
    "region.column": "Região",
    "region.regime": "Regime",
    "region.status": "Estado",
    "region.risk": "Risco",
    "region.delta": "Δ",

    "topMovers.title": "Principais movimentos / Lista de acompanhamento",
    "topMovers.manage": "Gerir lista de acompanhamento",

    "screener.open": "Abrir screener",

    "whatChanged.title": "Alterações desde a atualização anterior",

    "screener.title": "Screener de países",
  },

  ar: {
    "nav.globalOverview": "نظرة عامة عالمية",
    "nav.subtitle":
      "الأنظمة الاقتصادية الكلية، والمؤشرات الرئيسية، ورؤى السياسات عبر المناطق.",
    "downloadPdf": "تحميل PDF",
    "header.search": "البحث عن الدول والمؤشرات والأحداث...",
    "header.watchlist": "قائمة المتابعة",

    "kpi.growth": "النمو العالمي",
    "kpi.inflation": "التضخم العالمي",
    "kpi.rate": "سعر الفائدة العالمي",
    "kpi.risk": "مؤشر المخاطر العالمي",

    "house.title": "رؤية SIG",
    "house.summary":
      "لا يزال الزخم العالمي مرنًا بفضل تراجع التضخم وتحسن الظروف المالية المتوقعة. تتركز مخاطر إعادة التمويل في الأسواق الناشئة، مع وجود فرص انتقائية في منطقة الاتحاد الاقتصادي والنقدي لغرب إفريقيا (UEMOA).",
    "house.link": "عرض الرؤية الكاملة ←",

    "regimeMap.title": "خريطة الأنظمة الاقتصادية العالمية",

    "region.title": "ملخص المناطق",
    "region.column": "المنطقة",
    "region.regime": "النظام",
    "region.status": "الحالة",
    "region.risk": "المخاطر",
    "region.delta": "Δ",
    "topMovers.title": "أبرز التحركات / قائمة المتابعة",
    "topMovers.manage": "إدارة قائمة المتابعة",
    "screener.open": "فتح أداة الفرز",
    "whatChanged.title": "التغييرات منذ التحديث السابق",
    "screener.title": "أداة فرز الدول",
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





