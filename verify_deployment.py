#!/usr/bin/env python3
"""
Deployment verification script for Agricultural Super App.
Verifies that all components are working correctly after deployment.
"""

import sys
import os
from datetime import datetime

def verify_imports():
    """Verify all critical imports work."""
    print("🔍 Verifying imports...")
    
    try:
        from server import create_app
        print("   ✅ Flask app import successful")
    except ImportError as e:
        print(f"   ❌ Flask app import failed: {e}")
        return False
    
    try:
        from server.database import db
        print("   ✅ Database import successful")
    except ImportError as e:
        print(f"   ❌ Database import failed: {e}")
        return False
    
    try:
        import server.models
        print("   ✅ Models import successful")
    except ImportError as e:
        print(f"   ❌ Models import failed: {e}")
        return False
    
    try:
        from server.utils.rate_limiter import rate_limiter
        print("   ✅ Rate limiter import successful")
    except ImportError as e:
        print(f"   ❌ Rate limiter import failed: {e}")
        return False
    
    return True

def verify_app_creation():
    """Verify Flask app can be created."""
    print("\n🏗️ Verifying app creation...")
    
    try:
        from server import create_app
        app = create_app('production')
        print("   ✅ Flask app created successfully")
        return True
    except Exception as e:
        print(f"   ❌ Flask app creation failed: {e}")
        return False

def verify_database_connection():
    """Verify database connection works."""
    print("\n🗄️ Verifying database connection...")
    
    try:
        from server import create_app
        from server.database import db
        from sqlalchemy import text
        
        app = create_app('production')
        with app.app_context():
            # Test basic database connection
            db.session.execute(text("SELECT 1"))
            print("   ✅ Database connection successful")
            return True
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")
        return False

def verify_routes():
    """Verify routes are registered."""
    print("\n🛣️ Verifying routes...")
    
    try:
        from server import create_app
        app = create_app('production')
        
        # Check if basic routes exist
        with app.app_context():
            routes = [str(rule) for rule in app.url_map.iter_rules()]
            
            expected_routes = [
                '/api/articles',
                '/api/crops',
                '/api/locations',
                '/api/categories',
                '/api/tags',
                '/api/reviews',
                '/api/auth/login',
                '/api/auth/register'
            ]
            
            missing_routes = []
            for route in expected_routes:
                if not any(route in r for r in routes):
                    missing_routes.append(route)
            
            if missing_routes:
                print(f"   ⚠️ Missing routes: {missing_routes}")
            else:
                print("   ✅ All expected routes registered")
            
            return len(missing_routes) == 0
            
    except Exception as e:
        print(f"   ❌ Route verification failed: {e}")
        return False

def verify_environment():
    """Verify environment configuration."""
    print("\n🌍 Verifying environment...")
    
    required_env_vars = ['DATABASE_URL', 'SECRET_KEY', 'JWT_SECRET_KEY']
    missing_vars = []
    
    for var in required_env_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"   ⚠️ Missing environment variables: {missing_vars}")
        print("   ℹ️ This is expected in development, but required in production")
    else:
        print("   ✅ All required environment variables present")
    
    return True

def main():
    """Main verification function."""
    print("🚀 Agricultural Super App Deployment Verification")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Python Version: {sys.version}")
    print(f"Working Directory: {os.getcwd()}")
    print("=" * 60)
    
    checks = [
        ("Import Verification", verify_imports),
        ("App Creation", verify_app_creation),
        ("Database Connection", verify_database_connection),
        ("Route Registration", verify_routes),
        ("Environment Configuration", verify_environment)
    ]
    
    passed_checks = 0
    total_checks = len(checks)
    
    for check_name, check_func in checks:
        try:
            if check_func():
                passed_checks += 1
        except Exception as e:
            print(f"   ❌ {check_name} failed with exception: {e}")
    
    print("\n" + "=" * 60)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"Passed: {passed_checks}/{total_checks}")
    print(f"Success Rate: {(passed_checks/total_checks)*100:.1f}%")
    
    if passed_checks == total_checks:
        print("🎉 All verification checks passed! Deployment looks good.")
        return True
    else:
        print("⚠️ Some verification checks failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)