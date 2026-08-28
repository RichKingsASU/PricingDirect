import os
import uuid
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.contrib.auth.models import User
from customers.models import Organization
from rates.models import CustomerRateLane
import datetime

class Command(BaseCommand):
    help = 'Seeds local database with synthetic review data for tenant isolation testing.'

    def add_arguments(self, parser):
        parser.add_argument('--confirm', action='store_true', help='Confirm execution')

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Refusing to run: DEBUG is not True.")
            
        db_name = settings.DATABASES['default']['NAME']
        if 'prod' in db_name.lower():
            raise CommandError("Refusing to run: Database name looks like production.")
            
        if not options['confirm']:
            raise CommandError("Refusing to run: Must supply --confirm flag.")

        password = os.environ.get('REVIEW_USER_PASSWORD')
        if not password:
            raise CommandError("Refusing to run: REVIEW_USER_PASSWORD environment variable not set.")

        self.stdout.write("Seeding synthetic data...")

        # Create Orgs
        org_a, _ = Organization.objects.get_or_create(name='Synthetic Org A')
        org_b, _ = Organization.objects.get_or_create(name='Synthetic Org B')

        # Create Users
        user_a, created = User.objects.get_or_create(username='user_a', defaults={'email': 'user_a@example.com'})
        if created:
            user_a.set_password(password)
            user_a.save()
            org_a.users.add(user_a)

        user_b, created = User.objects.get_or_create(username='user_b', defaults={'email': 'user_b@example.com'})
        if created:
            user_b.set_password(password)
            user_b.save()
            org_b.users.add(user_b)

        # Create Lanes
        today = datetime.date.today()
        future = today + datetime.timedelta(days=365)
        
        CustomerRateLane.objects.get_or_create(
            lane_id='SYN-A-1',
            defaults={
                'organization': org_a,
                'customer_name': 'Synthetic Customer A',
                'origin_city': 'Phoenix',
                'origin_state': 'AZ',
                'raw_origin': 'Phoenix, AZ',
                'destination_city': 'Los Angeles',
                'destination_state': 'CA',
                'raw_destination': 'Los Angeles, CA',
                'base_rate': 1000.00,
                'equipment': 'Van',
                'service_type': 'Standard',
                'miles': 372,
                'effective_date': today,
                'expiration_date': future,
                'fuel_surcharge_percent': 10.0,
            }
        )

        CustomerRateLane.objects.get_or_create(
            lane_id='SYN-B-1',
            defaults={
                'organization': org_b,
                'customer_name': 'Synthetic Customer B',
                'origin_city': 'Dallas',
                'origin_state': 'TX',
                'raw_origin': 'Dallas, TX',
                'destination_city': 'Houston',
                'destination_state': 'TX',
                'raw_destination': 'Houston, TX',
                'base_rate': 800.00,
                'equipment': 'Reefer',
                'service_type': 'Expedited',
                'miles': 239,
                'effective_date': today,
                'expiration_date': future,
                'fuel_surcharge_percent': 12.0,
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded synthetic review data.'))
