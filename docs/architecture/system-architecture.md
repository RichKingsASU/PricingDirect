# System Architecture

## Full-Stack Topology
- **Frontend**: React, Vite, Tailwind.
- **Backend**: Django API, PostgreSQL 17.

## Authentication
Django handles authentication via sessions. The frontend proxies API requests to the backend, preserving cookies.

