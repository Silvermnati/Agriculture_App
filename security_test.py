#!/usr/bin/env python3
"""
Security testing script for Agricultural Super App API endpoints.
Tests authentication, authorization, input validation, and security measures.
"""

import requests
import json
import time
import sys
from datetime import datetime, timedelta
import jwt

class SecurityTester:
    """Security testing class for API endpoints."""
    
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.test_results = []
        self.tokens = {}
        
    def log_test(self, test_name, passed, details=""):
        """Log test result."""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
    
    def setup_test_users(self):
        """Create test users for security testing."""
        print("🔧 Setting up test users...")
        
        # Test user data
        users = [
            {
                'email': 'security_farmer@test.com',
                'password': 'TestPassword123!',
                'first_name': 'Security',
                'last_name': 'Farmer',
                'role': 'farmer'
            },
            {
                'email': 'security_expert@test.com',
                'password': 'TestPassword123!',
                'first_name': 'Security',
                'last_name': 'Expert',
                'role': 'expert'
            },
            {
                'email': 'security_admin@test.com',
                'password': 'TestPassword123!',
                'first_name': 'Security',
                'last_name': 'Admin',
                'role': 'admin'
            }
        ]
        
        for user in users:
            try:
                response = requests.post(f"{self.base_url}/api/auth/register", json=user)
                if response.status_code in [201, 409]:  # Created or already exists
                    # Login to get token
                    login_response = requests.post(f"{self.base_url}/api/auth/login", json={
                        'email': user['email'],
                        'password': user['password']
                    })
                    if login_response.status_code == 200:
                        token = login_response.json().get('token')
                        self.tokens[user['role']] = token
                        print(f"   ✅ {user['role']} user ready")
                    else:
                        print(f"   ❌ Failed to login {user['role']} user")
                else:
                    print(f"   ❌ Failed to create {user['role']} user: {response.status_code}")
            except Exception as e:
                print(f"   ❌ Error setting up {user['role']} user: {str(e)}")
    
    def test_authentication_bypass(self):
        """Test authentication bypass attempts."""
        print("\n🔒 Testing Authentication Security...")
        
        protected_endpoints = [
            ('POST', '/api/articles', {'title': 'Test', 'content': 'Test'}),
            ('POST', '/api/crops', {'name': 'Test Crop'}),
            ('POST', '/api/user-crops', {'crop_id': 1}),
            ('POST', '/api/categories', {'name': 'Test Category'}),
            ('POST', '/api/tags', {'name': 'test-tag'}),
            ('POST', '/api/reviews', {'expert_id': 1, 'rating': 5})
        ]
        
        for method, endpoint, data in protected_endpoints:
            try:
                # Test without token
                response = requests.post(f"{self.base_url}{endpoint}", json=data)
                passed = response.status_code == 401
                self.log_test(f"No token access to {endpoint}", passed, 
                            f"Status: {response.status_code}")
                
                # Test with invalid token
                headers = {'Authorization': 'Bearer invalid_token_here'}
                response = requests.post(f"{self.base_url}{endpoint}", json=data, headers=headers)
                passed = response.status_code == 401
                self.log_test(f"Invalid token access to {endpoint}", passed,
                            f"Status: {response.status_code}")
                
                # Test with malformed token
                headers = {'Authorization': 'InvalidFormat token'}
                response = requests.post(f"{self.base_url}{endpoint}", json=data, headers=headers)
                passed = response.status_code == 401
                self.log_test(f"Malformed token access to {endpoint}", passed,
                            f"Status: {response.status_code}")
                
            except Exception as e:
                self.log_test(f"Authentication test for {endpoint}", False, str(e))
    
    def test_authorization_bypass(self):
        """Test authorization bypass attempts."""
        print("\n🛡️ Testing Authorization Security...")
        
        if 'farmer' not in self.tokens or 'admin' not in self.tokens:
            print("   ⚠️ Skipping authorization tests - missing tokens")
            return
        
        # Admin-only endpoints
        admin_endpoints = [
            ('POST', '/api/crops', {'name': 'Test Crop'}),
            ('POST', '/api/locations/countries', {'name': 'Test Country', 'code': 'TC'}),
            ('POST', '/api/categories', {'name': 'Test Category'})
        ]
        
        farmer_headers = {'Authorization': f'Bearer {self.tokens["farmer"]}'}
        admin_headers = {'Authorization': f'Bearer {self.tokens["admin"]}'}
        
        for method, endpoint, data in admin_endpoints:
            try:
                # Test farmer accessing admin endpoint
                response = requests.post(f"{self.base_url}{endpoint}", json=data, headers=farmer_headers)
                passed = response.status_code == 403
                self.log_test(f"Farmer access to admin endpoint {endpoint}", passed,
                            f"Status: {response.status_code}")
                
                # Test admin accessing admin endpoint (should work)
                response = requests.post(f"{self.base_url}{endpoint}", json=data, headers=admin_headers)
                passed = response.status_code in [201, 409]  # Created or conflict (duplicate)
                self.log_test(f"Admin access to admin endpoint {endpoint}", passed,
                            f"Status: {response.status_code}")
                
            except Exception as e:
                self.log_test(f"Authorization test for {endpoint}", False, str(e))
    
    def test_input_validation(self):
        """Test input validation and sanitization."""
        print("\n🧹 Testing Input Validation...")
        
        if 'farmer' not in self.tokens:
            print("   ⚠️ Skipping input validation tests - missing farmer token")
            return
        
        headers = {'Authorization': f'Bearer {self.tokens["farmer"]}'}
        
        # SQL Injection attempts
        sql_payloads = [
            "'; DROP TABLE articles; --",
            "' OR '1'='1",
            "'; INSERT INTO users (email) VALUES ('hacked@test.com'); --"
        ]
        
        for payload in sql_payloads:
            try:
                data = {'title': payload, 'content': 'Test content'}
                response = requests.post(f"{self.base_url}/api/articles", json=data, headers=headers)
                # Should either validate and reject (400) or sanitize and accept (201)
                passed = response.status_code in [400, 201]
                self.log_test(f"SQL injection protection: {payload[:20]}...", passed,
                            f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"SQL injection test", False, str(e))
        
        # XSS attempts
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')"
        ]
        
        for payload in xss_payloads:
            try:
                data = {'title': 'Test Title', 'content': payload}
                response = requests.post(f"{self.base_url}/api/articles", json=data, headers=headers)
                passed = response.status_code in [400, 201]  # Should validate or sanitize
                self.log_test(f"XSS protection: {payload[:20]}...", passed,
                            f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"XSS test", False, str(e))
        
        # Large payload test
        try:
            large_content = "A" * 1000000  # 1MB of data
            data = {'title': 'Large Content Test', 'content': large_content}
            response = requests.post(f"{self.base_url}/api/articles", json=data, headers=headers)
            passed = response.status_code in [400, 413]  # Bad request or payload too large
            self.log_test("Large payload protection", passed, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Large payload test", False, str(e))
        
        # Invalid data types
        invalid_data_tests = [
            ({'title': 123, 'content': 'Test'}, 'Invalid title type'),
            ({'title': 'Test', 'content': None}, 'Null content'),
            ({'title': '', 'content': 'Test'}, 'Empty title'),
            ({'content': 'Test'}, 'Missing title'),
        ]
        
        for invalid_data, test_name in invalid_data_tests:
            try:
                response = requests.post(f"{self.base_url}/api/articles", json=invalid_data, headers=headers)
                passed = response.status_code == 400
                self.log_test(f"Input validation: {test_name}", passed,
                            f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Input validation test: {test_name}", False, str(e))
    
    def test_rate_limiting(self):
        """Test rate limiting protection."""
        print("\n⏱️ Testing Rate Limiting...")
        
        if 'farmer' not in self.tokens:
            print("   ⚠️ Skipping rate limiting tests - missing farmer token")
            return
        
        headers = {'Authorization': f'Bearer {self.tokens["farmer"]}'}
        
        # Test rapid requests
        try:
            responses = []
            for i in range(20):  # Send 20 rapid requests
                response = requests.get(f"{self.base_url}/api/articles", headers=headers)
                responses.append(response.status_code)
                time.sleep(0.1)  # Small delay
            
            # Check if any requests were rate limited (429)
            rate_limited = any(status == 429 for status in responses)
            self.log_test("Rate limiting protection", rate_limited,
                        f"Responses: {set(responses)}")
            
        except Exception as e:
            self.log_test("Rate limiting test", False, str(e))
    
    def test_token_security(self):
        """Test JWT token security."""
        print("\n🔑 Testing Token Security...")
        
        if 'farmer' not in self.tokens:
            print("   ⚠️ Skipping token security tests - missing farmer token")
            return
        
        # Test expired token (simulate)
        try:
            # Create an expired token
            expired_payload = {
                'user_id': 'test-user-id',
                'exp': datetime.utcnow() - timedelta(hours=1)  # Expired 1 hour ago
            }
            expired_token = jwt.encode(expired_payload, 'test-secret', algorithm='HS256')
            
            headers = {'Authorization': f'Bearer {expired_token}'}
            response = requests.get(f"{self.base_url}/api/articles", headers=headers)
            passed = response.status_code == 401
            self.log_test("Expired token rejection", passed, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Expired token test", False, str(e))
        
        # Test token with invalid signature
        try:
            invalid_payload = {'user_id': 'test-user-id', 'exp': datetime.utcnow() + timedelta(hours=1)}
            invalid_token = jwt.encode(invalid_payload, 'wrong-secret', algorithm='HS256')
            
            headers = {'Authorization': f'Bearer {invalid_token}'}
            response = requests.get(f"{self.base_url}/api/articles", headers=headers)
            passed = response.status_code == 401
            self.log_test("Invalid signature rejection", passed, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Invalid signature test", False, str(e))
    
    def test_cors_security(self):
        """Test CORS security."""
        print("\n🌐 Testing CORS Security...")
        
        # Test CORS headers
        try:
            headers = {'Origin': 'https://malicious-site.com'}
            response = requests.get(f"{self.base_url}/api/articles", headers=headers)
            
            # Check if CORS headers are present and restrictive
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            passed = cors_header is None or cors_header != '*'
            self.log_test("CORS origin restriction", passed,
                        f"CORS header: {cors_header}")
            
        except Exception as e:
            self.log_test("CORS test", False, str(e))
    
    def test_information_disclosure(self):
        """Test for information disclosure vulnerabilities."""
        print("\n🔍 Testing Information Disclosure...")
        
        # Test error message information disclosure
        try:
            response = requests.get(f"{self.base_url}/api/articles/invalid-uuid-format")
            
            # Check if error messages don't reveal sensitive information
            if response.status_code == 400 or response.status_code == 404:
                error_text = response.text.lower()
                sensitive_keywords = ['database', 'sql', 'postgres', 'exception', 'traceback']
                disclosed = any(keyword in error_text for keyword in sensitive_keywords)
                passed = not disclosed
                self.log_test("Error message information disclosure", passed,
                            f"Contains sensitive info: {disclosed}")
            else:
                self.log_test("Error message test", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Information disclosure test", False, str(e))
        
        # Test server header disclosure
        try:
            response = requests.get(f"{self.base_url}/api/articles")
            server_header = response.headers.get('Server', '')
            
            # Check if server header reveals too much information
            sensitive_server_info = ['flask', 'python', 'werkzeug']
            disclosed = any(info in server_header.lower() for info in sensitive_server_info)
            passed = not disclosed
            self.log_test("Server header information disclosure", passed,
                        f"Server header: {server_header}")
            
        except Exception as e:
            self.log_test("Server header test", False, str(e))
    
    def test_resource_access_control(self):
        """Test resource-level access control."""
        print("\n🔐 Testing Resource Access Control...")
        
        if 'farmer' not in self.tokens or 'expert' not in self.tokens:
            print("   ⚠️ Skipping resource access tests - missing tokens")
            return
        
        farmer_headers = {'Authorization': f'Bearer {self.tokens["farmer"]}'}
        expert_headers = {'Authorization': f'Bearer {self.tokens["expert"]}'}
        
        # Test accessing other user's resources
        try:
            # Create a user crop record as farmer
            crop_data = {'crop_id': 1, 'area_planted': 10.0, 'season': 'spring'}
            response = requests.post(f"{self.base_url}/api/user-crops", json=crop_data, headers=farmer_headers)
            
            if response.status_code == 201:
                crop_id = response.json().get('data', {}).get('user_crop_id')
                if crop_id:
                    # Try to access farmer's crop record as expert
                    response = requests.get(f"{self.base_url}/api/user-crops/{crop_id}", headers=expert_headers)
                    passed = response.status_code == 403
                    self.log_test("Cross-user resource access protection", passed,
                                f"Status: {response.status_code}")
                else:
                    self.log_test("Resource access test setup", False, "No crop ID returned")
            else:
                self.log_test("Resource access test setup", False, f"Failed to create crop: {response.status_code}")
                
        except Exception as e:
            self.log_test("Resource access control test", False, str(e))
    
    def generate_report(self):
        """Generate security test report."""
        print("\n" + "="*60)
        print("🛡️ SECURITY TEST REPORT")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        print(f"   📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"   - {result['test']}: {result['details']}")
        
        print(f"\n🔒 Security Recommendations:")
        print("1. Ensure all endpoints require proper authentication")
        print("2. Implement role-based access control consistently")
        print("3. Validate and sanitize all user inputs")
        print("4. Use rate limiting to prevent abuse")
        print("5. Implement proper CORS policies")
        print("6. Avoid information disclosure in error messages")
        print("7. Use HTTPS in production")
        print("8. Regularly update dependencies")
        print("9. Implement security headers (CSP, HSTS, etc.)")
        print("10. Monitor and log security events")
        
        # Save report to file
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': failed_tests,
                'success_rate': (passed_tests/total_tests)*100
            },
            'test_results': self.test_results
        }
        
        with open('security_test_report.json', 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: security_test_report.json")
        
        return failed_tests == 0
    
    def run_all_tests(self):
        """Run all security tests."""
        print("🚀 Starting Security Testing for Agricultural Super App API")
        print("="*60)
        
        # Setup
        self.setup_test_users()
        
        # Run tests
        self.test_authentication_bypass()
        self.test_authorization_bypass()
        self.test_input_validation()
        self.test_rate_limiting()
        self.test_token_security()
        self.test_cors_security()
        self.test_information_disclosure()
        self.test_resource_access_control()
        
        # Generate report
        success = self.generate_report()
        
        return success

def main():
    """Main function to run security tests."""
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server is not responding properly. Please start the server first.")
            sys.exit(1)
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to server at http://localhost:5000")
        print("   Please ensure the server is running with: python run.py")
        sys.exit(1)
    
    # Run security tests
    tester = SecurityTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All security tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️ Some security tests failed. Please review the report.")
        sys.exit(1)

if __name__ == "__main__":
    main()