import json
from decimal import Decimal
from datetime import date
from django.test import TestCase, Client
from django.contrib.auth.models import User
from customers.models import Organization
from rates.models import CustomerRateLane

class RatesLanesAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user('user1', 'u1@test.com', 'pass')
        self.user2 = User.objects.create_user('user2', 'u2@test.com', 'pass')

        self.org1 = Organization.objects.create(name='Org 1')
        self.org2 = Organization.objects.create(name='Org 2')

        self.user1.organizations.add(self.org1)
        self.user2.organizations.add(self.org2)

        self.lane1 = CustomerRateLane.objects.create(
            organization=self.org1,
            lane_id='L1',
            customer_name='Cust 1',
            origin_city='City A',
            origin_state='CA',
            raw_origin='City A, CA',
            destination_city='City B',
            destination_state='NY',
            raw_destination='City B, NY',
            base_rate=Decimal('100.50'),
            equipment='V',
            service_type='S',
            miles=500,
            status='AWARDED',
            active_state='Active',
            effective_date=date(2026, 1, 1),
            expiration_date=date(2026, 12, 31),
            fuel_surcharge_percent=Decimal('10.00'),
            fuel_amount=Decimal('10.05'),
            total_billing=Decimal('110.55')
        )
        self.lane2 = CustomerRateLane.objects.create(
            organization=self.org2,
            lane_id='L2',
            customer_name='Cust 2',
            origin_city='City C',
            origin_state='TX',
            raw_origin='City C, TX',
            destination_city='City D',
            destination_state='FL',
            raw_destination='City D, FL',
            base_rate=Decimal('200.00'),
            equipment='F',
            service_type='S',
            miles=600,
            status='SPOT',
            active_state='Active',
            effective_date=date(2026, 1, 1),
            expiration_date=date(2026, 12, 31),
            fuel_surcharge_percent=Decimal('20.00'),
            fuel_amount=Decimal('40.00'),
            total_billing=Decimal('240.00')
        )

    def test_unauthenticated_access(self):
        response = self.client.get('/rates/api/rates/lanes/')
        self.assertEqual(response.status_code, 401)

    def test_tenant_isolation(self):
        self.client.login(username='user1', password='pass')
        response = self.client.get('/rates/api/rates/lanes/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L1')
        self.assertEqual(data['results'][0]['organization_id'], str(self.org1.id))
        
        self.client.login(username='user2', password='pass')
        response = self.client.get('/rates/api/rates/lanes/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L2')

    def test_response_contract(self):
        self.client.login(username='user1', password='pass')
        response = self.client.get('/rates/api/rates/lanes/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        result = data['results'][0]
        
        # Verify decimal serialization and field existence
        self.assertEqual(result['base_rate'], '100.50')
        self.assertEqual(result['fuel_surcharge_percent'], '10.00')
        self.assertEqual(result['fuel_amount'], '10.05')
        self.assertEqual(result['total_billing'], '110.55')
        
        # Verify strings and dates
        self.assertEqual(result['customer_name'], 'Cust 1')
        self.assertEqual(result['effective_date'], '2026-01-01')
        self.assertEqual(result['id'], str(self.lane1.id))
