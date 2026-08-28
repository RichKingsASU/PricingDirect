# Phase 16: Upload and Staging Design Review

## Minimum Production-Safe Model Set

The naive approach of just `DatasetUpload` and `ValidationIssue` is insufficient for a production pricing application handling bulk rates. Directly updating `CustomerRateLane` from an upload without staging risks database corruption.

To safely ingest rate spreadsheets, we require a 3-tier staging architecture:

### 1. `ingestion.ImportRun`
- **Purpose**: Tracks the metadata and lifecycle of a single spreadsheet upload.
- **Fields**: `id`, `organization_id`, `uploaded_by` (FK to User), `file_name`, `status` (PENDING, MAPPING, VALIDATING, READY, COMMITTED, FAILED), `created_at`, `applied_at`.
- **Idempotency**: Prevents processing the same file twice. Provides a lineage for every row.

### 2. `ingestion.StagingRow`
- **Purpose**: Temporarily holds the raw string data extracted from the CSV/XLSX, tied to an `ImportRun`.
- **Fields**: `id`, `import_run_id`, `row_number`, `raw_payload` (JSONB), `status` (PENDING, REJECTED, ACCEPTED), `target_model` (e.g. 'CustomerRateLane').
- **Benefit**: Retains exactly what the user uploaded before normalization. Allows the user to fix rows individually before committing the batch.

### 3. `ingestion.ValidationIssue`
- **Purpose**: Records specific errors or warnings against a `StagingRow`.
- **Fields**: `id`, `staging_row_id`, `issue_type` (e.g. "UNKNOWN_ORIGIN", "INVALID_RATE"), `suggested_value`, `is_blocking`.
- **Benefit**: Drives the frontend "Resolve Mappings" modal in the Data Management tab.

## Workflow
1. User uploads file -> Backend creates `ImportRun` and parses file into `StagingRow`s.
2. Background task (Celery) validates rows, creating `ValidationIssue`s for anomalies.
3. User resolves issues in UI (updating `StagingRow` JSON and resolving `ValidationIssue`).
4. User clicks "Commit" -> Backend attempts bulk insertion from `StagingRow` to `rates.CustomerRateLane`, marking `ImportRun` as COMMITTED.
