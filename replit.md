# Global Macroeconomic Tracker

## Overview

The Global Macroeconomic Tracker is a professional web application designed for analysts, traders, and portfolio managers to monitor and analyze macroeconomic indicators across major economies. The application provides real-time data visualization, trend analysis, and economic intelligence features in a Bloomberg Terminal-style interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

**✅ Architecture complètement réorganisée (5 janvier 2025)**
- Structure backend modulaire implémentée avec séparation claire des responsabilités
- Controllers, services, routes, middleware et configuration séparés
- Tous les fichiers commentés pour une meilleure maintenabilité
- Route de santé `/api/health` ajoutée pour monitoring
- Interface API standardisée avec responses formatées
- Middleware personnalisés pour logging, CORS et gestion d'erreurs

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom terminal-themed color palette
- **State Management**: TanStack React Query for server state management
- **Charting**: Chart.js for economic data visualizations

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints following `/api/` pattern
- **Architecture Pattern**: MVC avec séparation controllers/services/routes
- **Data Storage**: Service de stockage en mémoire avec interface IStorage
- **Middleware**: Logging, CORS, validation, gestion d'erreurs personnalisés
- **Configuration**: Centralisée dans `/server/config/`
- **Build System**: Vite for development and production builds

### Development Setup
- **Build Tool**: Vite with React plugin and runtime error overlay
- **Development Server**: Hot module replacement with middleware integration
- **Type Checking**: Strict TypeScript configuration
- **Code Organization**: 
  - Monorepo structure with shared schemas
  - Backend modulaire: `controllers/`, `services/`, `routes/`, `middleware/`, `types/`, `config/`, `utils/`
  - Frontend organisé: `components/`, `pages/`, `services/`, `utils/`

## Key Components

### Database Schema (Drizzle ORM)
- **Countries**: Country metadata with status tracking
- **Economic Indicators**: Time-series data for inflation, unemployment, interest rates, GDP growth
- **Economic Regimes**: Country-specific economic classifications (overheating, recession, recovery)
- **Economic Alerts**: Dynamic alert system for economic intelligence

### Frontend Pages
- **Overview**: Dashboard with country cards showing key indicators and economic intelligence alerts
- **Trends**: Interactive charts for analyzing indicator trends over time with country/indicator selection
- **Analysis**: Economic regime classification and comparative analysis between countries
- **Data Explorer**: Searchable and filterable data table with export capabilities

### API Endpoints
- **Countries**: `/api/countries/*` - Gestion CRUD des pays avec statistiques
- **Indicators**: `/api/indicators/*` - Indicateurs économiques avec historique et comparaisons
- **Regimes**: `/api/regimes/*` - Régimes économiques avec analyse avancée
- **Alerts**: `/api/alerts/*` - Système d'alertes avec filtrage par type
- **Health**: `/api/health/*` - Monitoring et santé de l'application

### UI Components
- Responsive navigation with desktop/mobile adaptations
- Country cards with status badges and trend indicators
- Interactive charts with time period selection
- Economic intelligence alert system
- Data tables with sorting and filtering

## Data Flow

1. **Data Ingestion**: Economic data sourced from FRED, Eurostat, IMF, and World Bank APIs
2. **Storage Layer**: In-memory storage implementing IStorage interface for CRUD operations
3. **API Layer**: Express routes handle data retrieval and transformation
4. **Frontend State**: React Query manages API calls, caching, and data synchronization
5. **UI Rendering**: Components consume data through hooks and display formatted indicators

## External Dependencies

### Data Sources
- **FRED API**: Federal Reserve Economic Data for US indicators
- **Eurostat**: European statistical data
- **IMF**: International Monetary Fund data
- **World Bank**: Global economic indicators

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Chart.js**: Data visualization library
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Deployment Strategy

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single-file deployment with embedded static assets

### Environment Configuration
- Database URL configuration via environment variables
- FRED API key configuration for data fetching
- Development vs production environment detection

### Database Integration
- Drizzle ORM configured for PostgreSQL with migrations support
- Schema definitions in shared directory for type safety
- Connection pooling and session management ready for production

### Performance Considerations
- React Query provides intelligent caching and background updates
- Lazy loading and code splitting for optimal bundle sizes
- Responsive design optimized for desktop, tablet, and mobile devices
- Terminal-themed dark UI optimized for professional trading environments