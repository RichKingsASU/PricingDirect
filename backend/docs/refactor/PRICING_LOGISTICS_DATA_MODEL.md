# Data Model

## Current Supabase Schemas & TS Types
*   `organizations` -> Core tenant isolation.
*   `market_summaries` -> Target vs Actual variance metrics.
*   `lane_exceptions` -> Lanes that differ from target.
*   `pricing_adjustments` -> Scheduled target rate adjustments.
*   `customer_rate_lanes` -> Core pricing entity containing lane details, customer data, and base rates.

## Planned Django Models
Will map 1:1 with the above tables. The primary driver of business logic will be `CustomerRateLane` and its associated components (Origin, Destination, Fuel Surcharge).
