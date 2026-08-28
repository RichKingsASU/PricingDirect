with open('tests/test_rates_api.py', 'r') as f:
    content = f.read()

content = content.replace(
    'def test_invalid_limit(self):\n        res = self.client_a.get(' + "'/api/rates/lanes/?limit=abc')" + '\n        self.assertEqual(res.status_code, 200) # gracefully normalized',
    'def test_invalid_limit(self):\n        res = self.client_a.get(' + "'/api/rates/lanes/?limit=abc')" + '\n        self.assertEqual(res.status_code, 400)'
)

content = content.replace(
    'def test_invalid_offset(self):\n        res = self.client_a.get(' + "'/api/rates/lanes/?offset=abc')" + '\n        self.assertEqual(res.status_code, 200) # gracefully normalized',
    'def test_invalid_offset(self):\n        res = self.client_a.get(' + "'/api/rates/lanes/?offset=abc')" + '\n        self.assertEqual(res.status_code, 400)'
)

with open('tests/test_rates_api.py', 'w') as f:
    f.write(content)
