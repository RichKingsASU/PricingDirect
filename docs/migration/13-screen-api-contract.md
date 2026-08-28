# Phase 13: Screen-to-API Contract

This document maps every UI action in the `PricingDirect` React frontend to a proposed `Pricing_Logistics` Django REST Framework API contract.

## 1. Rate Directory (`rate_directory` tab)
| UI Action | Method | Proposed Endpoint | Request Schema | Response Schema | Tenant Enforcement | Existing/New |
|---|---|---|---|---|---|---|
| Load Lanes | GET | `/api/rates/lanes/` | Query: `?status=AWARDED` | `CustomerRateLane[]` | Filter by user's Organization | Existing Model, New DRF View |
| Add Customer | POST | `/api/rates/customers/` | `name`, `billing_id` | `Organization` | Attached to User | New DRF View |
| Add Lane (Modal) | POST | `/api/rates/lanes/` | `origin`, `destination`, `base_rate` | `CustomerRateLane` | Validates Organization ownership | Existing Model, New DRF View |
| Edit Lane (Modal) | PATCH | `/api/rates/lanes/{id}/`| `base_rate`, `status` | `CustomerRateLane` | 403 if ID not in User's Org | Existing Model, New DRF View |

## 2. Target Control Tower (`target_control_tower` tab)
| UI Action | Method | Proposed Endpoint | Request Schema | Response Schema | Tenant Enforcement | Existing/New |
|---|---|---|---|---|---|---|
| Load KPI Stats | GET | `/api/pricing/kpis/` | Query: `?date_range=...` | `{ loads_analyzed, over_target_pct }` | Filter loads by Organization | New DRF View/Aggregation |
| Load Markets | GET | `/api/pricing/markets/` | None | `MarketSummary[]` | Filter by user's Organization | Existing Model, New DRF View |
| Load Exceptions | GET | `/api/pricing/exceptions/`| None | `LaneException[]` | Filter by user's Organization | Existing Model, New DRF View |
| Adjust Exception | POST | `/api/pricing/exceptions/{id}/adjust/`| `new_target_rate`, `reason` | `LaneException` | 403 if ID not in User's Org | Existing Model, New DRF View |
| Load Adjustments | GET | `/api/pricing/adjustments/`| None | `PricingAdjustment[]` | Filter by user's Organization | Existing Model, New DRF View |
| Schedule Adjust | POST | `/api/pricing/adjustments/`| `title`, `change_percent`, `effective_date` | `PricingAdjustment` | Attached to User's Org | Existing Model, New DRF View |

## 3. Data Management (`data_management` tab)
| UI Action | Method | Proposed Endpoint | Request Schema | Response Schema | Tenant Enforcement | Existing/New |
|---|---|---|---|---|---|---|
| Load Datasets | GET | `/api/ingestion/datasets/`| None | `DatasetUpload[]` | Filter by user's Organization | `NEW_MODEL_REQUIRED` |
| Upload File | POST | `/api/ingestion/upload/` | `multipart/form-data` | `DatasetUpload` status | Attached to User's Org | `NEW_MODEL_REQUIRED` |
| Load Validation | GET | `/api/ingestion/issues/`| Query: `?dataset_id=...`| `ValidationIssue[]` | Ensure Dataset is in User's Org | `NEW_MODEL_REQUIRED` |
| Resolve Issue | PATCH | `/api/ingestion/issues/{id}/`| `resolution_action`, `suggested_value`| `ValidationIssue` | 403 if ID not in User's Org | `NEW_MODEL_REQUIRED` |
| Save Fuel Scale | POST | `/api/pricing/fuel-scales/`| `min`, `max`, `surcharge_pct` | `FuelScaleBracket` | Validates admin privileges | `NEW_MODEL_REQUIRED` |

## Modals and Drawers
- **MapManualModal**: Handled by Resolve Issue (`PATCH /api/ingestion/issues/`)
- **SettingsModal / ReportsModal**: Non-functional in prototype. Require future definition.
- **ReportIssueModal**: `POST /api/support/issues/` (New Endpoint).
