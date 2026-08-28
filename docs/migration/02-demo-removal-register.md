# Phase 3: Demo & Prototype Dependency Register

| ID | File | Line/Component | Demo or Prototype Reference | Type | User-Facing Impact | Intended Real Source | Removal Dependency | Risk | Recommended Action | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DR-01 | `src/data/initialData.ts` | All | `initialKPIStats`, `initialMarkets`, `initialLaneExceptions`, `initialCustomerLanes`, `initialPlannedAdjustments` | Seed/Test Fixture | High (UI displays fake data) | PostgreSQL backend APIs | Phase 6, 7 | Low | Keep as test fixture; remove from production runtime | Identified |
| DR-02 | `src/data/chassisFuelData.ts` | All | `initialChassisSchedules`, `initialFuelScaleBrackets` | Seed/Test Fixture | High (UI displays fake data) | PostgreSQL backend APIs | Phase 6, 7 | Low | Keep as test fixture; remove from production runtime | Identified |
| DR-03 | `src/data/recommendedCarriersData.ts` | All | `initialRecommendedCarriers` | Seed/Test Fixture | High (UI displays fake data) | PostgreSQL backend APIs | Phase 6, 7 | Low | Keep as test fixture; remove from production runtime | Identified |
| DR-04 | `src/services/repositories/DemoRateRepository.ts` | All | Entire class mocking `IRateRepository` | Mock API / In-Memory State | Critical (Simulates successful API ops) | DRF API Endpoints via a real `ApiRateRepository` | Phase 7 | Medium (Frontend requires rewrite to async RTK/react-query) | Create real implementation; inject based on env | Identified |
| DR-05 | `src/App.tsx` | Line 45, 49 | `teamContext` state and default `DemoRateRepository` | Prototype Authentication | Medium (Allows toggling roles freely) | Real SSO/RBAC backend | Phase 5 | High (Security) | Remove manual toggle; fetch role from JWT/Session | Identified |
| DR-06 | `src/App.tsx` | Line 269 | `handleUploadFileSimulated` | Placeholder Workflow | High (Simulates file upload success) | Real file upload endpoint | Phase 7 | Medium | Replace with real `multipart/form-data` upload | Identified |
| DR-07 | `package.json` | Line 14 | `@google/genai` dependency | AI Studio Dependency | None (Unused in frontend) | None | None | Low | Uninstall | Identified |
| DR-08 | `src/App.tsx` | Line 106 | `handleExportCSV` | Browser-only persistence | Low | Backend CSV generator endpoint | Phase 7 | Low | Replace with API download if dataset is large | Identified |
| DR-09 | `src/App.tsx` | Line 283 | `handleAddCustomer` mock logic | Generated Metric / Simulated Success | High (Hardcodes specific addresses/lanes) | Backend normalization | Phase 7 | Medium | Refactor to POST API | Identified |
