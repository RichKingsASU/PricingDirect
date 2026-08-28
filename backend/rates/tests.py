from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from .models import CustomerRateLane
from customers.models import Organization

class CustomerRateLaneTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name='Test Org')
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.org.users.add(self.user)
        self.client.login(username='testuser', password='password123')
        
        self.lane = CustomerRateLane.objects.create(
            organization=self.org,
            lane_id='TEST-001',
            customer_name='Test Customer',
            origin_city='Oakland',
            origin_state='CA',
            raw_origin='Oakland, CA',
            destination_city='Sacramento',
            destination_state='CA',
            raw_destination='Sacramento, CA',
            base_rate=720.00,
            equipment='53ft Dry Van',
            service_type='Regional',
            miles=88,
            status='AWARDED',
            active_state='Active',
            effective_date='2026-07-01',
            expiration_date='2027-07-01',
            fuel_surcharge_percent=14.5,
            fuel_amount=104.40,
            total_billing=824.40
        )

    def test_model_creation(self):
        self.assertEqual(CustomerRateLane.objects.count(), 1)
        self.assertEqual(self.lane.customer_name, 'Test Customer')

    def test_rate_directory_view(self):
        response = self.client.get(reverse('rate_directory'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Customer')
        self.assertContains(response, 'TEST-001')

    def test_add_rate_lane_post(self):
        response = self.client.post(reverse('add_rate_lane'), {
            'lane_id': 'TEST-002',
            'customer_name': 'New Customer',
            'origin_city': 'Los Angeles',
            'origin_state': 'CA',
            'destination_city': 'Phoenix',
            'destination_state': 'AZ',
            'base_rate': 1450.00,
            'miles': 372,
            'equipment': '53ft Dry Van',
            'service_type': 'Standard'
        })
        self.assertEqual(response.status_code, 302) # Redirects to directory
        self.assertEqual(CustomerRateLane.objects.count(), 2)
        new_lane = CustomerRateLane.objects.get(lane_id='TEST-002')
        self.assertEqual(new_lane.customer_name, 'New Customer')
        # Check pricing calculation in the view
        # 1450 * 1.145 = 1660.25
        self.assertAlmostEqual(float(new_lane.total_billing), 1660.25)
