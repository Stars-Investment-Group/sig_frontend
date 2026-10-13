import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

    /* Onglets de la fiche pays */
    "country.tab.summary": "Synthèse",
    "country.tab.notation": "Notation & Risque",
    "country.tab.quantitative": "Analyse Quantitative",
    "country.tab.qualitative": "Analyse Qualitative",
    "country.tab.forecasts": "Prévisions & Scénarios",
    "country.tab.trends": "Tendances & Signaux",

    /* Titres et sous-titres de pages */
    "page.regions.title": "Régions",
    "page.regions.subtitle": "Régimes macroéconomiques et signaux clés par région.",
    "page.indicators.title": "Indicateurs Macro",
    "page.indicators.subtitle": "Valeurs courantes et trajectoires (12 mois) des indicateurs clés par économie.",
    "page.markets.title": "Marchés",
    "page.markets.subtitle": "Conditions financières, taux, devises et appétit pour le risque.",
    "page.policy.title": "Tracker de Politique",
    "page.policy.subtitle": "Décisions de politique monétaire et orientation des principales banques centrales.",
    "page.calendar.title": "Calendrier Économique",
    "page.calendar.subtitle": "Publications statistiques et décisions de politique monétaire à venir.",
    "page.alerts.title": "Alertes",
    "page.alerts.subtitle": "Signaux, changements de régime et événements de marché sous surveillance.",
    "page.watchlist.title": "Liste de suivi",
    "page.watchlist.subtitle": "Tableau de bord personnalisé des pays et signaux sous surveillance.",
    "page.reports.title": "Rapports",
    "page.reports.subtitle": "Bibliothèque de recherche SIG : analyses macro, marchés et politiques.",
    "page.data.title": "Explorateur de Données",
    "page.data.subtitle": "Analyse quantitative, comparaison de séries temporelles et audit des révisions.",
    "page.screener.title": "Screener",
    "page.screener.subtitle": "Filtre multi-critères des pays par régime, risque et plages d'indicateurs.",
    "page.settings.title": "Paramètres",
    "page.settings.subtitle": "Personnalisez votre espace de travail, vos préférences et vos sources de données.",
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

    /* Onglets de la fiche pays */
    "country.tab.summary": "Summary",
    "country.tab.notation": "Notation & Risk",
    "country.tab.quantitative": "Quantitative Analysis",
    "country.tab.qualitative": "Qualitative Analysis",
    "country.tab.forecasts": "Forecasts & Scenarios",
    "country.tab.trends": "Trends & Signals",

    /* Titres et sous-titres de pages */
    "page.regions.title": "Regions",
    "page.regions.subtitle": "Macro regimes and key signals across regions.",
    "page.indicators.title": "Macro Indicators",
    "page.indicators.subtitle": "Current values and 12-month paths of key indicators by economy.",
    "page.markets.title": "Markets",
    "page.markets.subtitle": "Financial conditions, rates, currencies and risk appetite.",
    "page.policy.title": "Policy Tracker",
    "page.policy.subtitle": "Monetary policy decisions and stance of major central banks.",
    "page.calendar.title": "Economic Calendar",
    "page.calendar.subtitle": "Upcoming statistical releases and monetary policy decisions.",
    "page.alerts.title": "Alerts",
    "page.alerts.subtitle": "Signals, regime changes and market events under watch.",
    "page.watchlist.title": "Watchlist",
    "page.watchlist.subtitle": "Personal dashboard of watched countries and signals.",
    "page.reports.title": "Reports",
    "page.reports.subtitle": "SIG research library: macro, markets and policy analysis.",
    "page.data.title": "Data Explorer",
    "page.data.subtitle": "Quantitative analysis, time-series comparison and revision audit.",
    "page.screener.title": "Screener",
    "page.screener.subtitle": "Multi-criteria country filter by regime, risk and indicator ranges.",
    "page.settings.title": "Settings",
    "page.settings.subtitle": "Customise your workspace, preferences and data sources.",
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

    /* Onglets de la fiche pays */
    "country.tab.summary": "Resumen",
    "country.tab.notation": "Calificación y Riesgo",
    "country.tab.quantitative": "Análisis Cuantitativo",
    "country.tab.qualitative": "Análisis Cualitativo",
    "country.tab.forecasts": "Previsiones y Escenarios",
    "country.tab.trends": "Tendencias y Señales",

    /* Titres et sous-titres de pages */
    "page.regions.title": "Regiones",
    "page.regions.subtitle": "Regímenes macroeconómicos y señales clave por región.",
    "page.indicators.title": "Indicadores Macro",
    "page.indicators.subtitle": "Valores actuales y trayectorias (12 meses) de los indicadores clave por economía.",
    "page.markets.title": "Mercados",
    "page.markets.subtitle": "Condiciones financieras, tipos, divisas y apetito por el riesgo.",
    "page.policy.title": "Tracker de Política",
    "page.policy.subtitle": "Decisiones de política monetaria y orientación de los principales bancos centrales.",
    "page.calendar.title": "Calendario Económico",
    "page.calendar.subtitle": "Publicaciones estadísticas y decisiones de política monetaria próximas.",
    "page.alerts.title": "Alertas",
    "page.alerts.subtitle": "Señales, cambios de régimen y eventos de mercado bajo vigilancia.",
    "page.watchlist.title": "Lista de Seguimiento",
    "page.watchlist.subtitle": "Panel personalizado de países y señales bajo seguimiento.",
    "page.reports.title": "Informes",
    "page.reports.subtitle": "Biblioteca de investigación SIG: análisis macro, mercados y políticas.",
    "page.data.title": "Explorador de Datos",
    "page.data.subtitle": "Análisis cuantitativo, comparación de series temporales y auditoría de revisiones.",
    "page.screener.title": "Filtro de Países",
    "page.screener.subtitle": "Filtro multicriterio de países por régimen, riesgo y rangos de indicadores.",
    "page.settings.title": "Ajustes",
    "page.settings.subtitle": "Personalice su espacio de trabajo, preferencias y fuentes de datos.",
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

    /* Onglets de la fiche pays */
    "country.tab.summary": "Resumo",
    "country.tab.notation": "Notação e Risco",
    "country.tab.quantitative": "Análise Quantitativa",
    "country.tab.qualitative": "Análise Qualitativa",
    "country.tab.forecasts": "Previsões e Cenários",
    "country.tab.trends": "Tendências e Sinais",

    /* Titres et sous-titres de pages */
    "page.regions.title": "Regiões",
    "page.regions.subtitle": "Regimes macroeconómicos e sinais-chave por região.",
    "page.indicators.title": "Indicadores Macro",
    "page.indicators.subtitle": "Valores atuais e trajetórias (12 meses) dos indicadores-chave por economia.",
    "page.markets.title": "Mercados",
    "page.markets.subtitle": "Condições financeiras, taxas, divisas e apetite pelo risco.",
    "page.policy.title": "Tracker de Política",
    "page.policy.subtitle": "Decisões de política monetária e orientação dos principais bancos centrais.",
    "page.calendar.title": "Calendário Económico",
    "page.calendar.subtitle": "Publicações estatísticas e decisões de política monetária futuras.",
    "page.alerts.title": "Alertas",
    "page.alerts.subtitle": "Sinais, mudanças de regime e eventos de mercado sob vigilância.",
    "page.watchlist.title": "Lista de Acompanhamento",
    "page.watchlist.subtitle": "Painel personalizado de países e sinais em acompanhamento.",
    "page.reports.title": "Relatórios",
    "page.reports.subtitle": "Biblioteca de investigação SIG: análises macro, mercados e políticas.",
    "page.data.title": "Explorador de Dados",
    "page.data.subtitle": "Análise quantitativa, comparação de séries temporais e auditoria de revisões.",
    "page.screener.title": "Filtro de Países",
    "page.screener.subtitle": "Filtro multicritério de países por regime, risco e intervalos de indicadores.",
    "page.settings.title": "Definições",
    "page.settings.subtitle": "Personalize o seu espaço de trabalho, preferências e fontes de dados.",
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

    /* Onglets de la fiche pays */
    "country.tab.summary": "ملخص",
    "country.tab.notation": "التصنيف والمخاطر",
    "country.tab.quantitative": "التحليل الكمي",
    "country.tab.qualitative": "التحليل النوعي",
    "country.tab.forecasts": "التوقعات والسيناريوهات",
    "country.tab.trends": "الاتجاهات والمؤشرات",

    /* Titres et sous-titres de pages */
    "page.regions.title": "المناطق",
    "page.regions.subtitle": "الأنظمة الاقتصادية الكلية والإشارات الرئيسية حسب المنطقة.",
    "page.indicators.title": "المؤشرات الكلية",
    "page.indicators.subtitle": "القيم الحالية ومسارات 12 شهرًا للمؤشرات الرئيسية لكل اقتصاد.",
    "page.markets.title": "الأسواق",
    "page.markets.subtitle": "الأوضاع المالية وأسعار الفائدة والعملات وشهية المخاطرة.",
    "page.policy.title": "متابعة السياسات",
    "page.policy.subtitle": "قرارات السياسة النقدية وتوجهات البنوك المركزية الكبرى.",
    "page.calendar.title": "التقويم الاقتصادي",
    "page.calendar.subtitle": "الإصدارات الإحصائية وقرارات السياسة النقدية القادمة.",
    "page.alerts.title": "التنبيهات",
    "page.alerts.subtitle": "الإشارات وتغيرات الأنظمة وأحداث السوق قيد المراقبة.",
    "page.watchlist.title": "قائمة المتابعة",
    "page.watchlist.subtitle": "لوحة مخصصة للدول والإشارات قيد المتابعة.",
    "page.reports.title": "التقارير",
    "page.reports.subtitle": "مكتبة أبحاث SIG: تحليلات الاقتصاد الكلي والأسواق والسياسات.",
    "page.data.title": "مستكشف البيانات",
    "page.data.subtitle": "التحليل الكمي ومقارنة السلاسل الزمنية ومراجعة التنقيحات.",
    "page.screener.title": "أداة الفرز",
    "page.screener.subtitle": "فرز متعدد المعايير للدول حسب النظام والمخاطر ونطاقات المؤشرات.",
    "page.settings.title": "الإعدادات",
    "page.settings.subtitle": "خصّص مساحة عملك وتفضيلاتك ومصادر بياناتك.",
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

  // Applique aussi au premier rendu : sans cela la langue relue du stockage
  // revenait en LTR après un rechargement.
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
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





