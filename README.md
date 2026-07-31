# Global Macroeconomic Tracker

🏦 **Screener macro-financier professionnel** conçu pour les analystes, traders et gestionnaires de portefeuilles

## 📊 Vue d'ensemble

Le Global Macroeconomic Tracker est une application web Bloomberg Terminal-style qui fournit une surveillance et une analyse en temps réel des indicateurs macroéconomiques des principales économies mondiales. L'application propose des visualisations de données, une analyse de tendances et des fonctionnalités d'intelligence économique dans une interface moderne et professionnelle.

## 🚀 Fonctionnalités principales

### 📈 Pages disponibles

- **🏠 Overview (News Feed IA)** - Résumés économiques générés par IA pour chaque pays
- **📊 Analyse Quantitative** - Métriques et tendances des indicateurs économiques
- **🔍 Analyse Qualitative** - Classification et analyse des régimes économiques
- **⭐ Notation** - Système de rating automatique des pays
- **📋 Data Explorer** - Table de données consultable et filtrable

### 🛠 Capacités techniques

- ✅ Interface Bloomberg Terminal moderne (thème sombre)
- ✅ Visualisations interactives avec Chart.js
- ✅ API RESTful complète et documentée
- ✅ Architecture modulaire et scalable
- ✅ Système d'alertes économiques
- ✅ Gestion des régimes économiques (surchauffe, récession, récupération, transition)

## 🏗 Architecture technique

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: Wouter
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **State**: TanStack React Query
- **Charts**: Chart.js

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Storage**: En mémoire (prêt pour base de données)
- **Validation**: Zod + Drizzle ORM

## 📁 Structure du projet

```
├── server/                     # Backend Express.js
│   ├── controllers/           # Logique métier des routes
│   ├── routes/               # Définition des endpoints HTTP
│   ├── services/             # Services (storage, APIs externes)
│   ├── middleware/           # Middleware Express personnalisés
│   ├── types/               # Interfaces TypeScript
│   ├── utils/               # Fonctions utilitaires
│   ├── config/              # Configuration et constantes
│   └── index.ts             # Point d'entrée du serveur
├── client/                   # Frontend React
│   ├── src/
│   │   ├── components/      # Composants UI réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services frontend
│   │   └── utils/          # Utilitaires frontend
├── shared/                  # Code partagé (schémas, types)
└── README.md               # Documentation
```

## 🚦 API Endpoints

### 🏠 Pays
- `GET /api/countries` - Liste des pays
- `GET /api/countries/:code` - Détails d'un pays
- `GET /api/countries/stats` - Statistiques des pays
- `POST /api/countries` - Créer un pays
- `PUT /api/countries/:code` - Mettre à jour un pays

### 📊 Indicateurs économiques
- `GET /api/indicators/latest` - Derniers indicateurs
- `GET /api/indicators/country/:countryCode` - Indicateurs par pays
- `GET /api/indicators/type/:indicatorType` - Indicateurs par type
- `GET /api/indicators/history/:countryCode/:indicatorType` - Historique
- `GET /api/indicators/stats` - Statistiques
- `GET /api/indicators/compare/:country1/:country2/:indicatorType` - Comparaison
- `POST /api/indicators` - Créer un indicateur

### 🔄 Régimes économiques
- `GET /api/regimes` - Tous les régimes
- `GET /api/regimes/:countryCode` - Régime par pays
- `GET /api/regimes/stats` - Statistiques des régimes
- `GET /api/regimes/analysis` - Analyse détaillée
- `POST /api/regimes` - Créer un régime
- `PUT /api/regimes/:countryCode` - Mettre à jour un régime

### 🚨 Alertes économiques
- `GET /api/alerts` - Toutes les alertes
- `GET /api/alerts/type/:alertType` - Alertes par type
- `GET /api/alerts/critical` - Alertes critiques
- `GET /api/alerts/stats` - Statistiques des alertes
- `POST /api/alerts` - Créer une alerte

### ❤️ Santé de l'API
- `GET /api/health` - Status basique
- `GET /api/health/detailed` - Métriques détaillées
- `GET /api/health/ping` - Test de latence

## 🛠 Installation et démarrage

### Prérequis
- Node.js 18+
- npm ou yarn

### Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

- **Frontend**: `http://localhost:5000`
- **API**: `http://localhost:5000/api`

## 📋 Variables d'environnement

```env
NODE_ENV=development
PORT=5000
FRED_API_KEY=your_fred_key          # Pour les données US
PERPLEXITY_API_KEY=your_perplexity_key  # Pour l'IA
```

## 🔧 Configuration

Toute la configuration est centralisée dans `server/config/index.ts`:

- **Serveur**: Port, host, environnement
- **APIs externes**: Clés API, URLs de base
- **Logs**: Configuration des logs
- **Constantes métier**: Pays supportés, types d'indicateurs

## 📊 Données supportées

### Pays couverts
- 🇺🇸 **États-Unis** (US)
- 🇬🇧 **Royaume-Uni** (UK)  
- 🇪🇺 **Zone Euro** (EU)
- 🇯🇵 **Japon** (JP)

### Indicateurs économiques
- **Inflation** (%)
- **Chômage** (%)
- **Taux d'intérêt** (%)
- **Croissance PIB** (%)

### Régimes économiques
- **Surchauffe** (Overheating)
- **Récession** (Recession)
- **Récupération** (Recovery)
- **Transition** (Transition)

## 🚀 Prochaines étapes

### Intégrations prévues
- [ ] **FRED API** - Données économiques US en temps réel
- [ ] **Eurostat** - Données européennes
- [ ] **World Bank API** - Données mondiales
- [ ] **Perplexity API** - Résumés IA améliorés

### Fonctionnalités futures
- [ ] **Base de données PostgreSQL** - Persistance des données
- [ ] **Authentification** - Comptes utilisateur
- [ ] **Notifications** - Alertes en temps réel
- [ ] **Export de données** - CSV, Excel, PDF
- [ ] **Thèmes personnalisables** - Interface adaptable

## 🤝 Contribution

Ce projet suit une architecture modulaire pour faciliter l'extension:

1. **Ajout d'un pays**: Mettre à jour `BUSINESS_CONSTANTS` dans `config/`
2. **Nouvel indicateur**: Ajouter le type dans les constantes et créer les données
3. **Nouvelle API**: Créer un service dans `services/` et l'intégrer aux contrôleurs

## 📄 License

Projet propriétaire - Global Macroeconomic Tracker

---

**🔗 Status**: ✅ Version 1.0 - Architecture complètement réorganisée et professionnalisée