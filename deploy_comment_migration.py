#!/usr/bin/env python3
"""
Production deployment script for comment tracking fields migration
This script can be run on Render to safely apply the migration
"""
import os
import sys
from datetime import datetime

def deploy_comment_migration():
    """Deploy comment tracking fields migration to production"""
    print("🚀 Starting comment tracking fields migration deployment...")
    print(f"Environment: {os.environ.get('FLASK_CONFIG', 'development')}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    try:
        from server import create_app
        from server.database import db
        
        # Create Flask app context
        app = create_app(os.environ.get('FLASK_CONFIG', 'production'))
        
        with app.app_context():
            print("\n🔍 Pre-migration checks...")
            
            # Check 1: Verify database connection
            try:
                with db.engine.connect() as conn:
                    conn.execute(db.text('SELECT 1'))
                print("✅ Database connection successful")
            except Exception as e:
                print(f"❌ Database connection failed: {e}")
                return False
            
            # Check 2: Verify comments table exists
            with db.engine.connect() as conn:
                result = conn.execute(db.text("""
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_name = 'comments'
                """))
                if not result.fetchone():
                    print("❌ Comments table not found")
                    return False
                print("✅ Comments table exists")
            
            # Check 3: Check current column status
            with db.engine.connect() as conn:
                result = conn.execute(db.text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'comments' 
                    AND column_name IN ('is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at')
                    ORDER BY column_name
                """))
                existing_columns = [row[0] for row in result]
                
                required_columns = ['is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at']
                missing_columns = [col for col in required_columns if col not in existing_columns]
                
                print(f"Existing tracking columns: {existing_columns}")
                print(f"Missing tracking columns: {missing_columns}")
                
                if not missing_columns:
                    print("✅ All required columns already exist - no migration needed")
                    return True
            
            print(f"\n🔧 Applying migration for {len(missing_columns)} missing columns...")
            
            # Import Flask-Migrate
            from flask_migrate import upgrade
            
            # Apply the migration
            try:
                upgrade()
                print("✅ Migration applied successfully")
            except Exception as e:
                print(f"❌ Migration failed: {e}")
                # Try to get more details about the error
                import traceback
                traceback.print_exc()
                return False
            
            # Post-migration verification
            print("\n🔍 Post-migration verification...")
            
            with db.engine.connect() as conn:
                result = conn.execute(db.text("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = 'comments' 
                    AND column_name IN ('is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at')
                    ORDER BY column_name
                """))
                final_columns = result.fetchall()
                
                print("Final column status:")
                for col in final_columns:
                    print(f"  - {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")
                
                if len(final_columns) == 5:
                    print("✅ All 5 tracking columns are now present")
                else:
                    print(f"❌ Expected 5 columns, found {len(final_columns)}")
                    return False
            
            # Test Comment model functionality
            print("\n🧪 Testing Comment model...")
            try:
                from server.models.post import Comment
                
                # Test that we can query comments without errors
                comment_count = Comment.query.count()
                print(f"✅ Comment model works - found {comment_count} comments")
                
                # Test a sample comment if any exist
                sample_comment = Comment.query.first()
                if sample_comment:
                    # Test that tracking fields are accessible
                    test_fields = {
                        'is_edited': sample_comment.is_edited,
                        'edit_count': sample_comment.edit_count,
                        'last_edited_at': sample_comment.last_edited_at,
                        'is_deleted': sample_comment.is_deleted,
                        'deleted_at': sample_comment.deleted_at
                    }
                    print("✅ All tracking fields accessible on existing comments")
                    
                    # Test serialization
                    comment_dict = sample_comment.to_dict(include_replies=False)
                    tracking_keys = ['is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at']
                    missing_keys = [key for key in tracking_keys if key not in comment_dict]
                    
                    if missing_keys:
                        print(f"❌ Missing keys in serialization: {missing_keys}")
                        return False
                    else:
                        print("✅ Comment serialization includes all tracking fields")
                
            except Exception as e:
                print(f"❌ Comment model test failed: {e}")
                import traceback
                traceback.print_exc()
                return False
            
            print(f"\n🎉 Migration deployment completed successfully!")
            print(f"✅ All comment tracking fields are now available")
            print(f"✅ Comment system is ready for edit tracking and soft deletion")
            
            return True
            
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = deploy_comment_migration()
    if success:
        print("\n🚀 Deployment successful - ready for production use!")
        sys.exit(0)
    else:
        print("\n💥 Deployment failed - check logs above")
        sys.exit(1)