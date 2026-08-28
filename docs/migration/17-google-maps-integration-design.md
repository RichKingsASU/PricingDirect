# Phase 17: Google Maps Integration Design

## Prototype Usage Assessment
The current `PricingDirect` prototype exclusively uses Google Maps for **Browser Map Rendering** and basic **Route Visualization** in the `Target Control Tower` tab.
- **Geocoding**: Not visibly utilized (origins and destinations are plain strings).
- **Distance Matrix / Mileage**: Currently mocked via the `DemoRateRepository`.

## Security Recommendations

### 1. Browser-Rendering Keys (Frontend)
The map requires a key to be embedded in the browser context via Vite environment variables (`VITE_GOOGLE_MAPS_API_KEY`).
- **Restriction**: The production API key must have strict HTTP Referrer restrictions limiting it to the production origin (e.g., `https://pricingdirect.forrestlogistics.com/*`).
- **Separation**: A separate key must be used for local development, restricted to `localhost:3000`.
- **Secret Storage**: Keys must be injected via CI/CD (e.g., GitHub Actions Secrets) and NEVER committed to Git.

### 2. Billable / Mileage APIs (Backend)
When `PricingDirect` transitions to dynamically calculating miles or validating city names (Geocoding), these calls MUST NOT originate from the browser.
- **Backend-Mediated Requests**: The Django backend must hold a separate, strictly-controlled Google API Key (or use an alternative like PC*Miler).
- **Caching**: The backend must aggressively cache Geocoding results and route mileage in PostgreSQL to avoid exorbitant Google Maps API billing.

*(Note: No Google Maps APIs are active or called in this phase. This defines the standard for WP9).*
