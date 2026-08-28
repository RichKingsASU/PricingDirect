# Phase 2: Architecture Inventory

## Core Stack
- **Framework:** React 19
- **Build System:** Vite 6.x
- **Routing:** Manual state-based routing (`activeTab` state in `App.tsx`); no dedicated router library (e.g., `react-router-dom`) is used.
- **State Management:** React local state (`useState`, `useEffect`) passing props down the component tree. A pseudo-service (`DemoRateRepository`) handles data manipulation in memory.

## Authentication & Security
- **Authentication Implementation:** None. A local state `teamContext` mocks roles ('Pricing Team' or 'Operations').
- **Security-sensitive Frontend Logic:** None implemented, as there is no real backend connection or auth enforcement.

## Data & API Integration
- **API Clients:** None actual. All data fetching is simulated.
- **Data-access Services:** Implemented via `IRateRepository` interface and mocked in `DemoRateRepository.ts`.
- **Mock Servers:** No mock server (e.g., express, json-server) is running. Data is statically imported from TypeScript files.
- **Browser Storage:** No `localStorage` or `sessionStorage` is utilized for persistence. State resets on browser reload.

## Codebase Composition
- **Components & Pages:** Organized in `src/components`, `src/components/modals`. Includes `TopNavBar`, `Sidebar`, `TargetControlTower`, `RateDirectory`, `DataManagement`.
- **Assets:** Minimal external assets; utilizes `lucide-react` for iconography and `us-atlas` / `d3-geo` for map drawing.
- **Tests:** No testing framework or test files (`.test.tsx` or `.spec.tsx`) are present.
- **Deployment Configuration:** Standard Vite production build; no Dockerfile or CI/CD pipelines configured.

## Prototype & Demo Artifacts
- **Static JSON / Seed Files:** `src/data/initialData.ts`, `src/data/chassisFuelData.ts`, `src/data/recommendedCarriersData.ts` contain fully static, hard-coded data mimicking real production metrics, percentages, currency, company names, and IDs.
- **External SDKs:** `@vis.gl/react-google-maps` is present. `@google/genai` is in `package.json` but is unused in the `src/` directory.
- **Prototype Dependencies:** No Supabase, Firebase, or other DB-as-a-service platforms are utilized.
- **Direct Database Access:** None.

## Features Visible But Not Implemented
- **Exporting Data:** The `handleExportCSV` function generates a CSV client-side from memory.
- **Reporting Issues:** Dispatches a mock "issue" to memory.
- **Actual Load Ingestion:** Simulates ingest logic without an actual feed.
- **Simulated API delays/success:** The repository functions use `Promise.resolve` instantly without simulated network latency, but act as asynchronous API endpoints.
