from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from pricing.models import MarketSummary, LaneException
from customers.models import Organization

class ControlTowerViewTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name='Test Org')
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.org.users.add(self.user)
        self.client.login(username='testuser', password='password123')

        MarketSummary.objects.create(
            organization=self.org,
            name='Test Market',
            region='NW',
            avg_actual=1000,
            avg_target=900,
            variance_dollars=100,
            variance_percent=11.1,
            loads=50,
            trend_status='Increasing',
            status='Target Variance High'
        )

        LaneException.objects.create(
            organization=self.org,
            origin='Seattle',
            destination='Portland',
            market='NW',
            loads=10,
            current_target=800,
            avg_actual=800,
            var_dollars=0,
            var_percent=0,
            confidence='High',
            impact='Low'
        )
        
        LaneException.objects.create(
            organization=self.org,
            origin='Seattle',
            destination='Spokane',
            market='NW',
            loads=5,
            current_target=1000,
            avg_actual=1030,
            var_dollars=30,
            var_percent=3.0,
            confidence='High',
            impact='Medium'
        )

    def test_control_tower_view(self):
        response = self.client.get(reverse('control_tower'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Target Control Tower')
        self.assertContains(response, 'Test Market')
        self.assertContains(response, 'Seattle → Portland')
        
        # Check KPI values
        # 10 loads at/under (var=0)
        # 5 loads 0-5% over (var=3.0)
        self.assertEqual(response.context['kpis']['atUnderTarget'], 10)
        self.assertEqual(response.context['kpis']['overTarget0to5'], 5)

    def test_control_tower_filters(self):
        # filter by kpi
        response = self.client.get(reverse('control_tower'), {'kpi': 'atUnderTarget'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['exceptions']), 1)
        self.assertEqual(response.context['exceptions'][0].destination, 'Portland')

    def test_data_management_view(self):
        response = self.client.get(reverse('data_management'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Data Management')

    def test_data_management_tabs(self):
        response = self.client.get(reverse('data_management'), {'tab': 'lanes'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['tab'], 'lanes')

    def test_edit_exception_view(self):
        exc = LaneException.objects.first()
        response = self.client.get(reverse('edit_exception', args=[exc.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Edit Exception')

