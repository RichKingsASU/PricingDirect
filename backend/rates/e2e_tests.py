import os
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from django.contrib.auth.models import User
from rates.models import CustomerRateLane
from pricing.models import LaneException, PricingAdjustment, MarketSummary
from customers.models import Organization

class PricingLogisticsE2ETests(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        cls.selenium = webdriver.Chrome(options=options)
        cls.selenium.implicitly_wait(5)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def setUp(self):
        self.selenium.delete_all_cookies()
        self.org = Organization.objects.create(name='Test Org')
        self.user = User.objects.create_user(username='test_pricing', password='AppPassword123!')
        self.org.users.add(self.user)
        self.lane = CustomerRateLane.objects.create(
            organization=self.org,
            lane_id='E2E-001',
            customer_name='E2E Customer',
            origin_city='Seattle',
            origin_state='WA',
            destination_city='Portland',
            destination_state='OR',
            base_rate=500.00,
            equipment='53ft Dry Van',
            service_type='Standard',
            miles=173,
            effective_date='2026-07-01',
            expiration_date='2027-07-01',
            fuel_surcharge_percent=14.5,
            fuel_amount=72.50,
            total_billing=572.50
        )
        self.market = MarketSummary.objects.create(
            organization=self.org,
            name='NW Market',
            region='NW',
            avg_actual=500.0,
            avg_target=450.0,
            variance_dollars=50.0,
            variance_percent=11.1,
            loads=10,
            trend_status='Stable',
            status='Active'
        )

    def login(self):
        self.selenium.get(f"{self.live_server_url}/accounts/login/")
        self.selenium.find_element(By.NAME, "username").send_keys("test_pricing")
        self.selenium.find_element(By.NAME, "password").send_keys("AppPassword123!")
        self.selenium.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        WebDriverWait(self.selenium, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "top-nav"))
        )

    def test_01_login_logout(self):
        self.login()
        self.assertIn("test_pricing", self.selenium.page_source)
        # Logout using the form button reliably
        self.selenium.find_element(By.XPATH, "//button[contains(text(), 'Logout')]").click()
        import time; time.sleep(1)
        # Try to access a protected page
        self.selenium.get(f"{self.live_server_url}/rates/")
        # Should redirect to login
        self.assertIn("login", self.selenium.current_url)

    def test_02_rate_directory(self):
        self.login()
        self.selenium.get(f"{self.live_server_url}/rates/")
        self.assertIn("E2E Customer", self.selenium.page_source)
        self.assertIn("Seattle, WA", self.selenium.page_source)

    def test_03_create_lane(self):
        self.login()
        self.selenium.get(f"{self.live_server_url}/rates/add/")
        
        lane_id_input = self.selenium.find_element(By.NAME, "lane_id")
        lane_id_input.clear()
        lane_id_input.send_keys("NEW-LANE")
        
        customer_name_input = self.selenium.find_element(By.NAME, "customer_name")
        customer_name_input.clear()
        customer_name_input.send_keys("New Corp")
        
        origin_input = self.selenium.find_element(By.NAME, "origin_city")
        origin_input.clear()
        origin_input.send_keys("Los Angeles")
        
        dest_input = self.selenium.find_element(By.NAME, "destination_city")
        dest_input.clear()
        dest_input.send_keys("Las Vegas")
        
        base_rate_input = self.selenium.find_element(By.NAME, "base_rate")
        base_rate_input.clear()
        base_rate_input.send_keys("800")
        
        miles_input = self.selenium.find_element(By.NAME, "miles")
        miles_input.clear()
        miles_input.send_keys("270")
        
        current_url = self.selenium.current_url
        self.selenium.find_element(By.XPATH, "//button[contains(text(), 'Save Rate Lane')]").click()
        
        try:
            WebDriverWait(self.selenium, 5).until(
                EC.url_changes(current_url)
            )
        except Exception as e:
            print("\n!!! TEST 03 TIMEOUT !!!")
            print("URL:", self.selenium.current_url)
            print("SOURCE:", self.selenium.page_source)
            raise e
        self.assertIn("NEW-LANE", self.selenium.page_source)

    def test_04_edit_lane(self):
        self.login()
        self.selenium.get(f"{self.live_server_url}/pricing/data-management/lane/{self.lane.id}/edit/")
        base_rate_input = self.selenium.find_element(By.NAME, "base_rate")
        base_rate_input.clear()
        base_rate_input.send_keys("600")
        
        # Fill raw_origin and raw_destination which are required by ModelForm
        self.selenium.find_element(By.NAME, "raw_origin").send_keys("Seattle")
        self.selenium.find_element(By.NAME, "raw_destination").send_keys("Portland")
        
        self.selenium.find_element(By.XPATH, "//button[contains(text(), 'Save Changes')]").click()
        
        WebDriverWait(self.selenium, 5).until(
            EC.url_contains("tab=lanes")
        )
            
        self.lane.refresh_from_db()
        self.assertEqual(float(self.lane.base_rate), 600.0)

    def test_05_target_pay(self):
        self.login()
        self.selenium.get(f"{self.live_server_url}/rates/")
        # Target lookup
        self.selenium.find_element(By.NAME, "origin").send_keys("Seattle")
        self.selenium.find_element(By.NAME, "dest").send_keys("Portland")
        self.selenium.find_element(By.NAME, "miles").send_keys("173")
        self.selenium.find_element(By.XPATH, "//button[contains(text(), 'Search Target')]").click()
        
        WebDriverWait(self.selenium, 5).until(
            EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), '$977')]"))
        )
        self.assertIn("$977", self.selenium.page_source)

    def test_06_pricing_adjustment(self):
        self.login()
        # Add adjustment via data management is complex, let's create it via ORM and verify it shows up
        PricingAdjustment.objects.create(
            organization=self.org,
            title='E2E Adjustment',
            change_percent=5.0,
            status='Pending Approval',
            effective_date='2026-08-01'
        )
        self.selenium.get(f"{self.live_server_url}/pricing/data-management/?tab=adjustments")
        self.assertIn("Pending Approval", self.selenium.page_source)

    def test_07_lane_exception(self):
        self.login()
        LaneException.objects.create(
            organization=self.org,
            origin='Seattle',
            destination='Portland',
            market='NW',
            loads=5,
            current_target=500.0,
            avg_actual=550.0,
            var_dollars=50.0,
            var_percent=10.0,
            confidence='High',
            impact='High',
            adjustment_status='Pending'
        )
        self.selenium.get(f"{self.live_server_url}/pricing/control-tower/")
        self.assertIn("Seattle", self.selenium.page_source)
        self.assertIn("Portland", self.selenium.page_source)

    def test_08_control_tower_filter(self):
        self.login()
        self.selenium.get(f"{self.live_server_url}/pricing/control-tower/?region=NW")
        self.assertIn("NW", self.selenium.page_source)

    def test_09_invalid_data(self):
        self.login()
        self.selenium.get(f"{self.live_server_url}/rates/add/")
        # Try to submit empty form
        self.selenium.find_element(By.XPATH, "//button[contains(text(), 'Save Rate Lane')]").click()
        # Should stay on page due to HTML5 validation
        self.assertIn("add_road", self.selenium.page_source)

    def test_10_cross_module_flow(self):
        self.login()
        # View rates
        self.selenium.get(f"{self.live_server_url}/rates/")
        self.assertIn("E2E Customer", self.selenium.page_source)
        # Add exception
        LaneException.objects.create(
            organization=self.org,
            origin='Seattle',
            destination='Portland',
            market='NW',
            loads=2,
            current_target=500.0,
            avg_actual=550.0,
            var_dollars=50.0,
            var_percent=10.0,
            confidence='High',
            impact='High',
            adjustment_status='Pending'
        )
        # View Control Tower
        self.selenium.get(f"{self.live_server_url}/pricing/control-tower/")
        self.assertIn("Seattle", self.selenium.page_source)
        self.assertIn("Portland", self.selenium.page_source)
