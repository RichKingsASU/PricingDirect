# Feature Inventory

## Target Control Tower
| Legacy component | Legacy route | Visible element | Source field | Source entity | Calculation | Interaction | Django replacement | Parity status |
|---|---|---|---|---|---|---|---|---|
| `TargetControlTower.tsx` | N/A (component swap) | KPI: At / Under Target | `loads` | `LaneException` / `CustomerRateLane` | Count of loads where `avgActual <= target` | Click to filter exceptions | `pricing/views/control_tower.py` | IN PROGRESS |
| `TargetControlTower.tsx` | N/A | KPI: 0-5% Over Target | `loads` | `LaneException` / `CustomerRateLane` | Count of loads where `0 < varPercent <= 5` | Click to filter exceptions | `pricing/views/control_tower.py` | IN PROGRESS |
| `TargetControlTower.tsx` | N/A | KPI: >5% Over Target | `loads` | `LaneException` / `CustomerRateLane` | Count of loads where `varPercent > 5` | Click to filter exceptions | `pricing/views/control_tower.py` | IN PROGRESS |
| `TargetControlTower.tsx` | N/A | Filters | Market, Target Week, Customer | `MarketSummary`, etc | Filters table data | Dropdown select | `pricing/views/control_tower.py` | IN PROGRESS |
| `TargetControlTower.tsx` | N/A | Market Drilldown | `avgActual`, `avgTarget`, `loads` | `MarketSummary` | Sum/Avg for market | Click row -> load lanes | `pricing/views/control_tower.py` | IN PROGRESS |
| `TargetControlTower.tsx` | N/A | Exception Drilldown | `varDollars`, `loads` | `LaneException` | `Math.abs(varDollars)` display | Table rows | `pricing/views/control_tower.py` | IN PROGRESS |

## Rate Directory
*   **Rate Directory:** View and filter customer lanes. Search target benchmarks by origin, dest, miles. Add lanes and customers. Edit rate & targets.

## Data Management
| Legacy component | Legacy route | Visible element | Source field | Source entity | Interaction | Django replacement | Parity status |
|---|---|---|---|---|---|---|---|
| `DataManagement.tsx` | N/A | Tabs | Lanes, Adjustments, Exceptions, Summary | N/A | Switch views | Django Forms/Views | IN PROGRESS |
| `DataManagement.tsx` | N/A | Create / Edit / Delete | Fields | `CustomerRateLane`, `LaneException`, `PricingAdjustment` | Form submit | Django Forms | IN PROGRESS |

## Dashboard Charts / Maps
*   **Dashboard Charts / Maps:** Visual summary of loads, variance, and geographic distribution.
*   **Reports & Settings Modal:** Stubbed modals for reports and general settings.
