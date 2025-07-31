#!/usr/bin/env python3
"""
Create payments and transaction_logs tables if they don't exist.
Run this script to ensure the payment tables are created.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import create_app
from server.database import db
from server.models.payment import Payment, TransactionLog

def create_payment_tables():
    """Create payment tables if they don't exist."""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if tables exist
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            print("Existing tables:", existing_tables)
            
            if 'payments' not in existing_tables:
                print("Creating payments table...")
                Payment.__table__.create(db.engine)
                print("✅ Payments table created successfully")
            else:
                print("✅ Payments table already exists")
            
            if 'transaction_logs' not in existing_tables:
                print("Creating transaction_logs table...")
                TransactionLog.__table__.create(db.engine)
                print("✅ Transaction logs table created successfully")
            else:
                print("✅ Transaction logs table already exists")
            
            print("✅ Payment tables setup complete!")
            
        except Exception as e:
            print(f"❌ Error creating payment tables: {str(e)}")
            import traceback
            print(traceback.format_exc())

if __name__ == '__main__':
    create_payment_tables()