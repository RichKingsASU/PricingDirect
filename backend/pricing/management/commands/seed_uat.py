from django.core.management.base import BaseCommand
from rates.models import CustomerRateLane
from pricing.models import MarketSummary, LaneException, PricingAdjustment
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Seeds deterministic UAT data for testing.'

    def handle(self, *args, **options):
        from django.conf import settings
        
        if not settings.DEBUG and 'test' not in settings.DATABASES['default']['NAME'] and 'dev' not in settings.DATABASES['default']['NAME']:
            self.stderr.write(self.style.ERROR('Cannot run seed_uat against production database!'))
            return

        self.stdout.write("Starting UAT data seed...")

        # Clear existing
        CustomerRateLane.objects.all().delete()
        MarketSummary.objects.all().delete()
        LaneException.objects.all().delete()
        PricingAdjustment.objects.all().delete()

        # Users
        if not User.objects.filter(username='uat_user').exists():
            uat_user = User.objects.create_user('uat_user', password='UatPassword123!')
        else:
            uat_user = User.objects.get(username='uat_user')

        # 1. Lanes
        CustomerRateLane.objects.create(
            lane_id='UAT-LANE-01',
            customer_name='Acme Corp',
            origin_city='Seattle',
            origin_state='WA',
            destination_city='Portland',
            destination_state='OR',
            base_rate=500.0,
            equipment='53ft Dry Van',
            service_type='Standard',
            miles=173,
            effective_date='2026-01-01',
            expiration_date='2026-12-31',
            fuel_surcharge_percent=14.5,
            fuel_amount=72.50,
            total_billing=572.50,
            created_by=uat_user,
            updated_by=uat_user
        )

        CustomerRateLane.objects.create(
            lane_id='UAT-LANE-02',
            customer_name='Globex',
            origin_city='Los Angeles',
            origin_state='CA',
            destination_city='Las Vegas',
            destination_state='NV',
            base_rate=800.0,
            equipment='53ft Dry Van',
            service_type='Standard',
            miles=270,
            effective_date='2026-01-01',
            expiration_date='2026-12-31',
            fuel_surcharge_percent=14.5,
            fuel_amount=116.0,
            total_billing=916.0,
            created_by=uat_user,
            updated_by=uat_user
        )

        # 2. Market Summaries
        MarketSummary.objects.create(
            name='Pacific Northwest',
            region='NW',
            avg_actual=550.0,
            avg_target=500.0,
            variance_dollars=50.0,
            variance_percent=10.0,
            loads=45,
            trend_status='Up',
            status='Active',
            created_by=uat_user,
            updated_by=uat_user
        )

        MarketSummary.objects.create(
            name='Southwest',
            region='SW',
            avg_actual=800.0,
            avg_target=825.0,
            variance_dollars=-25.0,
            variance_percent=-3.03,
            loads=120,
            trend_status='Stable',
            status='Active',
            created_by=uat_user,
            updated_by=uat_user
        )

        # 3. Exceptions
        LaneException.objects.create(
            origin='Seattle',
            destination='Portland',
            market='NW',
            loads=15,
            current_target=500.0,
            avg_actual=550.0,
            var_dollars=50.0,
            var_percent=10.0,
            confidence='High',
            impact='Medium',
            adjustment_status='Pending',
            created_by=uat_user,
            updated_by=uat_user
        )

        # 4. Adjustments
        PricingAdjustment.objects.create(
            title='NW Fuel Surge',
            change_percent=5.0,
            status='Pending Approval',
            effective_date='2026-08-01',
            notes='Fuel surge in NW requires 5% target bump.',
            created_by=uat_user,
            updated_by=uat_user
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded UAT data.'))
