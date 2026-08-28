# PostgreSQL Bootstrap Report

## Environment Details
- **Database Name**: pricingdirect_dev
- **Application Role**: pricingdirect_app
- **PostgreSQL Version**: 17.x

## Schema Validation
- **Total Tables**: 16
- **Django Migration Table Count**: 1 (`django_migrations`)
- **Application/Framework Table Count**: 15

### Verified Application Tables
- `rates_customerratelane` (CustomerRateLane)
- `customers_organization` (Organization)
- `auth_user`, `auth_group`, `auth_permission`, `django_session` (Authentication/Sessions)
- `pricing_pricingadjustment` (PricingAdjustment)
- `pricing_marketsummary` (MarketSummary)
- `pricing_laneexception` (LaneException)

The schema matches the expected Django models and the canonical architecture.
