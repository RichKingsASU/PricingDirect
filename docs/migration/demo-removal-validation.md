# Demo Removal Validation

| Demo Artifact | Status | Classification |
| --- | --- | --- |
| Mock authentication | Removed in favor of \uthClient\ and Django session | \REMOVED\ |
| Generated rate records | Moved to \DemoRateRepository\ for dev-only mode | \DEVELOPMENT_DEMO_ONLY\ |
| Simulated API success | Replaced by \piClient\ hitting real Django backend | \REPLACED_BY_API\ |
| Artificial delays | Removed from production, kept in mock repos | \DEVELOPMENT_DEMO_ONLY\ |
| Browser-only authoritative persistence | Replaced by Django PostgreSQL | \REPLACED_BY_API\ |
| Gemini/AI Studio runtime remnants | Removed from frontend source | \REMOVED\ |
| Automatic demo fallback | Disabled; \piClient\ throws on failure | \REMOVED\ |
| Hard-coded KPIs | Replaced by API (temporarily disabled if API lacks them) | \REPLACED_BY_API\ |
| Placeholder production workflows | Replaced by API implementations | \REPLACED_BY_API\ |

All demo references are protected by \VITE_DATA_MODE\ which rejects \demo\ mode in production builds.
