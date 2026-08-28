# Local Development Foundation

This document outlines the standard procedures for running the Forrest Logistics PricingDirect application locally.

## Architecture Boundaries
- **Frontend**: Vite React application running on port 3000 (`C:\Forrest\Projects\PricingDirect\Pricing-main\Pricing-main`).
- **Backend**: Django REST Framework application running on port 8000 (`C:\Forrest\Projects\Pricing_Logistics`).
- **Database**: PostgreSQL 17 (Targeted databases: `pricing_logistics_dev`, `pricing_logistics_test`).

## Prerequisites
- Node.js (v24.19.0)
- Bun (v1.4.0)
- Python 3.14.7
- PostgreSQL 17
- Git

## 1. Starting PostgreSQL
Ensure the PostgreSQL 17 service is running. Connect via `psql` or pgAdmin to verify the existence of the `pricing_logistics_dev` database.

## 2. Starting the Backend (Pricing_Logistics)
1. Navigate to the backend directory:
   ```powershell
   cd C:\Forrest\Projects\Pricing_Logistics
   ```
2. Activate your virtual environment (if applicable):
   ```powershell
   # e.g., .venv\Scripts\activate
   ```
3. Run the development server:
   ```powershell
   python manage.py runserver 0.0.0.0:8000
   ```

## 3. Starting the Frontend (PricingDirect)
1. Navigate to the frontend directory:
   ```powershell
   cd C:\Forrest\Projects\PricingDirect\Pricing-main\Pricing-main
   ```
2. Start the development server:
   ```powershell
   bun run dev
   ```
   The application will be available at `http://localhost:3000`.

## 4. Running Checks & Tests
**Frontend:**
Type-checking (Linting):
```powershell
bun run lint
```
Production Build Check:
```powershell
bun run build
```

**Backend:**
Run Django tests (this uses the configured test database):
```powershell
python manage.py test
```

## Verifying Connectivity
Once both servers are running:
1. Navigate to `http://localhost:8000/api/auth/me/` to verify the Django backend is responding.
2. Navigate to `http://localhost:3000` to verify the Vite frontend is rendering.

## Handling Environment Variables Safely
- **Frontend**: Copy `.env.example` to `.env`. Do NOT put real secrets (like production Google Maps API keys) in `.env` as it could accidentally be committed.
- **Backend**: Ensure the `.env` in `Pricing_Logistics` contains your local database credentials (e.g., `DATABASE_URL=postgres://user:pass@localhost:5432/pricing_logistics_dev`).

## Troubleshooting
- **Port in Use**: If `8000` or `3000` is blocked, ensure you don't have multiple instances running.
- **Database Connection Error**: Ensure PostgreSQL is active on port 5432 and the credentials in `Pricing_Logistics/.env` are correct. Do NOT run `manage.py migrate` during the current WP4 scope verification.
