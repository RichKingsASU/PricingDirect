# Parity Matrix

## Status
- `N/A`: Not started
- `WIP`: Work in progress
- `Complete`: Parity achieved

| Feature | Legacy Component | Django View/Template | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `Login.tsx` | `login.html` | Complete | Migrated to Django Auth. |
| **Top Navigation** | `TopNavBar.tsx` | `base.html` | Complete | Bootstrap 5 applied. |
| **Sidebar Navigation** | `Sidebar.tsx` | `base.html` | Complete | Bootstrap 5 applied. |
| **Target Control Tower** | `TargetControlTower.tsx` | `control_tower.html` | Complete | Migrated with KPI aggregation via Django models. |
| **Rate Directory** | `RateDirectory.tsx` | `rate_directory.html` | Complete | First vertical slice complete with Python calculation logic. |
| **Data Management** | `DataManagement.tsx` | `data_management.html` | Complete | Implemented Django forms and CRUD flows. |
| **Add Customer Modal** | `AddCustomerModal.tsx` | N/A | N/A | Folded into generic form workflows. |
| **Add Lane Modal** | `AddLaneModal.tsx` | `add_rate_lane_view` | Complete | Integrated as a full page view. |
| **Adjust Lane Modal** | `AdjustLaneModal.tsx` | `edit_lane` | Complete | Handled via Data Management forms. |
| **Reports Modal** | `ReportsModal.tsx` | Modal | N/A | |
| **Settings Modal** | `SettingsModal.tsx` | Modal | N/A | |
