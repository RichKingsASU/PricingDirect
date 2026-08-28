# Pricing Logistics Baseline

## Environment
*   **Source Branch:** `feature/work4vince-supabase-backend`
*   **Source SHA:** `2f079e1e184c28e81584a47d32504403cabfe18e`
*   **Refactor Branch:** `refactor/pricing-logistics-django-postgres`

## System State (Before Refactor)
*   **Frontend:** React + Vite + TypeScript + Tailwind CSS
*   **Backend:** Supabase
*   **Database:** Supabase Postgres
*   **Testing:** Playwright/Vitest configured but coverage unknown

## Initial Objectives
1. Extract pricing rules from `src/App.tsx` and `src/components/RateDirectory.tsx`.
2. Map TS Interfaces to Django Models (`src/types.ts`).
3. Set up Django `config` project.
4. Set up `pricing_logistics_dev` DB connectivity.
