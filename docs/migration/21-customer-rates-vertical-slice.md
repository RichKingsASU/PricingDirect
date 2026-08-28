# Phase 21: Customer Rates Vertical Slice

## Objective
Implement the first vertical slice of the API integration: **Read-only Customer Rates**. This slice will prove the API contract, tenant isolation, Django Session auth, and Vite proxy topology without modifying the frontend's write capabilities.

## 1. Backend Implementation (Additive API)
**Target File**: `rates/api/views.py` (New or appended)
**Target URL**: `/api/rates/lanes/`

- **Serializer**: `CustomerRateLaneSerializer` (Read-only representation).
- **ViewSet**: `ReadOnlyModelViewSet` (limits to GET `list` and `retrieve`).
- **Authentication**: `SessionAuthentication` (relies on Django login).
- **Permission**: `IsAuthenticated`.
- **Tenant Filtering**: The `get_queryset()` method MUST enforce `organization_id = request.user.organization_id`. The client is not allowed to pass an organization ID.
- **Filtering**: Support filtering by `status` (e.g., `?status=AWARDED`).
- **Pagination**: Default DRF `PageNumberPagination`.
- **Tests Required**: Write `tests/api/test_rates_api.py` validating a user in Org A cannot query `CustomerRateLane` records in Org B.

## 2. Frontend Implementation
- **Vite Proxy**: Add `proxy: { '/api': 'http://localhost:8000' }` to `vite.config.ts`.
- **API Adapter**: Create `src/services/api/ratesClient.ts` containing the `fetch` logic for `/api/rates/lanes/`.
- **State Management**: Update `RateDirectory.tsx` to display:
  - **Loading State**: Skeleton loader while fetching.
  - **Error State**: Render an error banner (e.g., "Network Error" or "403 Forbidden").
  - **Empty State**: Render "No lanes configured" if the array is empty.
- **Feature Flag**: Keep `DemoRateRepository` active for writes (POST/PATCH). Introduce a boolean flag `USE_REAL_API = true` specifically for the initial GET load. If the GET request fails, it must explicitly render the error state, *not* silently fall back to the mock.

## 3. Verification Protocol
1. Start backend and login via the existing Django HTML login page.
2. Start frontend.
3. Open network tab and verify a GET request goes to `http://localhost:3000/api/rates/lanes/` (proxied to 8000) with the session cookie attached.
4. Verify the Rate Directory table populates with the 3 records residing in the PostgreSQL database.
