from django.test import TestCase
from pricing.services.target_pricing import calculate_target_pay, calculate_total_billing

class TargetPricingTests(TestCase):
    def test_calculate_target_pay_short_haul(self):
        # max(350, 320 + miles * 3.8) -> 320 + 0 = 320 -> floor of 350
        self.assertEqual(calculate_target_pay(0), 350)
        self.assertEqual(calculate_target_pay(5), 350)
        
        # 320 + 7.89 * 3.8 = 320 + 29.982 = 349.982 -> round to 350, floor 350
        self.assertEqual(calculate_target_pay(7.89), 350)

    def test_calculate_target_pay_crossing_floor(self):
        # floor crossing at 320 + m*3.8 = 350 => m = 30 / 3.8 = 7.8947...
        # m = 8 => 320 + 30.4 = 350.4 => round 350
        self.assertEqual(calculate_target_pay(8), 350)
        
        # m = 10 => 320 + 38 = 358
        self.assertEqual(calculate_target_pay(10), 358)

    def test_calculate_target_pay_normal_lane(self):
        # m = 100 => 320 + 380 = 700
        self.assertEqual(calculate_target_pay(100), 700)
        # m = 500 => 320 + 1900 = 2220
        self.assertEqual(calculate_target_pay(500), 2220)

    def test_calculate_target_pay_edge_cases(self):
        self.assertEqual(calculate_target_pay(-10), 350)
        self.assertEqual(calculate_target_pay(None), 350)
        
        # string representation of number
        self.assertEqual(calculate_target_pay("200"), 1080)

    def test_calculate_total_billing(self):
        # 1000 * 1.15 = 1150
        self.assertEqual(calculate_total_billing(1000, 15), 1150.0)
        
        # negative test cases fallback to 0
        self.assertEqual(calculate_total_billing(-10, -5), 0.0)
        self.assertEqual(calculate_total_billing(None, None), 0.0)
