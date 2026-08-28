# Phase 14: Field-Level Backend Reconciliation

This matrix compares the fields expected by the `PricingDirect` React frontend against the exact models present in `Pricing_Logistics` (`rates.models.py` and `pricing.models.py`).

## 1. Customer Rate Lane (`rates.CustomerRateLane`)
| Frontend Field | Backend Field | Type Match | Classification | Notes |
|---|---|---|---|---|
| id | id | Yes | EXACT_MATCH | Auto-increment PK |
| customer | customer_name / organization | Partial | RENAMING_ONLY | Frontend uses string, backend has both string and FK |
| origin | origin_city + origin_state | Partial | FRONTEND_INTEGRATION_ONLY | Frontend string "City, ST", Backend splits it |
| destination | destination_city + destination_state | Partial | FRONTEND_INTEGRATION_ONLY | Frontend string "City, ST", Backend splits it |
| baseRate | base_rate | Yes (Decimal) | EXACT_MATCH | Check constraint enforces >= 0 |
| totalBilling | total_billing | Yes (Decimal) | DERIVED_BACKEND_FIELD | Read-only in UI, calculated by `save()` on backend |
| accessorials | equipment / service_type | Partial | TYPE_MISMATCH | Prototype mocks a JSON array, backend uses explicit string fields |
| status | status | Yes | EXACT_MATCH | Choices: AWARDED, BACKUP, SPOT |

## 2. Lane Exception (`pricing.LaneException`)
| Frontend Field | Backend Field | Type Match | Classification | Notes |
|---|---|---|---|---|
| id | id | Yes | EXACT_MATCH | |
| origin | origin | Yes | EXACT_MATCH | |
| destination | destination | Yes | EXACT_MATCH | |
| market | market | Yes | EXACT_MATCH | |
| loads | loads | Yes | EXACT_MATCH | |
| currentTarget | current_target | Yes (Decimal) | EXACT_MATCH | |
| avgActual | avg_actual | Yes (Decimal) | EXACT_MATCH | |
| varPercent | var_percent | Yes (Decimal) | EXACT_MATCH | |
| confidence | confidence | Yes | EXACT_MATCH | |
| impact | impact | Yes | EXACT_MATCH | |
| adjustmentStatus | adjustment_status | Yes | EXACT_MATCH | |

## 3. Planned Adjustment (`pricing.PricingAdjustment`)
| Frontend Field | Backend Field | Type Match | Classification | Notes |
|---|---|---|---|---|
| id | id | Yes | EXACT_MATCH | |
| title | title | Yes | EXACT_MATCH | |
| changePercent | change_percent | Yes (Decimal) | EXACT_MATCH | |
| effectiveDate | effective_date | Yes (Date) | EXACT_MATCH | |
| status | status | Yes | EXACT_MATCH | |

## 4. Market Summary (`pricing.MarketSummary`)
| Frontend Field | Backend Field | Type Match | Classification | Notes |
|---|---|---|---|---|
| id | id | Yes | EXACT_MATCH | |
| name | name | Yes | EXACT_MATCH | |
| region | region | Yes | EXACT_MATCH | |
| avgTarget | avg_target | Yes | EXACT_MATCH | |
| avgActual | avg_actual | Yes | EXACT_MATCH | |
| variancePercent | variance_percent | Yes | EXACT_MATCH | |
| trendStatus | trend_status | Yes | EXACT_MATCH | |

## Backend-Gap Assessment (Revised)
The backend gap is confirmed to be **EXTREMELY MINIMAL**. The fields map nearly 1-to-1 between the AI Studio prototype and the `Pricing_Logistics` database. The only discrepancies relate to `origin/destination` string splitting and `accessorials` structures, which can be trivially resolved by standard DRF Serializers during WP7.
