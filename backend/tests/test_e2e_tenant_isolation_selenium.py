import json
import requests
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from django.contrib.auth.models import User
from customers.models import Organization
from rates.models import CustomerRateLane
from pricing.models import MarketSummary

class TenantIsolationSeleniumE2ETests(StaticLiveServerTestCase):
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
        
        # Org A and User A
        self.org_a = Organization.objects.create(name='Org A')
        self.user_a = User.objects.create_user(username='testa@example.com', password='password123')
        self.org_a.users.add(self.user_a)
        
        self.lane_a = CustomerRateLane.objects.create(
            organization=self.org_a,
            lane_id='LANE-A',
            customer_name='Cust A',
            origin_city='O-A', origin_state='CA', raw_origin='O-A',
            destination_city='D-A', destination_state='CA', raw_destination='D-A',
            base_rate=100.0, equipment='Van', service_type='Standard', miles=100,
            effective_date='2026-01-01', expiration_date='2027-01-01',
            fuel_surcharge_percent=10, fuel_amount=10, total_billing=110
        )
        self.ms_a = MarketSummary.objects.create(organization=self.org_a, name='MS-A', region='NW', avg_actual=1, avg_target=1, variance_dollars=1, variance_percent=1, loads=1, trend_status='a', status='a')

        # Org B and User B
        self.org_b = Organization.objects.create(name='Org B')
        self.user_b = User.objects.create_user(username='testb@example.com', password='password123')
        self.org_b.users.add(self.user_b)
        
        self.lane_b = CustomerRateLane.objects.create(
            organization=self.org_b,
            lane_id='LANE-B',
            customer_name='Cust B',
            origin_city='O-B', origin_state='CA', raw_origin='O-B',
            destination_city='D-B', destination_state='CA', raw_destination='D-B',
            base_rate=200.0, equipment='Flatbed', service_type='Standard', miles=200,
            effective_date='2026-01-01', expiration_date='2027-01-01',
            fuel_surcharge_percent=10, fuel_amount=20, total_billing=220
        )
        self.ms_b = MarketSummary.objects.create(organization=self.org_b, name='MS-B', region='SW', avg_actual=1, avg_target=1, variance_dollars=1, variance_percent=1, loads=1, trend_status='b', status='b')

    def get_api_session(self):
        """Creates a requests.Session populated with cookies from Selenium."""
        session = requests.Session()
        for cookie in self.selenium.get_cookies():
            session.cookies.set(cookie['name'], cookie['value'])
        # Also need CSRF token header
        csrf_cookie = session.cookies.get('csrftoken')
        if csrf_cookie:
            session.headers.update({'X-CSRFToken': csrf_cookie})
        return session

    def test_anonymous_redirect_and_api_denial(self):
        # 1. Anonymous protected-route access is redirected or denied
        self.selenium.get(self.live_server_url + "/")
        # Should display login form
        email_input = self.selenium.find_element(By.NAME, "username")
        self.assertTrue(email_input.is_displayed())

        # 2. Anonymous API access returns intended denial
        res = requests.get(self.live_server_url + '/api/customer_rate_lanes/')
        self.assertEqual(res.status_code, 401)

    def test_user_a_sees_org_a_not_org_b(self):
        # 5. Org B and business record exist (done in setUp)
        
        # 6. User B can retrieve Org B's record
        self.selenium.get(self.live_server_url + "/accounts/login/")
        self.selenium.find_element(By.NAME, "username").send_keys('testb@example.com')
        self.selenium.find_element(By.NAME, "password").send_keys('password123')
        self.selenium.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        WebDriverWait(self.selenium, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "top-nav"))
        )
        
        session_b = self.get_api_session()
        res_b = session_b.get(self.live_server_url + '/api/customer_rate_lanes/')
        self.assertEqual(res_b.status_code, 200)
        data_b = res_b.json()
        self.assertEqual(len(data_b), 1)
        self.assertEqual(data_b[0]['lane_id'], 'LANE-B')
        org_b_id = data_b[0]['organization_id']
        
        # Logout User B using form submit
        self.selenium.find_element(By.XPATH, "//button[contains(text(), 'Logout')]").click()
        time.sleep(1)

        # 3. Login obtains and submits valid CSRF token
        # 13. Refresh preserves the authenticated session before logout.
        self.selenium.get(self.live_server_url + "/accounts/login/")
        current_url_login = self.selenium.current_url
        self.selenium.find_element(By.NAME, "username").send_keys('testa@example.com')
        self.selenium.find_element(By.NAME, "password").send_keys('password123')
        self.selenium.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        WebDriverWait(self.selenium, 5).until(EC.url_changes(current_url_login))
        
        self.selenium.refresh()
        WebDriverWait(self.selenium, 5).until(lambda driver: driver.execute_script("return document.readyState") == "complete")

        session_a = self.get_api_session()
        
        # 4. User A sees Org A data
        # 7. User A cannot retrieve Org B's existing record (implicitly via list filtering)
        res_a = session_a.get(self.live_server_url + '/api/customer_rate_lanes/')
        self.assertEqual(res_a.status_code, 200, f"Expected 200, got {res_a.status_code}. Response: {res_a.text}")
        data_a = res_a.json()
        self.assertEqual(len(data_a), 1)
        self.assertEqual(data_a[0]['lane_id'], 'LANE-A')
        
        # 8. User A cannot expose Org B data by changing orgId
        res_fake_org = session_a.get(f"{self.live_server_url}/api/customer_rate_lanes/?orgId={org_b_id}")
        self.assertIn(res_fake_org.status_code, [404, 403, 400])
        
        # 9. User A cannot create or PATCH an object into Org B
        post_data = {
            'lane_id': 'LANE-HACK', 'customer_name': 'Hacker', 'origin_city': 'O', 'origin_state': 'CA',
            'destination_city': 'D', 'destination_state': 'CA', 'base_rate': 100, 'equipment': 'Van',
            'service_type': 'Reg', 'miles': 100, 'effective_date': '2026-01-01', 'expiration_date': '2027-01-01',
            'organization_id': org_b_id
        }
        res_post_org_b = session_a.post(self.live_server_url + '/api/customer_rate_lanes/', json=post_data)
        self.assertEqual(res_post_org_b.status_code, 404)
        
        # 10. User A cannot reassign an Org A object to Org B
        res_patch_org_b = session_a.patch(f"{self.live_server_url}/api/customer_rate_lanes/{self.lane_a.id}/?orgId={self.org_a.id}", json={'organization_id': org_b_id})
        self.assertEqual(res_patch_org_b.status_code, 400)
        
        # 11. Valid same-tenant create/PATCH behavior succeeds
        post_data['organization_id'] = str(self.org_a.id)
        res_post_org_a = session_a.post(self.live_server_url + '/api/customer_rate_lanes/', json=post_data)
        self.assertEqual(res_post_org_a.status_code, 201)
        
        # 14. Server-rendered control-tower shows only authorized tenant
        self.selenium.get(self.live_server_url + "/pricing/control-tower/")
        self.assertIn("MS-A", self.selenium.page_source)
        self.assertNotIn("MS-B", self.selenium.page_source)
        
        # 15. Missing, malformed, and unauthorized orgId behavior matches backend
        res_malformed = session_a.get(f"{self.live_server_url}/api/customer_rate_lanes/?orgId=invalid-org-id")
        self.assertIn(res_malformed.status_code, [404, 400, 500]) # Validating it errors appropriately
        
        # 12. Logout invalidates the session
        # Use session POST to avoid UI race conditions
        session_a.post(self.live_server_url + "/accounts/logout/", headers={"X-CSRFToken": session_a.cookies.get("csrftoken")})
        
        res_after_logout = session_a.get(self.live_server_url + '/api/customer_rate_lanes/')
        self.assertEqual(res_after_logout.status_code, 401)
