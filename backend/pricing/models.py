from django.db import models
from django.contrib.auth.models import User
from customers.models import Organization

class MarketSummary(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, default=None, null=True)
    organization = models.ForeignKey('customers.Organization', on_delete=models.CASCADE, related_name='market_summaries', null=True)
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=10)
    avg_actual = models.DecimalField(max_digits=10, decimal_places=2)
    avg_target = models.DecimalField(max_digits=10, decimal_places=2)
    variance_dollars = models.DecimalField(max_digits=10, decimal_places=2)
    variance_percent = models.DecimalField(max_digits=5, decimal_places=2)
    loads = models.IntegerField()
    trend_status = models.CharField(max_length=50)
    status = models.CharField(max_length=50)



    def __str__(self):
        return self.name


class LaneException(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, default=None, null=True)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    market = models.CharField(max_length=10)
    loads = models.IntegerField()
    current_target = models.DecimalField(max_digits=10, decimal_places=2)
    avg_actual = models.DecimalField(max_digits=10, decimal_places=2)
    var_dollars = models.DecimalField(max_digits=10, decimal_places=2)
    var_percent = models.DecimalField(max_digits=5, decimal_places=2)
    confidence = models.CharField(max_length=20)
    impact = models.CharField(max_length=20)
    adjustment_status = models.CharField(max_length=50, null=True, blank=True)
    last_adjusted_target = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    adjusted_date = models.DateField(null=True, blank=True)
    adjusted_notes = models.TextField(null=True, blank=True)



    def __str__(self):
        return f"{self.origin} to {self.destination} Exception"


class PricingAdjustment(models.Model):
    organization = models.ForeignKey('customers.Organization', on_delete=models.CASCADE, related_name='pricing_adjustments', null=True)
    title = models.CharField(max_length=200)
    change_percent = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=50)
    effective_date = models.DateField()
    notes = models.TextField(null=True, blank=True)



    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(change_percent__gte=-100), name='pricing_change_percent_min'),
        ]

    def __str__(self):
        return self.title
