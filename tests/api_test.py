import sys
sys.path.append('/Users/nicenaito/cinenaito/cinenaito')
import unittest
from app import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.url = 'http://127.0.0.1:5000/api/v1/theaters'

    def test_get_nearby_theaters(self):
        # 正常系のテスト
        params = {'latitude': 35.6895, 'longitude': 139.6917}
        response = self.app.get(self.url, query_string=params)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        for theater in data:
            self.assertIsInstance(theater, dict)
            self.assertIn('name', theater)
            self.assertIn('address', theater)
            self.assertIn('latitude', theater)
            self.assertIn('longitude', theater)

        # 緯度経度が指定されていない場合のテスト
        response = self.app.get(self.url)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)

    # その他のテストケースを追加する

if __name__ == '__main__':
    unittest.main()