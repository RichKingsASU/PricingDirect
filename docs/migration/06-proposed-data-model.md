# Phase 7: Proposed Production Data Architecture

> [!TIP]
> The prior `Pricing_Logistics` Django implementation exists and already contains the core models needed for `PricingDirect`. This architecture builds upon those existing foundations.

## Entity-Relationship Diagram

```mermaid
erDiagram
    %% Core Entities
    ORGANIZATION {
        integer id PK
        string name
    }

    USER {
        integer id PK
        string email UK
        string role
        boolean is_active
    }

    %% Rates App (Existing)
    CUSTOMER_RATE_LANE {
        integer id PK
        integer organization_id FK
        string lane_id UK
        string customer_name
        string origin_city
        string destination_city
        decimal base_rate
        decimal fuel_surcharge_percent
        decimal fuel_amount
        decimal total_billing
        string status
        string active_state
    }

    %% Pricing App (Existing)
    MARKET_SUMMARY {
        integer id PK
        integer organization_id FK
        string name
        string region
        decimal avg_target
        decimal variance_dollars
        decimal variance_percent
    }

    LANE_EXCEPTION {
        integer id PK
        integer organization_id FK
        string origin
        string destination
        decimal current_target
        decimal avg_actual
        decimal var_percent
        string adjustment_status
    }

    PRICING_ADJUSTMENT {
        integer id PK
        integer organization_id FK
        string title
        decimal change_percent
        string status
        datetime effective_date
    }

    %% Ingestion (Proposed New Models)
    DATASET_UPLOAD {
        integer id PK
        string file_name
        integer records_processed
        string status
        datetime uploaded_at
    }

    VALIDATION_ISSUE {
        integer id PK
        integer dataset_id FK
        string issue_type
        string resolution_status
    }

    %% Relationships
    ORGANIZATION ||--o{ CUSTOMER_RATE_LANE : "owns"
    ORGANIZATION ||--o{ MARKET_SUMMARY : "owns"
    ORGANIZATION ||--o{ LANE_EXCEPTION : "owns"
    ORGANIZATION ||--o{ PRICING_ADJUSTMENT : "owns"
    DATASET_UPLOAD ||--o{ VALIDATION_ISSUE : "generates"
```

## Table-Level Data Dictionary (PricingDirect Core)

| Model | Application | Primary Key | Key Fields | Source of Truth |
|---|---|---|---|---|
| `CustomerRateLane` | `rates` | ID | `lane_id`, `base_rate`, `fuel_surcharge_percent` | App DB |
| `MarketSummary` | `pricing` | ID | `name`, `avg_target`, `variance_percent` | App DB |
| `LaneException` | `pricing` | ID | `origin`, `destination`, `current_target` | App DB |
| `PricingAdjustment` | `pricing` | ID | `title`, `change_percent`, `effective_date` | App DB |

## Architecture Decisions & Pricing Formulas Discovered
- **Fuel Calculation**: The formula for calculating total billing is explicitly defined in `rates.models.CustomerRateLane.save()`: 
  `self.fuel_amount = base_rate * (fuel_surcharge_percent / 100)`
  `self.total_billing = base_rate + self.fuel_amount`
  *This confirms that rate calculations are authoritative on the Django backend.*
- **No Duplicate Models**: We will use `CustomerRateLane`, `MarketSummary`, `LaneException`, and `PricingAdjustment` exactly as they exist in `Pricing_Logistics`.
