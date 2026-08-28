# Phase 5: Frontend-to-Data Matrix

| Domain | Screen | UI Field | Data Type | Required/Optional | Editable | Validation | Current Source | Proposed Source | Existing Backend Model | Proposed Model/Field | Source of Truth | Refresh Requirement | History Required | Sensitive | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| KPI | Target Control Tower | Loads Analyzed, Over Target %, Low Confidence | Number/String | Required | No | N/A | Mock (Initial Data) | Derived/Calculated Data | Partial | `MarketSummary`/Aggregates | DB Calculations | Hourly | Yes (Trending) | No | |
| Market | Target Control Tower | Name, Region, Avg Actual, Avg Target, Trend | Object | Required | Yes (Target) | >0 | Mock (Initial Data) | PostgreSQL app-owned data | `pricing.MarketSummary` | N/A | App Database | Daily | Yes (TrendData) | No | |
| Lane Exception | Target Control Tower | Origin, Destination, Market, Loads, Target, Actual, Confidence | Object | Required | Yes (Target) | >0 | Mock | Derived/Calculated Data | `pricing.LaneException` | N/A | App Database | Daily | Yes | No | Combines customer rates with actual ingest |
| Customer Rate Lane | Rate Directory | Customer, Origin, Destination, Base Rate, Total Billing, Accessorials | Object | Required | Yes | Valid IDs/Amounts | Mock | PostgreSQL app-owned data | `rates.CustomerRateLane` | N/A | App Database | On Change | Yes | Yes (Pricing) | Core pricing table |
| Planned Adjustment | Target Control Tower | Title, % Change, Effective Date, Status | Object | Required | Yes | Date future | Mock | PostgreSQL app-owned data | `pricing.PricingAdjustment` | N/A | App Database | On Change | Yes | Yes | Workflow state machine |
| Recommended Carrier | Rate Directory | Name, Rank, Reliability, Service Area | Object | Optional | No | N/A | Mock | PostgreSQL app-owned data / External API | TBD | `CarrierPerformance` | External/App DB | Daily | Yes | No | Assumed future integration |
| Validation Issue | Data Management | Issue Type, Location, Suggested Value, Status | Object | Required | Yes | N/A | Mock | PostgreSQL app-owned data | None | `ValidationIssue` | App Database | On Data Load | No | No | Used for staging mapping |
| Fuel Scale Bracket | Data Management | Min Diesel, Max Diesel, Surcharge % | Object | Required | Yes | Range Valid | Mock | Config/Reference Data | None | `FuelScaleBracket` | App Database | Admin Update | Yes | Yes | Used in billing calculation |
| Dataset Upload | Data Management | Name, Last Upload, Records Count, Status | Object | Required | No | N/A | Mock | Document-derived Data | None | `DatasetUpload` | App Database | On Upload | Yes | No | File ingestion log |

## Source Category Breakdown
- **PostgreSQL application-owned data:** CustomerRateLanes, PlannedAdjustments, FuelScaleBrackets, ValidationIssues, Markets.
- **Derived/Calculated data:** KPIStats, LaneExceptions.
- **Document-derived data:** Dataset Uploads.
- **External API data:** Map Coordinates (Google Maps).
- **User-entered data:** Adjustments, new lanes, new customers, manual mappings.
