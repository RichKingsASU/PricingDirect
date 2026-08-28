# Pricing Logistics Final Acceptance Matrix

| ID | Requirement | Automated Evidence | Stakeholder Test | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|
| UAT-1 | Authentication | PASS (test_01) | Login, navigate, logout, verify protected routes. | Successful login/logout and route protection. | | PENDING | |
| UAT-2 | Rate Directory | PASS (test_02) | Open rate directory, review lanes, search, filter. | Correct data shown, search/filter works. | | PENDING | |
| UAT-3 | Master System Target | PASS (test_calculate) | View lane with known master target (e.g. LA/LB to Shafter). | Target = seeded master target, Source = Forrest Master System Target Directory. | | PENDING | |
| UAT-4 | Mileage Fallback | PASS (test_calculate) | View lane without system target. | Target = max(350, 320 + miles * 3.8), Source = Calculated Mileage Benchmark. | | PENDING | |
| UAT-5 | Create Rate Lane | PASS (test_03) | Create a new valid rate lane. | Lane exists, values correct, persists after refresh. | | PENDING | |
| UAT-6 | Edit Rate Lane | PASS (test_04) | Edit an existing seeded lane. | Changes persist, calculations update, no unrelated fields lost. | | PENDING | |
| UAT-7 | Target Control Tower | PASS (test_08) | Review KPIs, exceptions, apply filters. | KPI values reflect dataset, filters work, counts accurate. | | PENDING | |
| UAT-8 | Lane Exception | PASS (test_07) | Open seeded exception, review relationship. | Correct lane relationship, state persists. | | PENDING | |
| UAT-9 | Pricing Adjustment | PASS (test_06) | Add/edit adjustment, review pricing result. | Adjustment persists, pricing impact matches legacy behavior. | | PENDING | |
| UAT-10 | Invalid Data | PASS (test_09) | Attempt known-invalid submission. | Server-side validation, useful error message, no invalid record persisted. | | PENDING | |
| UAT-11 | Persistence | PASS (E2E) | Make change, save, refresh, navigate away and back. | PostgreSQL-backed state remains. | | PENDING | |
| UAT-12 | Cross-Module Flow | PASS (test_10) | Run complete workflow (login -> rate -> exception -> CT). | All steps function correctly without errors. | | PENDING | |
