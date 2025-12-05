# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tarifa is a React + TypeScript web application for optimizing electricity consumption in Spain. It fetches real-time electricity prices from Spain's official grid operator (REE - Red Eléctrica de España) and helps users schedule appliances during cheaper hours.

## Commands

```bash
pnpm dev          # Start dev server (Vite on port 5173)
pnpm build        # Production build with TypeScript check
pnpm build:prod   # Production build with BUILD_MODE=prod (disables source-identifier plugin)
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
pnpm clean        # Remove node_modules, cache, and lock files
```

Note: All scripts auto-run `pnpm install --prefer-offline` first.

## Architecture

### State Management
- React Context + useReducer pattern in `src/hooks/useAppState.tsx`
- Four custom hooks: `useApp()`, `usePrices()`, `useAppliances()`, `usePreferences()`
- localStorage persistence for appliances and user preferences
- Auto-refresh prices every 5 minutes

### Service Layer
- **REEApiService** (`src/services/reeApi.ts`): Fetches hourly prices from REE public API, caches with 12h TTL, converts €/MWh to €/kWh, falls back to expired cache on errors
- **OptimizationService** (`src/services/optimizationService.ts`): Schedules appliances to cheapest consecutive hour blocks, respects time restrictions (forbidden/preferred hours), sorts by priority

### Component Structure
```
src/components/
├── dashboard/    # Price display & analytics (PriceChart, CurrentPriceCard, TopHoursCard)
├── planner/      # Appliance scheduling (ApplianceList, OptimizationTimeline, SavingsSummary)
├── settings/     # User preferences
├── layout/       # Layout, Header, TabNavigation
└── ui/           # Base components (ErrorMessage, LoadingSpinner)
```

### Type Definitions
All types are in `src/types/api.ts`: PricePoint, HourlyPriceData, Appliance, OptimizedSchedule, UserPreferences, AppState, plus helper functions (formatPrice, getPriceCategory, etc.)

## Key Technical Details

- **Path alias**: `@/*` maps to `./src/*`
- **TypeScript config**: Lenient checking (strict: false, noImplicitAny: false) in tsconfig.app.json
- **UI components**: Radix UI primitives + Tailwind CSS with custom design tokens in tailwind.config.js
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for interactive price visualization
- **REE API**: `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real` (no auth required)

## Data Flow

1. App loads → fetches today & tomorrow prices from REE API
2. Prices cached with 12h TTL, auto-refresh every 5 minutes
3. User adds appliances with duration, priority, and time restrictions
4. OptimizationService finds cheapest consecutive hour blocks respecting constraints
5. Results displayed in timeline with cost savings calculation

## Deployment

### Docker (Production)
```bash
docker build -t tarifa .
docker run -p 80:80 tarifa
```

The Dockerfile uses multi-stage build:
1. **Builder stage**: Node 20 Alpine + pnpm, builds with `pnpm build:prod`
2. **Production stage**: nginx:alpine serves static files from `/dist`

### Coolify Deployment
- **Project**: Tarifa (UUID: `f4s48www4g4wok080o8ogcs8`)
- **Application**: tarifa-app (UUID: `r0wckso8s0sswswwkw08g84s`)
- **Domain**: `https://tarifa.axcsol.com`
- **Build pack**: Dockerfile
- **Port**: 80
- **GitHub repo**: `https://github.com/xuli70/tarifa`

To deploy: Push to `main` branch, then trigger deploy in Coolify or enable auto-deploy.

### Key Deployment Files
- `Dockerfile` - Multi-stage production build
- `nginx.conf` - SPA routing, gzip, security headers, static asset caching
- `.dockerignore` - Excludes node_modules, .git, etc.
