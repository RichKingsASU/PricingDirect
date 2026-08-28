# Pricing Rule Inventory

| Rule | Legacy File | Inputs | Exact Behavior | Django Service | Tests | Status |
|---|---|---|---|---|---|---|
| Variance Calculation | `TargetControlTower.tsx` | avgActual, target | `Math.round(avgActual - target)` | TBD | TBD | NOT STARTED |
| Variance Percentage | `TargetControlTower.tsx` | avgActual, target | `Math.round(((avgActual - target) / target) * 1000) / 10` | TBD | TBD | NOT STARTED |
| Total Billing | `RateDirectory.tsx` | target, fuelSurchargePercent | `Math.round((target * (1 + fuelSurchargePercent / 100)) * 100) / 100` | TBD | TBD | NOT STARTED |
| System Matches Target | `targetMasterData.ts` | originCity, destinationCity | Exact match from `SYSTEM_TARGET_RATES` array based on city names | `calculate_target_pay` | TBD | IN PROGRESS |
| Mileage Target Fallback | `RateDirectory.tsx` | miles | `Math.max(350, Math.round(320 + miles * 3.8))` | `calculate_target_pay` | TBD | IN PROGRESS |
| Default Target Fallback | `RateDirectory.tsx` | N/A | `750` | `calculate_target_pay` | TBD | IN PROGRESS |
| Region Inference | `initialData.ts` | State/City | Map specific states/cities to NW, SW, NE, SE | TBD | TBD | NOT STARTED |
