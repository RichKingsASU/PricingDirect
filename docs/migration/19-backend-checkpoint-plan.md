# Phase 19: Backend Checkpoint Plan

## Checkpoint Inventory

| File | Git Status | Change Purpose | Related to PricingDirect | Required for API Work | Proposed Checkpoint Group | Risk |
|---|---|---|---|---|---|---|
| `config/settings.py` | Modified | Core DB/App configuration | Yes | Yes (DB Connection) | 1: Environment & Config | High |
| `fix_settings.py` | Deleted | Removing cleanup script | No | No | 1: Environment & Config | Low |
| `rates/models.py` | Modified | Added/refined fields/calcs | Yes | Yes (Core Schema) | 2: Rates App Refinement | High |
| `rates/views.py` | Modified | View refinements | Yes | No (Will use DRF instead) | 2: Rates App Refinement | Low |
| `templates/rates/rate_directory.html` | Modified | UI Refinements | Yes | No (Being replaced by React) | 2: Rates App Refinement | Low |
| `pricing/forms.py` | Modified | Form refinements | Yes | No (Being replaced by React) | 3: Pricing App Refinement | Low |
| `pricing/services/target_master_data.py` | Modified | Data service logic | Yes | Yes (Data source logic) | 3: Pricing App Refinement | Medium |
| `templates/pricing/control_tower.html` | Modified | UI Refinements | Yes | No (Being replaced by React) | 3: Pricing App Refinement | Low |

### Untracked Files (Do Not Commit)
- `DEMO-SETUP-REPORT.md`: Documentation (Add to `.gitignore` or leave untracked)
- `startup_demo.ps1`: Demo script (Add to `.gitignore`)
- `export_build/`: Generated output (Add to `.gitignore`)
- `__pycache__/` directories: Cache (Already ignored by standard Git, but potentially generated in non-standard paths).

## Recommended Isolation Strategy: Strategy A (Checkpoint then branch)

**Reasoning**: The uncommitted modifications to `config/settings.py`, `rates/models.py`, and `pricing/services/target_master_data.py` represent legitimate, required backend logic (specifically, finalizing the migration from Supabase to local Postgres, which aligns with the previous commit history). These changes contain the exact pricing calculations we intend to expose via the API.

**Proposed Steps**:
1. Add `DEMO-SETUP-REPORT.md`, `startup_demo.ps1`, and `export_build/` to the backend's `.gitignore`.
2. Commit Group 1: Environment & Config
3. Commit Group 2: Rates App Refinement
4. Commit Group 3: Pricing App Refinement
5. Create and checkout the new branch `migration/pricingdirect-api-integration`.
6. Implement DRF APIs safely on the new branch.
