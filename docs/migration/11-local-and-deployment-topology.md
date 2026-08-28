# Phase 11: Local & Deployment Topology

## Recommended Architecture: Same-Origin Deployment

**Topology Selected:** Same-Origin Deployment
In this model, the Vite-built frontend assets are served by the Django backend (or a shared reverse proxy/load balancer) under the same domain/origin in production (e.g., `pricingdirect.forrestlogistics.com`).

### Why Same-Origin?
- **Authentication:** By sharing an origin, the frontend can securely use standard Django session cookies. This avoids the complexity of issuing and rotating JSON Web Tokens (JWTs) and manually configuring secure, cross-domain cookie handling.
- **Security:** Django's built-in `CSRFMiddleware` works out of the box with `SameSite=Lax` cookies. We do not need to punch holes in CORS or manage complex Cross-Origin Resource Sharing configurations.
- **Simplicity:** The current `Pricing_Logistics` backend appears to be originally built for server-side rendering (SSR) using Django templates. Transitioning it to a DRF API serving a React SPA is significantly easier if they share an origin, as the authentication mechanisms do not need to be fundamentally rewritten.

### Development Topology (Local)
While production uses the same origin, local development will temporarily use separate origins to allow Vite's Hot Module Replacement (HMR) to function.
- **Frontend (Vite):** `http://localhost:3000`
- **Backend (Django):** `http://localhost:8000`

To solve local CORS/CSRF issues during development without compromising the production architecture, we will configure Vite's development server to proxy API requests to Django.

*Vite Proxy Example (to be added to `vite.config.ts` later):*
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    }
  }
})
```
This tricks the browser into thinking the API is on `localhost:3000`, matching the production Same-Origin topology exactly.
