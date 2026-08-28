# Phase 6: Existing Backend Gap Analysis

## Availability of Prior Pricing_Logistics Django Implementation
- **Status:** **FOUND AND ACCESSIBLE**
- **Location Discovered:** `C:\Forrest\Projects\Pricing_Logistics`
- **Git Status:** Clean branch `main`, tracking `origin/main`.

## Frontend-to-Backend Gap Summary

| UI Feature | Current Prototype Source | Required Data | Existing Backend Support | Existing Model/API | Gap | Recommended Action | Migration Risk |
|---|---|---|---|---|---|---|---|
| Customer Rate Lane | DemoRateRepository | CustomerRateLanes | Yes | `rates.CustomerRateLane` | `ALREADY_SUPPORTED` | Wire up frontend GET/POST to existing DRF views. | Low |
| Rate Fuel Calculation | DemoRateRepository | Base, FSC, Total | Yes | `rates.CustomerRateLane.save()` method | `ALREADY_SUPPORTED` | Migrate logic to backend API purely, remove frontend calc. | Low |
| Market Summary | DemoRateRepository | Markets | Yes | `pricing.MarketSummary` | `ALREADY_SUPPORTED` | Wire up frontend to DRF views. | Low |
| Lane Exception | DemoRateRepository | LaneExceptions | Yes | `pricing.LaneException` | `ALREADY_SUPPORTED` | Wire up frontend to DRF views. | Low |
| Planned Adjustment | DemoRateRepository | PlannedAdjustments | Yes | `pricing.PricingAdjustment` | `ALREADY_SUPPORTED` | Wire up frontend to DRF views. Rename UI component properties to match model. | Low |
| KPI Stats | initialData.ts | Aggregated Loads/Targets | Partial | `pricing` models exist | `API_CHANGE_REQUIRED` | Create an aggregation DRF endpoint for the KPI dashboard. | Medium |
| Dataset / Validation | DemoRateRepository | Staging Data | Unconfirmed | TBD | `NEW_MODEL_REQUIRED` | Create ingestion tables/views in Django. | Medium |

## Existing Models That Can Be Reused
- `rates.CustomerRateLane`
- `pricing.MarketSummary`
- `pricing.LaneException`
- `pricing.PricingAdjustment`

*Note: Do not create duplicate models. The existing `Pricing_Logistics` models cover the core requirements of the PricingDirect frontend prototype perfectly.*
