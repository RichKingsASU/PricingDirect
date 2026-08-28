# Test Plan

## Unit Testing (Django)
*   **Models:** Verify field constraints, string representations, and default values for `CustomerRateLane`, `MarketSummary`, `LaneException`, `PricingAdjustment`.
*   **Pricing Services:** Ensure the variance calculation, total billing, and target benchmark algorithms produce the exact same output as the legacy TypeScript implementation for given inputs.

## View Testing (Django)
*   **Context:** Validate that context variables sent to templates correctly mirror the expected state.
*   **POST:** Ensure form submissions (like adding a customer lane) update the database correctly.

## End-to-End Testing (Selenium)
*   **Setup:** Use Chrome/Edge local drivers. Connect to `pricing_logistics_test` database.
*   **Scenarios:**
    1. Navigate to Rate Directory.
    2. Ensure target benchmark lookup functions correctly.
    3. Add a new customer lane.
    4. Verify the newly added lane appears in the list and persists across page refreshes.
