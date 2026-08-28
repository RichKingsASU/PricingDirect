# Phase A: Scope Correction Report

## Objective
Correct all previous documentation to exclusively describe **PricingDirect** and remove any assumptions linking it to the distinct `RiskSafety` application.

## Files Reviewed & Corrected
1. `docs/migration/04-frontend-data-matrix.md`
2. `docs/migration/05-existing-backend-gap-analysis.md`
3. `docs/migration/06-proposed-data-model.md`
4. `docs/migration/07-external-source-registry.md`
5. `docs/migration/08-security-production-readiness.md`
6. `docs/migration/09-production-migration-roadmap.md`
7. `docs/LOCAL_DEVELOPMENT.md`

## Incorrect References Found & Classifications
- **RiskSafety / Risk & Safety**: `INCORRECT_PROJECT_REFERENCE`. The application is PricingDirect.
- **Carrier risk / Risk assessments**: `INCORRECT_PROJECT_REFERENCE`. Not a Pricing requirement.
- **Claims**: `INCORRECT_PROJECT_REFERENCE`.
- **Insurance compliance / RMIS**: `REQUIRES_CONFIRMATION` / `INCORRECT_PROJECT_REFERENCE`. Pricing workflows generally do not handle insurance certificates directly, though carrier performance might tie into it. Assumed incorrect for pure pricing.
- **FMCSA enforcement logic**: `INCORRECT_PROJECT_REFERENCE`. Not a core pricing requirement unless strictly used for carrier viability.
- **RiskSafety repository paths**: `INCORRECT_PROJECT_REFERENCE`.

## Corrections Made
- Removed `RiskSafety` references from `LOCAL_DEVELOPMENT.md` and roadmap.
- Completely rewrote `05-existing-backend-gap-analysis.md` to reference the newly found `Pricing_Logistics` repository.
- Re-architected `06-proposed-data-model.md` to map directly to `rates.CustomerRateLane`, `pricing.LaneException`, and `pricing.PricingAdjustment` from the existing backend. Removed FMCSA, Claims, and Risk tables.
- Removed RMIS, Claims, and FMCSA from `07-external-source-registry.md`, leaving only EIA and Google Maps.

## Confirmation
RiskSafety is confirmed to be strictly outside the scope of this migration. The target application is **PricingDirect**, utilizing the `Pricing_Logistics` backend repository.
