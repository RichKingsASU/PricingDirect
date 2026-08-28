# Phase 12: Existing API Inventory

## DRF Endpoint Inventory (Pricing_Logistics)

| Method | URL | Django View/ViewSet | Serializer/Form | Model | Authentication | Permission | Tenant Filter | Request Fields | Response Fields | Pagination | Filtering | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GET/POST | `/api/customer_rate_lanes/` | `rates.api.get_customer_rate_lanes` | Unconfirmed | `rates.CustomerRateLane` | Session | Unconfirmed | Unconfirmed | Standard Model Fields | JSON Array | Unconfirmed | Unconfirmed | Implemented |
| GET/PUT | `/api/customer_rate_lanes/<int:pk>/` | `rates.api.get_customer_rate_lanes` | Unconfirmed | `rates.CustomerRateLane` | Session | Unconfirmed | Unconfirmed | Standard Model Fields | JSON Object | Unconfirmed | Unconfirmed | Implemented |
| GET | `/api/auth/me/` | `config.views.auth_me` | JSON Response | `User`/`Organization` | Session | Authenticated | None | None | `{username, organization_id, organization_name, roles}` | None | None | Implemented |

## Django HTML View Inventory (Needs DRF Conversion)
*The following routes exist in `pricing/urls.py` as Django template views, meaning they return HTML instead of JSON. They will need to be rewritten or paired with new DRF API endpoints to support the Vite React frontend.*

| Method | URL | Django View | Model | Status |
|---|---|---|---|---|
| GET/POST | `/rates/add/` | `rates.views.add_rate_lane` | `CustomerRateLane` | **DRF_ENDPOINT_NOT_IMPLEMENTED** |
| GET | `/pricing/control-tower/` | `pricing.views.control_tower` | `MarketSummary`, `LaneException`, `PricingAdjustment` | **DRF_ENDPOINT_NOT_IMPLEMENTED** |
| GET | `/pricing/data-management/` | `pricing.views.data_management` | Various | **DRF_ENDPOINT_NOT_IMPLEMENTED** |
| POST | `/pricing/data-management/lane/<int:lane_id>/edit/` | `pricing.views.edit_lane` | `LaneException` | **DRF_ENDPOINT_NOT_IMPLEMENTED** |
| POST | `/pricing/data-management/adjustment/<int:pk>/edit/`| `pricing.views.edit_adjustment` | `PricingAdjustment` | **DRF_ENDPOINT_NOT_IMPLEMENTED** |
| POST | `/pricing/data-management/exception/<int:pk>/edit/`| `pricing.views.edit_exception` | `LaneException` | **DRF_ENDPOINT_NOT_IMPLEMENTED** |

## Conclusion
While the backend has a rich set of views, it was built for server-side rendering (SSR). The only true API routes currently available are for `CustomerRateLane` and the authentication endpoint. WP7 (API contract implementation) will primarily consist of exposing the existing `pricing` app models through new `django-rest-framework` ViewSets.
