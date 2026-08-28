# Phase 15: Pricing Calculation Review

## Identified Calculation
Located in `C:\Forrest\Projects\Pricing_Logistics\rates\models.py` inside the `CustomerRateLane.save()` method:

```python
    def save(self, *args, **kwargs):
        cents = Decimal('0.01')
        base_rate = Decimal(str(self.base_rate))
        fuel_surcharge_percent = Decimal(str(self.fuel_surcharge_percent))
        self.fuel_amount = (base_rate * fuel_surcharge_percent / 100).quantize(cents, rounding=ROUND_HALF_UP)
        self.total_billing = (base_rate + self.fuel_amount).quantize(cents, rounding=ROUND_HALF_UP)
        super().save(*args, **kwargs)
```

## Review Criteria
- **Exact source**: `rates/models.py:L40`
- **Decimal types and precision**: Explicitly casts to `Decimal` and quantizes to 2 decimal places (`cents = Decimal('0.01')`) using `ROUND_HALF_UP`.
- **Null handling**: None. Assumes `base_rate` and `fuel_surcharge_percent` are present. Will crash (TypeError) if `None` is provided.
- **Negative-value handling**: Database constraint `rates_base_rate_non_negative` enforces `base_rate >= 0`.
- **Currency assumption**: Assumes USD (or uniform base currency).
- **Accessorials**: Not included in the `total_billing` calculation.
- **Adjustments/Exceptions**: Not dynamically factored in during this save hook.
- **Historical rates**: If a lane is edited, it recalculates. There is no concept of a "Rate Version" in this specific table, meaning edits overwrite historical calculations.
- **Bulk Operations**: Standard Django `bulk_create` or `bulk_update` (or QuerySet `update()`) **bypasses this `save()` method entirely**.
- **Missing boundary tests**: Needs tests for zero base rate, zero fuel surcharge, and float-precision edge cases in DRF payloads.

## Recommendations
**Keep in the model method for MVP, but refactor to a Domain Service later.**
Currently, this `save()` override is functional for standard individual edits. However, because `bulk_update()` and `QuerySet.update()` bypass `save()`, this calculation is at risk of being skipped during bulk operations (like mass imports or ingestion).

As `PricingDirect` adds bulk-upload workflows via CSV, these calculations should be extracted into a standalone Domain Service (e.g., `services.pricing_calculator.py`) that DRF Serializers and ingestion tasks call explicitly before persisting records. Calculated outputs must remain strictly read-only on the frontend.
