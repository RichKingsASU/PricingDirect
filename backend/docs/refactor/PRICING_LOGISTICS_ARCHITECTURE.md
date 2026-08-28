# Architecture

## Legacy Prototype Stack
*   **Frontend Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS 4
*   **Backend / Database:** Supabase (PostgreSQL accessed via PostgREST API)
*   **Anti-Patterns:** Fat components, Client-side business logic, Hardcoded data.

## Refactored Application Stack
The application is being migrated to a robust, server-rendered Django architecture, prioritizing stability, testability, and centralization of business logic.

*   **Runtime:** Python 3.13.x
*   **Web Framework:** Django 5.2.x
*   **Database:** PostgreSQL 17 (via psycopg)
*   **Frontend UI:** Django Templates + Bootstrap 5 + minimal JavaScript (vanilla)
*   **Testing:** Django `TestCase` + Selenium (E2E)

## Target Architecture Principles
1. **Server-Side Rendering:** Replacing React SPAs with server-rendered HTML for performance and simplicity in internal tools.
2. **Domain Service Layer:** Moving pricing logic out of views and frontend code into dedicated, testable domain services (e.g., `pricing.services.target_pricing`).
3. **Relational Integrity:** Replacing loose client-side joins with strict foreign keys and Django ORM relationships.
4. **Data Management:** Implementing robust CRUD and staging features via Django Forms and ModelForms instead of complex client-side state maps.
