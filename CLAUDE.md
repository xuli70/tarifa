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
├── auth/         # PIN authentication (PinLanding)
├── dashboard/    # Price display & analytics (PriceChart, CurrentPriceCard, TopHoursCard)
├── planner/      # Appliance scheduling (ApplianceList, OptimizationTimeline, SavingsSummary)
├── settings/     # User preferences
├── layout/       # Layout, Header, TabNavigation
└── ui/           # Base components (ErrorMessage, LoadingSpinner)
```

### Authentication
- **PIN Landing Page** (`src/components/auth/PinLanding.tsx`): 4-digit PIN required to access the app
- **Auth Context** (`src/hooks/useAuth.tsx`): Manages authentication state with localStorage persistence
- **Runtime Config** (`public/config.js`): PIN injected at Docker runtime via `docker-entrypoint.sh`
- Default PIN: `1111` (configurable via `PIN_CODE` environment variable in Coolify)

### PriceChart Component Features
The main price visualization component (`src/components/dashboard/PriceChart.tsx`) includes:
- **Gradient bars**: 3-color gradients (dark → medium → light) for each price category
- **Proportional bar heights**: Base height 30% + 70% range for visual balance (min=30%, max=100%)
- **Time slot segmentation**: Visual division into 4 periods (Madrugada 00-06h, Mañana 06-12h, Tarde 12-18h, Noche 18-24h)
- **Interactive tooltips**: Shows hour range, exact price (€/kWh), and category on hover/touch. Positioned below bars to avoid being cut off on mobile
- **Average line**: Dashed horizontal line showing daily average price, centered in chart
- **Current hour indicator**: Pulsing blue dot with ring highlight
- **Hour labels**: Every 3 hours on mobile (0, 3, 6, 9, 12, 15, 18, 21) in bold, every 2 hours on desktop
- **Touch support**: `onTouchStart`/`onTouchEnd` for mobile tooltip interaction
- **Mobile optimized**: All 24 bars fit within container in portrait mode

**Important CSS notes**:
- Bar containers use `flex-1 min-w-0` to allow compression without minimum width constraints
- Chart container uses `overflow-hidden rounded-lg px-1` for internal padding and overflow prevention
- Bars use `gap-px sm:gap-0.5` for minimal spacing (1px mobile, 2px desktop)
- Mobile-specific styles: `rounded-t-sm`, `ring-1`, `text-[10px]`, `font-bold` for better visibility
- Hover effect uses `brightness-110` only (no `scale` to prevent overflow)
- Tooltip uses `top-full mt-2` positioning with arrow pointing up

### Type Definitions
All types are in `src/types/api.ts`: PricePoint, HourlyPriceData, Appliance, OptimizedSchedule, UserPreferences, AppState, plus helper functions (formatPrice, getPriceCategory, etc.)

## Key Technical Details

- **Path alias**: `@/*` maps to `./src/*`
- **TypeScript config**: Lenient checking (strict: false, noImplicitAny: false) in tsconfig.app.json
- **UI components**: Radix UI primitives + Tailwind CSS with custom design tokens in tailwind.config.js
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for interactive price visualization
- **REE API**: `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real` (no auth required)

## iOS Safari Compatibility

The app includes specific fixes for iOS Safari:

### API Fetch (`src/services/reeApi.ts`)
- No custom `User-Agent` header (Safari blocks it in fetch requests)
- Explicit `mode: 'cors'` and `credentials: 'omit'` for cross-origin requests
- AbortController with 30s timeout (Safari may hang on slow connections)
- Specific error handling for iOS "Load failed" and "Failed to fetch" errors

### localStorage (`src/hooks/useAppState.tsx`)
- `isLocalStorageAvailable()` check before usage
- Silent fail for Safari private browsing mode
- Handles `QuotaExceededError` gracefully

### CSS/Viewport (`src/index.css`, `index.html`)
- `viewport-fit=cover` for notch/dynamic island support
- `-webkit-` prefixes for backdrop-filter, overflow-scrolling
- `100dvh` dynamic viewport height with fallback
- Safe area insets with `env()` functions

### Build Target (`vite.config.ts`)
- Targets `safari12`, `ios12` for broader compatibility

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

**Note**: pnpm v10+ requires explicit approval for build scripts. The Dockerfile includes `pnpm config set onlyBuiltDependencies esbuild` to allow esbuild to run its post-install scripts.

### Coolify Deployment
- **Project**: Tarifa (UUID: `f4s48www4g4wok080o8ogcs8`)
- **Application**: tarifa-app (UUID: `r0wckso8s0sswswwkw08g84s`)
- **Domain**: `https://tarifa.axcsol.com`
- **Build pack**: Dockerfile
- **Port**: 80
- **GitHub repo**: `https://github.com/xuli70/tarifa`

**Environment Variables:**
- `PIN_CODE` - 4-digit PIN for app access (default: `1111`)

To deploy: Push to `main` branch, then trigger deploy in Coolify or enable auto-deploy.

### Key Deployment Files
- `Dockerfile` - Multi-stage production build with entrypoint for env vars
- `docker-entrypoint.sh` - Injects PIN_CODE into runtime config
- `nginx.conf` - SPA routing, gzip, security headers, static asset caching
- `.dockerignore` - Excludes node_modules, .git, etc.
