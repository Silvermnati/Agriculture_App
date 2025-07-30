#!/usr/bin/env python3
"""
Performance testing script for Agricultural Super App API endpoints.
Tests response times, throughput, and scalability.
"""

import requests
import json
import time
import threading
import statistics
import sys
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

class PerformanceTester:
    """Performance testing class for API endpoints."""
    
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.test_results = []
        self.tokens = {}
        
    def log_result(self, test_name, response_times, success_rate, throughput):
        """Log performance test result."""
        avg_time = statistics.mean(response_times) if response_times else 0
        min_time = min(response_times) if response_times else 0
        max_time = max(response_times) if response_times else 0
        p95_time = statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max_time
        
        result = {
            'test_name': test_name,
            'avg_response_time': avg_time,
            'min_response_time': min_time,
            'max_response_time': max_time,
            'p95_response_time': p95_time,
            'success_rate': success_rate,
            'throughput': throughput,
            'timestamp': datetime.now().isoformat()
        }
        
        self.test_results.append(result)
        
        print(f"📊 {test_name}:")
        print(f"   Avg Response Time: {avg_time:.3f}s")
        print(f"   Min/Max: {min_time:.3f}s / {max_time:.3f}s")
        print(f"   95th Percentile: {p95_time:.3f}s")
        print(f"   Success Rate: {success_rate:.1f}%")
        print(f"   Throughput: {throughput:.1f} req/s")
        
        # Performance thresholds
        if avg_time > 2.0:
            print("   ⚠️ WARNING: Average response time > 2s")
        if success_rate < 95.0:
            print("   ⚠️ WARNING: Success rate < 95%")
        if p95_time > 5.0:
            print("   ⚠️ WARNING: 95th percentile > 5s")
    
    def setup_test_user(self):
        """Create test user for performance testing."""
        print("🔧 Setting up test user...")
        
        user_data = {
            'email': 'perf_test@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Performance',
            'last_name': 'Tester',
            'role': 'farmer'
        }
        
        try:
            # Register or login
            response = requests.post(f"{self.base_url}/api/auth/register", json=user_data)
            if response.status_code in [201, 409]:
                # Login to get token
                login_response = requests.post(f"{self.base_url}/api/auth/login", json={
                    'email': user_data['email'],
                    'password': user_data['password']
                })
                if login_response.status_code == 200:
                    self.tokens['farmer'] = login_response.json().get('token')
                    print("   ✅ Test user ready")
                    return True
        except Exception as e:
            print(f"   ❌ Error setting up test user: {str(e)}")
        
        return False
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request and measure response time."""
        start_time = time.time()
        try:
            if method.upper() == 'GET':
                response = requests.get(f"{self.base_url}{endpoint}", headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(f"{self.base_url}{endpoint}", json=data, headers=headers, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(f"{self.base_url}{endpoint}", json=data, headers=headers, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(f"{self.base_url}{endpoint}", headers=headers, timeout=10)
            else:
                return None, 0, False
            
            end_time = time.time()
            response_time = end_time - start_time
            success = 200 <= response.status_code < 400
            
            return response, response_time, success
            
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            return None, response_time, False
    
    def test_endpoint_performance(self, test_name, method, endpoint, data=None, headers=None, 
                                 concurrent_users=10, requests_per_user=10):
        """Test endpoint performance with concurrent users."""
        print(f"\n🚀 Testing {test_name}...")
        print(f"   Concurrent Users: {concurrent_users}")
        print(f"   Requests per User: {requests_per_user}")
        
        response_times = []
        success_count = 0
        total_requests = concurrent_users * requests_per_user
        
        def user_requests():
            """Simulate user making multiple requests."""
            user_times = []
            user_successes = 0
            
            for _ in range(requests_per_user):
                response, response_time, success = self.make_request(method, endpoint, data, headers)
                user_times.append(response_time)
                if success:
                    user_successes += 1
                time.sleep(0.1)  # Small delay between requests
            
            return user_times, user_successes
        
        start_time = time.time()
        
        # Use ThreadPoolExecutor for concurrent requests
        with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(user_requests) for _ in range(concurrent_users)]
            
            for future in as_completed(futures):
                try:
                    user_times, user_successes = future.result()
                    response_times.extend(user_times)
                    success_count += user_successes
                except Exception as e:
                    print(f"   ⚠️ Error in user thread: {str(e)}")
        
        end_time = time.time()
        total_time = end_time - start_time
        
        success_rate = (success_count / total_requests) * 100
        throughput = total_requests / total_time
        
        self.log_result(test_name, response_times, success_rate, throughput)
    
    def test_read_operations(self):
        """Test read operation performance."""
        print("\n📖 Testing Read Operations Performance...")
        
        # Test article list endpoint
        self.test_endpoint_performance(
            "Article List (GET /api/articles)",
            "GET", "/api/articles",
            concurrent_users=20,
            requests_per_user=5
        )
        
        # Test crop list endpoint
        self.test_endpoint_performance(
            "Crop List (GET /api/crops)",
            "GET", "/api/crops",
            concurrent_users=15,
            requests_per_user=8
        )
        
        # Test location endpoints
        self.test_endpoint_performance(
            "Countries List (GET /api/locations/countries)",
            "GET", "/api/locations/countries",
            concurrent_users=10,
            requests_per_user=10
        )
        
        # Test categories endpoint
        self.test_endpoint_performance(
            "Categories List (GET /api/categories)",
            "GET", "/api/categories",
            concurrent_users=12,
            requests_per_user=8
        )
    
    def test_write_operations(self):
        """Test write operation performance."""
        print("\n✍️ Testing Write Operations Performance...")
        
        if 'farmer' not in self.tokens:
            print("   ⚠️ Skipping write tests - no authentication token")
            return
        
        headers = {'Authorization': f'Bearer {self.tokens["farmer"]}'}
        
        # Test article creation
        article_data = {
            'title': 'Performance Test Article',
            'content': '<p>This is a performance test article content.</p>',
            'excerpt': 'Performance test excerpt',
            'status': 'draft'
        }
        
        self.test_endpoint_performance(
            "Article Creation (POST /api/articles)",
            "POST", "/api/articles",
            data=article_data,
            headers=headers,
            concurrent_users=5,
            requests_per_user=3
        )
        
        # Test user crop creation
        crop_data = {
            'crop_id': 1,
            'area_planted': 10.5,
            'area_unit': 'hectares',
            'season': 'spring',
            'notes': 'Performance test crop'
        }
        
        self.test_endpoint_performance(
            "User Crop Creation (POST /api/user-crops)",
            "POST", "/api/user-crops",
            data=crop_data,
            headers=headers,
            concurrent_users=8,
            requests_per_user=2
        )
        
        # Test tag creation
        tag_data = {
            'name': f'perf-test-{int(time.time())}',
            'description': 'Performance test tag'
        }
        
        self.test_endpoint_performance(
            "Tag Creation (POST /api/tags)",
            "POST", "/api/tags",
            data=tag_data,
            headers=headers,
            concurrent_users=6,
            requests_per_user=2
        )
    
    def test_search_operations(self):
        """Test search operation performance."""
        print("\n🔍 Testing Search Operations Performance...")
        
        # Test article search with various parameters
        search_endpoints = [
            ("/api/articles?search=farming", "Article Search by Text"),
            ("/api/articles?category=1", "Article Filter by Category"),
            ("/api/articles?season=spring", "Article Filter by Season"),
            ("/api/crops?category=grain", "Crop Filter by Category"),
            ("/api/tags?search=farm", "Tag Search")
        ]
        
        for endpoint, test_name in search_endpoints:
            self.test_endpoint_performance(
                test_name,
                "GET", endpoint,
                concurrent_users=15,
                requests_per_user=5
            )
    
    def test_pagination_performance(self):
        """Test pagination performance."""
        print("\n📄 Testing Pagination Performance...")
        
        pagination_tests = [
            ("/api/articles?page=1&per_page=10", "Articles Page 1 (10 items)"),
            ("/api/articles?page=1&per_page=50", "Articles Page 1 (50 items)"),
            ("/api/articles?page=5&per_page=10", "Articles Page 5 (10 items)"),
            ("/api/crops?page=1&per_page=20", "Crops Page 1 (20 items)")
        ]
        
        for endpoint, test_name in pagination_tests:
            self.test_endpoint_performance(
                test_name,
                "GET", endpoint,
                concurrent_users=12,
                requests_per_user=6
            )
    
    def test_database_intensive_operations(self):
        """Test database-intensive operations."""
        print("\n🗄️ Testing Database Intensive Operations...")
        
        if 'farmer' not in self.tokens:
            print("   ⚠️ Skipping database tests - no authentication token")
            return
        
        headers = {'Authorization': f'Bearer {self.tokens["farmer"]}'}
        
        # Test user crops with relationships
        self.test_endpoint_performance(
            "User Crops with Relationships (GET /api/user-crops)",
            "GET", "/api/user-crops",
            headers=headers,
            concurrent_users=10,
            requests_per_user=8
        )
        
        # Test complex article queries
        self.test_endpoint_performance(
            "Complex Article Query",
            "GET", "/api/articles?category=1&season=spring&search=farming",
            concurrent_users=8,
            requests_per_user=5
        )
    
    def test_error_handling_performance(self):
        """Test error handling performance."""
        print("\n❌ Testing Error Handling Performance...")
        
        error_tests = [
            ("/api/articles/invalid-uuid", "Invalid UUID Error"),
            ("/api/crops/99999", "Non-existent Resource Error"),
            ("/api/categories/99999", "Non-existent Category Error")
        ]
        
        for endpoint, test_name in error_tests:
            self.test_endpoint_performance(
                test_name,
                "GET", endpoint,
                concurrent_users=10,
                requests_per_user=5
            )
    
    def test_stress_scenarios(self):
        """Test stress scenarios."""
        print("\n💪 Testing Stress Scenarios...")
        
        # High concurrency test
        self.test_endpoint_performance(
            "High Concurrency Stress Test",
            "GET", "/api/articles",
            concurrent_users=50,
            requests_per_user=10
        )
        
        # Sustained load test
        print("\n⏱️ Running Sustained Load Test (30 seconds)...")
        start_time = time.time()
        response_times = []
        success_count = 0
        total_requests = 0
        
        def sustained_load():
            nonlocal response_times, success_count, total_requests
            while time.time() - start_time < 30:  # Run for 30 seconds
                response, response_time, success = self.make_request("GET", "/api/articles")
                response_times.append(response_time)
                total_requests += 1
                if success:
                    success_count += 1
                time.sleep(0.5)  # Request every 500ms
        
        # Run sustained load with multiple threads
        threads = []
        for _ in range(5):  # 5 concurrent threads
            thread = threading.Thread(target=sustained_load)
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        total_time = time.time() - start_time
        success_rate = (success_count / total_requests) * 100 if total_requests > 0 else 0
        throughput = total_requests / total_time
        
        self.log_result("Sustained Load Test (30s)", response_times, success_rate, throughput)
    
    def generate_performance_report(self):
        """Generate performance test report."""
        print("\n" + "="*60)
        print("📊 PERFORMANCE TEST REPORT")
        print("="*60)
        
        if not self.test_results:
            print("No test results to report.")
            return
        
        # Summary statistics
        avg_response_times = [result['avg_response_time'] for result in self.test_results]
        success_rates = [result['success_rate'] for result in self.test_results]
        throughputs = [result['throughput'] for result in self.test_results]
        
        print(f"📈 Overall Performance Summary:")
        print(f"   Tests Conducted: {len(self.test_results)}")
        print(f"   Average Response Time: {statistics.mean(avg_response_times):.3f}s")
        print(f"   Best Response Time: {min(avg_response_times):.3f}s")
        print(f"   Worst Response Time: {max(avg_response_times):.3f}s")
        print(f"   Average Success Rate: {statistics.mean(success_rates):.1f}%")
        print(f"   Average Throughput: {statistics.mean(throughputs):.1f} req/s")
        print(f"   Peak Throughput: {max(throughputs):.1f} req/s")
        
        # Performance issues
        slow_tests = [r for r in self.test_results if r['avg_response_time'] > 1.0]
        low_success_tests = [r for r in self.test_results if r['success_rate'] < 95.0]
        low_throughput_tests = [r for r in self.test_results if r['throughput'] < 10.0]
        
        if slow_tests:
            print(f"\n⚠️ Slow Response Times (>1s):")
            for test in slow_tests:
                print(f"   - {test['test_name']}: {test['avg_response_time']:.3f}s")
        
        if low_success_tests:
            print(f"\n❌ Low Success Rates (<95%):")
            for test in low_success_tests:
                print(f"   - {test['test_name']}: {test['success_rate']:.1f}%")
        
        if low_throughput_tests:
            print(f"\n🐌 Low Throughput (<10 req/s):")
            for test in low_throughput_tests:
                print(f"   - {test['test_name']}: {test['throughput']:.1f} req/s")
        
        # Recommendations
        print(f"\n🎯 Performance Optimization Recommendations:")
        print("1. Add database indexes for frequently queried fields")
        print("2. Implement caching for read-heavy endpoints")
        print("3. Use connection pooling for database connections")
        print("4. Consider pagination for large result sets")
        print("5. Optimize database queries to prevent N+1 problems")
        print("6. Use CDN for static content delivery")
        print("7. Implement response compression")
        print("8. Monitor and optimize slow queries")
        print("9. Consider horizontal scaling for high load")
        print("10. Use async processing for heavy operations")
        
        # Save detailed report
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_tests': len(self.test_results),
                'avg_response_time': statistics.mean(avg_response_times),
                'avg_success_rate': statistics.mean(success_rates),
                'avg_throughput': statistics.mean(throughputs),
                'peak_throughput': max(throughputs)
            },
            'test_results': self.test_results
        }
        
        with open('performance_test_report.json', 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: performance_test_report.json")
    
    def run_all_tests(self):
        """Run all performance tests."""
        print("🚀 Starting Performance Testing for Agricultural Super App API")
        print("="*60)
        
        # Setup
        if not self.setup_test_user():
            print("❌ Failed to setup test user. Exiting.")
            return False
        
        # Run performance tests
        self.test_read_operations()
        self.test_write_operations()
        self.test_search_operations()
        self.test_pagination_performance()
        self.test_database_intensive_operations()
        self.test_error_handling_performance()
        self.test_stress_scenarios()
        
        # Generate report
        self.generate_performance_report()
        
        return True

def main():
    """Main function to run performance tests."""
    
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
    
    # Run performance tests
    tester = PerformanceTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Performance testing completed!")
    else:
        print("\n⚠️ Performance testing encountered issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()