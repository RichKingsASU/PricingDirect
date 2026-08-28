# Phase 4: Screen and Workflow Inventory

| Screen / Component | Route / Tab | Purpose | Roles | Read Operations | Create/Update Operations | Current Data Source | Required Real Source | Backend Status |
|---|---|---|---|---|---|---|---|---|
| Target Control Tower | `target_control_tower` | Monitor KPIs, markets, exceptions, and schedule adjustments | Pricing Team, Ops | KPIStats, Markets, LaneExceptions, PlannedAdjustments | Approve/Reject/Schedule Adjustments, Reset Baseline, Ingest Actuals | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Rate Directory | `rate_directory` | View and edit customer lane rates and accessorials | Pricing Team, Ops | CustomerRateLanes | Add Customer, Add Lane, Edit Lane | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Data Management | `data_management` | Upload files, map exceptions, validate staging data, manage fuel scales | Ops | Datasets, ValidationIssues | Commit Changes, Discard Changes, Save Fuel Scale | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Adjust Lane Modal | Modal | Edit specific lane/market target rates | Pricing Team | Market/Lane details | Save Adjustment | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Schedule Adjustment Modal | Modal | Create a new planned target adjustment | Pricing Team | None | Add Planned Adjustment | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Map Manual Modal | Modal | Resolve unmapped locations | Ops | ValidationIssue | Resolve Validation Issue | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Report Issue Modal | Modal | Submit data anomalies to pricing | Ops | None | Submit Report | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Add Customer Modal | Modal | Create a new customer and default lane | Pricing Team | None | Create CustomerRateLane | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Add Lane Modal | Modal | Add a new lane to an existing customer | Pricing Team | Customers | Create CustomerRateLane | Memory (DemoRepo) | PostgreSQL API | Requires New API |
| Settings Modal | Modal | Adjust application preferences | All | None | None | None (UI only) | PostgreSQL User Prefs | Requires New API |
| Reports Modal | Modal | View or generate reports | All | None | None | None (UI only) | PostgreSQL/Warehouse | Requires New API |

## Interactive Control Status
- **Works only in frontend memory:** All create/update actions (Save Adjustment, Add Customer, Map Manual, Commit Staging, Schedule Adjustment, Ingest Actuals, etc.)
- **Writes to browser storage:** None
- **Produces an artificial response:** `handleUploadFileSimulated` produces a fake success result; `handleIngestActualLoads` parses text but only affects memory.
- **Requires a new backend workflow:** Every data-modifying operation requires a corresponding DRF (Django REST Framework) POST/PUT endpoint connected to a PostgreSQL database.

## Dead Navigation
- `ReportsModal` and `SettingsModal` currently just display placeholder content with no functional logic behind them.
