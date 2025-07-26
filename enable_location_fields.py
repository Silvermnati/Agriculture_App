#!/usr/bin/env python3
"""
Script to enable location fields after database migration is complete.
This script updates the User model and registration controller to use the new location fields.
"""

import os
import re

def update_user_model():
    """Update the User model to enable location fields."""
    
    model_path = "server/models/user.py"
    
    if not os.path.exists(model_path):
        print(f"❌ User model not found at {model_path}")
        return False
    
    try:
        with open(model_path, 'r') as f:
            content = f.read()
        
        # Uncomment the location fields
        updated_content = content.replace(
            "    # NOTE: These fields are commented out until database migration is run\n"
            "    # country = db.Column(db.String(100), nullable=True)\n"
            "    # city = db.Column(db.String(100), nullable=True)",
            "    # Simple location fields (alternative to complex location hierarchy)\n"
            "    country = db.Column(db.String(100), nullable=True)\n"
            "    city = db.Column(db.String(100), nullable=True)"
        )
        
        if updated_content != content:
            with open(model_path, 'w') as f:
                f.write(updated_content)
            print("✅ Updated User model to enable location fields")
            return True
        else:
            print("ℹ️  User model already has location fields enabled")
            return True
            
    except Exception as e:
        print(f"❌ Failed to update User model: {e}")
        return False

def update_auth_controller():
    """Update the auth controller to enable location fields."""
    
    controller_path = "server/controllers/auth_controller.py"
    
    if not os.path.exists(controller_path):
        print(f"❌ Auth controller not found at {controller_path}")
        return False
    
    try:
        with open(controller_path, 'r') as f:
            content = f.read()
        
        # Uncomment the location fields in registration
        updated_content = content.replace(
            "        # country=data.get('country'),  # Temporarily disabled until migration\n"
            "        # city=data.get('city'),        # Temporarily disabled until migration",
            "        country=data.get('country'),\n"
            "        city=data.get('city'),"
        )
        
        if updated_content != content:
            with open(controller_path, 'w') as f:
                f.write(updated_content)
            print("✅ Updated auth controller to enable location fields")
            return True
        else:
            print("ℹ️  Auth controller already has location fields enabled")
            return True
            
    except Exception as e:
        print(f"❌ Failed to update auth controller: {e}")
        return False

def main():
    """Main function to enable location fields."""
    
    print("🔧 Enabling Location Fields Script")
    print("=" * 40)
    
    print("📝 This script will enable the country and city fields")
    print("   that were temporarily disabled for database migration.")
    print()
    
    # Update User model
    print("1️⃣  Updating User model...")
    model_success = update_user_model()
    
    # Update auth controller
    print("2️⃣  Updating auth controller...")
    controller_success = update_auth_controller()
    
    print("=" * 40)
    
    if model_success and controller_success:
        print("✅ Location fields enabled successfully!")
        print()
        print("📋 Next steps:")
        print("   1. Restart your application")
        print("   2. Test user registration with country/city fields")
        print("   3. Verify profile management works with location data")
        return True
    else:
        print("❌ Failed to enable some location fields")
        print("   Please check the error messages above and try again")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)