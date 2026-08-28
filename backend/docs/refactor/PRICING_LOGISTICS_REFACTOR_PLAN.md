# Refactor Plan

## WP1 - Baseline and Architecture
Complete. Forensic audit performed and documented.

## WP2 - Django Foundation
*   Initialize `config` module.
*   Setup PostgreSQL connection to `pricing_logistics_dev`.
*   Establish basic templates and static file routing.

## WP3 - Domain Schema
*   Create Django models in `rates/` and `customers/` apps.
*   Implement migrations and validate against the dev DB.

## WP4 - Reference Data
*   Migrate `targetMasterData.ts` and `recommendedCarriersData.ts` into database fixtures or models.

## WP5 - Core Pricing Services
*   Create pure python services in Django to handle Variance Calculation, Total Billing Calculation, and Target Benchmarking.

## WP6 - UI Parity (First Vertical Slice)
*   Rebuild `RateDirectory.tsx` functionality in Django Templates using Bootstrap.
*   Ensure the same filters, search queries, and add/edit modalities are present.

## WP7-WP10 - Continuing Slices, Testing, Parity
*   Migrate remaining views.
*   Test with `manage.py test` and Selenium.
*   Remove Supabase UI dependencies.
