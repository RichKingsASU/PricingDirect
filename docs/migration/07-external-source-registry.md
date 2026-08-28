# Phase 8: External API and Website Source Registry

| Source | Business Purpose | Official API Available | Authentication | Approved Access Needed | Data Entities | Refresh Frequency | Rate Limit | Raw Retention | Normalization Target | Identity Key | Failure Behavior | Legal/Terms Review | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **EIA Data API** | Regional Diesel Prices | Yes | API Key | Yes | Fuel Prices (PADD) | Weekly | 1,000/hr | Yes | `FuelScaleBracket` (Derived) | Series ID | Fall back to last known weekly price | Pending | `OPTIONAL_FUTURE_INTEGRATION` |
| **Google Maps API** | Logistics map rendering | Yes | API Key | Yes | Map Tiles, Coordinates | On-Render | TBD | No | N/A | PlaceID / LatLng | UI gracefully degrades map | Approved | `REQUIRED_FOR_PRICINGDIRECT` |
| **Google Gemini API** | AI Analysis / OCR (Implied) | Yes | API Key | Yes | Unstructured text | On-Demand | TBD | No | N/A | Request ID | Fallback to manual entry | Pending | `UNUSED_PROTOTYPE_REMNANT` (Remove) |

## External Source Classifications
- **EIA Data API**: Required for automated fuel surcharge updates, but optional for MVP if updated manually.
- **Google Maps API**: Strictly required for the interactive map visuals in the control tower.
- **FMCSA/SAFER/RMIS**: `INCORRECT_SCOPE`. These are Risk & Safety dependencies and not applicable to pure PricingDirect logic unless explicitly integrated later for carrier recommendations.
- **Google Gemini API**: Unused dependency in `package.json`. Should be removed.
