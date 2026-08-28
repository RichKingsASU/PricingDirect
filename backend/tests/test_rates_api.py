import json
from decimal import Decimal
from django.test import TestCase, Client
from customers.models import Organization
from django.contrib.auth.models import User
from rates.models import CustomerRateLane

class CustomerRatesReadOnlyAPITests(TestCase):
    def setUp(self):
        self.org_a = Organization.objects.create(name='Org A')
        self.org_b = Organization.objects.create(name='Org B')
        
        self.user_a = User.objects.create_user(username='usera', password='password')
        self.org_a.users.add(self.user_a)
        
        self.user_b = User.objects.create_user(username='userb', password='password')
        self.org_b.users.add(self.user_b)
        
        self.lane_a1 = CustomerRateLane.objects.create(
            organization=self.org_a, lane_id='L1', customer_name='Synthetic Customer A1',
            origin_city='City A', origin_state='CA', raw_origin='City A, CA', destination_city='City B', destination_state='NY',
            base_rate=Decimal('100.50'), equipment='V', service_type='S', miles=500,
            status='AWARDED', active_state='Active', effective_date='2026-01-01', expiration_date='2026-12-31',
            fuel_surcharge_percent=Decimal('10.00')
        )
        self.lane_a2 = CustomerRateLane.objects.create(
            organization=self.org_a, lane_id='L2', customer_name='Another Cust',
            origin_city='City C', origin_state='TX', destination_city='City D', destination_state='IL',
            base_rate=Decimal('200.00'), equipment='R', service_type='S', miles=1000,
            status='PENDING', active_state='Inactive', effective_date='2026-01-01', expiration_date='2026-12-31',
            fuel_surcharge_percent=Decimal('15.00')
        )
        self.lane_b = CustomerRateLane.objects.create(
            organization=self.org_b, lane_id='L3', customer_name='Synthetic Customer B',
            origin_city='City A', origin_state='CA', raw_origin='City A, CA', destination_city='City B', destination_state='NY',
            base_rate=Decimal('300.00'), equipment='V', service_type='S', miles=500,
            status='AWARDED', active_state='Active', effective_date='2026-01-01', expiration_date='2026-12-31',
            fuel_surcharge_percent=Decimal('10.00')
        )

        self.client_anon = Client()
        self.client_a = Client()
        self.client_a.login(username='usera', password='password')
        self.client_b = Client()
        self.client_b.login(username='userb', password='password')

    def test_anonymous_401(self):
        res = self.client_anon.get('/api/rates/lanes/')
        self.assertEqual(res.status_code, 401)

    def test_authenticated_succeeds(self):
        res = self.client_a.get('/api/rates/lanes/')
        self.assertEqual(res.status_code, 200)

    def test_correct_org_records_returned(self):
        res = self.client_a.get('/api/rates/lanes/')
        data = res.json()
        self.assertEqual(data['count'], 2)
        lane_ids = [r['lane_id'] for r in data['results']]
        self.assertIn('L1', lane_ids)
        self.assertIn('L2', lane_ids)
        self.assertNotIn('L3', lane_ids)

    def test_cross_tenant_excluded(self):
        res = self.client_b.get('/api/rates/lanes/')
        data = res.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L3')

    def test_org_id_bypass_fails(self):
        res = self.client_a.get(f'/api/rates/lanes/?organization_id={self.org_b.id}')
        data = res.json()
        self.assertEqual(data['count'], 2) # Should ignore the param and return org A

    def test_search_excludes_cross_tenant(self):
        res = self.client_a.get('/api/rates/lanes/?customer_name=Synthetic Customer B')
        data = res.json()
        self.assertEqual(data['count'], 0)

    def test_pagination_limit(self):
        res = self.client_a.get('/api/rates/lanes/?limit=1')
        data = res.json()
        self.assertEqual(data['count'], 2)
        self.assertEqual(len(data['results']), 1)

    def test_pagination_offset(self):
        res = self.client_a.get('/api/rates/lanes/?limit=1&offset=1')
        data = res.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L2') # assuming ordered by effective_date then pk

    def test_limit_max_100(self):
        res = self.client_a.get('/api/rates/lanes/?limit=200')
        data = res.json()
        self.assertLessEqual(len(data['results']), 100) # Though we only have 2, it shouldn't error

    def test_invalid_limit(self):
        res = self.client_a.get('/api/rates/lanes/?limit=abc')
        self.assertEqual(res.status_code, 400)

    def test_invalid_offset(self):
        res = self.client_a.get('/api/rates/lanes/?offset=abc')
        self.assertEqual(res.status_code, 400)

    def test_empty_results(self):
        res = self.client_a.get('/api/rates/lanes/?customer_name=Nonexistent')
        data = res.json()
        self.assertEqual(data['count'], 0)
        self.assertEqual(data['results'], [])

    def test_search_customer_name(self):
        res = self.client_a.get('/api/rates/lanes/?customer_name=Synthetic')
        data = res.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L1')

    def test_filter_origin_city(self):
        res = self.client_a.get('/api/rates/lanes/?origin_city=City A')
        data = res.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L1')

    def test_filter_dest_city(self):
        res = self.client_a.get('/api/rates/lanes/?destination_city=City D')
        data = res.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L2')

    def test_filter_active_state(self):
        res = self.client_a.get('/api/rates/lanes/?active_state=Inactive')
        data = res.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L2')

    def test_filter_status(self):
        res = self.client_a.get('/api/rates/lanes/?status=AWARDED')
        data = res.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['lane_id'], 'L1')

    def test_ordering(self):
        res = self.client_a.get('/api/rates/lanes/?ordering=-base_rate')
        data = res.json()
        self.assertEqual(data['results'][0]['lane_id'], 'L2')
        self.assertEqual(data['results'][1]['lane_id'], 'L1')

    def test_disallowed_ordering(self):
        res = self.client_a.get('/api/rates/lanes/?ordering=secret_field')
        self.assertEqual(res.status_code, 200) # gracefully normalized

    def test_decimal_is_string(self):
        res = self.client_a.get('/api/rates/lanes/')
        data = res.json()
        self.assertIsInstance(data['results'][0]['base_rate'], str)
        self.assertEqual(data['results'][0]['base_rate'], '100.50')

    def test_calculated_fields(self):
        res = self.client_a.get('/api/rates/lanes/')
        data = res.json()
        for row in data['results']:
            if row['lane_id'] == 'L1':
                self.assertEqual(row['raw_origin'], 'City A, CA')
                self.assertEqual(row['fuel_amount'], '10.05')
                self.assertEqual(row['total_billing'], '110.55')

    def test_post_rejected(self):
        res = self.client_a.post('/api/rates/lanes/')
        self.assertEqual(res.status_code, 405)

    def test_put_rejected(self):
        res = self.client_a.put('/api/rates/lanes/')
        self.assertEqual(res.status_code, 405)

    def test_patch_rejected(self):
        res = self.client_a.patch('/api/rates/lanes/')
        self.assertEqual(res.status_code, 405)

    def test_delete_rejected(self):
        res = self.client_a.delete('/api/rates/lanes/')
        self.assertEqual(res.status_code, 405)
