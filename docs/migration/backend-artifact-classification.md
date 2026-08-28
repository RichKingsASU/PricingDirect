# Backend Artifact Classification

During the full-stack consolidation, we identified historical frontend files within the imported ackend/ directory.

## Classification

| Artifact | Classification | Action |
| --- | --- | --- |
| ackend/package.json | HISTORICAL_FRONTEND | Removed |
| ackend/package-lock.json | HISTORICAL_FRONTEND | Removed |
| ackend/vite.config.ts | HISTORICAL_FRONTEND | Removed |
| ackend/vitest.setup.ts | HISTORICAL_FRONTEND | Removed |
| ackend/tsconfig.json | HISTORICAL_FRONTEND | Removed |
| ackend/index.html | HISTORICAL_FRONTEND | Removed |
| ackend/src/ | DUPLICATE_OF_APPROVED_FRONTEND | Removed |
| ackend/assets/ | HISTORICAL_FRONTEND | Removed |
| ackend/templates/ | SSR_REQUIRED | Preserved |
| ackend/static/ | DJANGO_RUNTIME_REQUIRED | Preserved |
| ackend/db.sqlite3 | HISTORICAL_FRONTEND (Development artifact) | Removed |

The removed artifacts have been deleted from the active tree.
