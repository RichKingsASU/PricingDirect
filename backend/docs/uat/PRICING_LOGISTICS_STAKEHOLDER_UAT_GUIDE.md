# Pricing Logistics: Stakeholder UAT Guide

## Objective
The objective of this User Acceptance Testing (UAT) is to validate that the new Django-based Pricing Logistics application meets all functional requirements and matches the expected legacy behavior before production deployment.

## Application URL
http://localhost:8000/ (or the designated UAT environment URL)

## Login Process
1. Navigate to the Application URL.
2. Enter the provided UAT credentials (e.g., username: `uat_user`).
3. Click "Login" to access the application.

## Modules Being Reviewed
- **Authentication**: Secure login, session management, and logout.
- **Rate Directory**: Viewing, searching, creating, and editing customer rate lanes.
- **Target Control Tower**: Reviewing KPIs, exceptions, and applying market filters.
- **Data Management**: Reviewing and managing Lane Exceptions and Pricing Adjustments.

## Seeded Scenarios
The database has been pre-seeded with deterministic data to demonstrate key functionalities:
- **Master System Target**: A lane with a known target. (e.g., LA/LB to Shafter, or Seattle to Lakewood).
- **Mileage Fallback**: A lane without a system target, utilizing the formula `max(350, 320 + miles * 3.8)`.
- **Lane Exception**: A seeded exception visible in the Control Tower.

## Expected Workflows
1. **Login**: Verify that authentication protects the application and allows access with valid credentials.
2. **Review Rate Directory**: Search for "Acme Corp" or "Globex", and inspect the calculated target pay and benchmark source.
3. **Edit a Lane**: Change the base rate or miles of a lane and save. Verify the changes persist after refreshing the page.
4. **Control Tower**: Navigate to the Control Tower, review the KPIs, and check the seeded exception for the NW market.
5. **Data Management**: Open Data Management to review the pricing adjustment and lane exception statuses.
6. **Logout**: Verify that logging out terminates the session and redirects to the login screen.

## How to Report a Defect
If you encounter unexpected behavior or errors:
1. Note the scenario you were executing.
2. Document the steps to reproduce the issue.
3. Note the expected result vs. the actual result.
4. Record the issue in the `PRICING_LOGISTICS_UAT_DEFECT_LOG.md` document.

## Out of Scope
- Production deployment or performance/load testing.
- Modifying the underlying database schema directly via SQL.
- Legacy Supabase or React components (these have been fully removed and are not part of UAT).

## Sign-Off Process
Once testing is complete, please review the Acceptance Matrix and provide your formal approval in the `PRICING_LOGISTICS_UAT_SIGNOFF.md` document.
