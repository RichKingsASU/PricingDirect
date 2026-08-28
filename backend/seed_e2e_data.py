import os
import django
from django.core.management import call_command
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from customers.models import Organization
from rates.models import CustomerRateLane

# Clean up
User.objects.filter(email__in=['testa@example.com', 'testb@example.com']).delete()

# Create Org A
org_a = Organization.objects.create(name="Org A")
user_a = User.objects.create_user('testa', email='testa@example.com', password='password123')
user_a.organizations.add(org_a)

CustomerRateLane.objects.create(
    organization=org_a,
    lane_id='LANE-A',
    customer_name='Cust A',
    base_rate=100.0,
    miles=100
)

# Create Org B
org_b = Organization.objects.create(name="Org B")
user_b = User.objects.create_user('testb', email='testb@example.com', password='password123')
user_b.organizations.add(org_b)

CustomerRateLane.objects.create(
    organization=org_b,
    lane_id='LANE-B',
    customer_name='Cust B',
    base_rate=200.0,
    miles=200
)

print(f"ORG_B_ID={org_b.id}")
