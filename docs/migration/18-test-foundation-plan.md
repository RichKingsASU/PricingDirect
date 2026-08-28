# Phase 18: Test Foundation Plan

## Objective
Establish a robust, automated test suite for the `PricingDirect` frontend to ensure UI components and workflows remain stable as the backend integration proceeds.

## Framework Selection
- **Unit & Component Testing**: `Vitest` + `React Testing Library`
- **End-to-End (E2E) Browser Testing**: `Selenium` with Chrome (Matching the existing `Pricing_Logistics` backend standard found in `test_e2e_tenant_isolation_selenium.py`).

## Minimum Coverage Matrix

### 1. Repository / API Adapter
- Mock HTTP responses (MSW - Mock Service Worker) for the upcoming DRF endpoints.
- Test loading states, empty array states, and API error states (500s, timeouts).

### 2. Permissions and Tenant Isolation
- Test that a user assigned to Organization A cannot view or edit lanes belonging to Organization B.
- Ensure the UI correctly handles HTTP 403 Forbidden responses by rendering appropriate error boundary or unauthorized messages.

### 3. Workflows
- **Pricing Records Rendering**: Verify the Rate Directory table renders accurately with given mock data.
- **Adjustment Workflow**: End-to-end simulation of clicking "Adjust Lane", modifying the base rate, and verifying the `PATCH` payload structure.
- **Exception Workflow**: End-to-end simulation of resolving a lane exception.
- **Upload Validation**: Simulating the CSV upload and verifying the mapping resolution modal appears.

## Execution
*Do not implement tests in this phase.* This plan will be executed in **WP12 (Automated Testing)** after the initial DRF endpoints are wired.
