# Customer Rates API

## Endpoint: `GET /api/rates/lanes/`

This is a read-only endpoint that returns a list of customer rate lanes for the authenticated user's organization.

### Authentication Behavior

- Requires Django session authentication (`request.user.is_authenticated`).
- Will return `401 Unauthorized` if not authenticated.
- Will return `404 Not Found` if the organization cannot be resolved or is unauthorized for the user.

### Tenant Isolation

- Server-side organization isolation is strictly enforced.
- The `resolve_user_organization` decorator logic resolves the organization the user belongs to.
- The query strictly filters records using `organization=org` where `org` is the resolved organization.

### Supported Query Parameters

- **Pagination**: 
  - `limit` (default: 50, max: 100): The maximum number of records to return.
  - `offset` (default: 0): The starting index of records to return.
- **Search & Filters**:
  - `customer_name`: Case-insensitive partial match (`icontains`).
  - `origin_city`: Exact match, case-insensitive (`iexact`).
  - `destination_city`: Exact match, case-insensitive (`iexact`).
  - `active_state`: Exact match.
  - `status`: Exact match.
- **Ordering**:
  - `ordering`: Approved fields are `effective_date`, `expiration_date`, `base_rate`, `customer_name`. Use a `-` prefix for descending order. Example: `?ordering=-base_rate`.

### Response Contract

- The response contains a JSON object with `count` (total records) and `results` (array of rate objects).
- All decimal fields (`base_rate`, `fuel_surcharge_percent`, `fuel_amount`, `total_billing`) are serialized safely as strings to prevent precision loss.
- Calculated fields are read-only since this is a GET-only API.
- All non-GET methods (POST, PUT, PATCH, DELETE) will be rejected with a `405 Method Not Allowed` status.

### Example Response

```json
{
  "count": 1,
  "results": [
    {
      "id": "1",
      "organization_id": "1",
      "lane_id": "L1",
      "customer_name": "Cust 1",
      "origin_city": "City A",
      "origin_state": "CA",
      "raw_origin": "City A, CA",
      "destination_city": "City B",
      "destination_state": "NY",
      "raw_destination": "City B, NY",
      "base_rate": "100.50",
      "equipment": "V",
      "service_type": "S",
      "miles": 500,
      "status": "AWARDED",
      "active_state": "Active",
      "effective_date": "2026-01-01",
      "expiration_date": "2026-12-31",
      "fuel_surcharge_percent": "10.00",
      "fuel_amount": "10.05",
      "total_billing": "110.55"
    }
  ]
}
```
