from decimal import Decimal, ROUND_HALF_UP

from django.db import models
from django.contrib.auth.models import User
from customers.models import Organization

class CustomerRateLane(models.Model):
    STATUS_CHOICES = [
        ('AWARDED', 'AWARDED'),
        ('BACKUP', 'BACKUP'),
        ('SPOT', 'SPOT'),
    ]
    ACTIVE_STATE_CHOICES = [
        ('Active', 'Active'),
        ('Future', 'Future'),
        ('Expired', 'Expired'),
    ]

    organization = models.ForeignKey('customers.Organization', on_delete=models.CASCADE, related_name='rate_lanes', null=True)
    lane_id = models.CharField(max_length=100, unique=True)
    customer_name = models.CharField(max_length=200)
    
    origin_city = models.CharField(max_length=100)
    origin_state = models.CharField(max_length=2)
    raw_origin = models.CharField(max_length=200)
    
    destination_city = models.CharField(max_length=100)
    destination_state = models.CharField(max_length=2)
    raw_destination = models.CharField(max_length=200)
    
    base_rate = models.DecimalField(max_digits=10, decimal_places=2)
    equipment = models.CharField(max_length=100)
    service_type = models.CharField(max_length=100)
    miles = models.IntegerField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AWARDED')
    active_state = models.CharField(max_length=20, choices=ACTIVE_STATE_CHOICES, default='Active')
    
    effective_date = models.DateField()
    expiration_date = models.DateField()
    review_date = models.DateField(null=True, blank=True)
    
    fuel_surcharge_percent = models.DecimalField(max_digits=5, decimal_places=2)
    fuel_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_billing = models.DecimalField(max_digits=10, decimal_places=2)
    

    
    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(base_rate__gte=0), name='rates_base_rate_non_negative'),
            models.CheckConstraint(condition=models.Q(miles__gte=0), name='rates_miles_non_negative'),
        ]

    def save(self, *args, **kwargs):
        cents = Decimal('0.01')
        base_rate = Decimal(str(self.base_rate))
        fuel_surcharge_percent = Decimal(str(self.fuel_surcharge_percent))
        self.fuel_amount = (base_rate * fuel_surcharge_percent / 100).quantize(cents, rounding=ROUND_HALF_UP)
        self.total_billing = (base_rate + self.fuel_amount).quantize(cents, rounding=ROUND_HALF_UP)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.customer_name}: {self.origin_city} to {self.destination_city}"
