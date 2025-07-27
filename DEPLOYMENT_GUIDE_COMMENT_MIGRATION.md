# Comment Tracking Fields Migration - Deployment Guide

This guide explains how to deploy the comment tracking fields migration to the Render production environment.

## Problem

The production database on Render is missing the following columns in the `comments` table:
- `is_edited` (Boolean)
- `edit_count` (Integer) 
- `last_edited_at` (DateTime)
- `is_deleted` (Boolean)
- `deleted_at` (DateTime)

This causes errors when the Comment model tries to access these fields.

## Solution

We have created a migration and deployment scripts to safely add these fields to the production database.

## Files Created

1. **Migration File**: `migrations/versions/09c5a19621ad_add_comment_tracking_fields.py`
   - Adds the missing columns with proper defaults
   - Includes error handling for existing columns

2. **Deployment Script**: `deploy_comment_migration.py`
   - Safe deployment script for production
   - Includes pre/post migration checks
   - Tests Comment model functionality

3. **Temporary Fix**: `temp_comment_model_fix.py`
   - Emergency hotfix if needed during deployment
   - Can temporarily revert model to use getattr()

## Deployment Steps

### Option 1: Direct Migration (Recommended)

1. **Deploy the code** with the migration files to Render

2. **Run the migration** on Render from the server directory:

   **Method A: Using the deployment script (Recommended)**
   ```bash
   cd server
   python deploy_comment_migration.py
   ```

   **Method B: Using Flask-Migrate command from root**
   ```bash
   python -m flask db upgrade
   ```

3. **Verify the deployment** by checking that comments load without errors

### Option 2: Safe Deployment with Temporary Fix

If you need to deploy immediately while the migration is being prepared:

1. **Apply temporary fix** (locally before deploying):
   ```bash
   python temp_comment_model_fix.py
   ```

2. **Deploy the code** with the temporary fix

3. **Run the migration** on Render:
   ```bash
   cd server
   python deploy_comment_migration.py
   ```

4. **Revert the temporary fix** (locally):
   ```bash
   python temp_comment_model_fix.py revert
   ```

5. **Deploy the final code** with direct field access

## Migration Details

The migration adds these columns to the `comments` table:

```sql
ALTER TABLE comments ADD COLUMN is_edited BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE comments ADD COLUMN edit_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comments ADD COLUMN last_edited_at TIMESTAMP;
ALTER TABLE comments ADD COLUMN is_deleted BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP;
```

## Verification

After deployment, verify that:

1. **Database has the columns**:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'comments' 
   AND column_name IN ('is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at');
   ```

2. **Comments load without errors** in the application

3. **Comment serialization works** (check API responses)

## Rollback Plan

If issues occur, you can rollback using:

```bash
python -m flask db downgrade
```

This will remove the added columns.

## Environment Variables

Ensure these are set on Render:
- `FLASK_CONFIG=production`
- Database connection variables (should already be configured)

## Expected Results

After successful deployment:
- ✅ Comments load without database errors
- ✅ Comment editing tracking is available
- ✅ Soft deletion functionality is available
- ✅ All existing comments have default values for new fields
- ✅ No data loss occurs

## Troubleshooting

**Error: "column already exists"**
- The migration includes checks for existing columns
- This should not occur with the updated migration

**Error: "relation does not exist"**
- Ensure the `comments` table exists
- Check database connection

**Error: "permission denied"**
- Ensure the database user has ALTER TABLE permissions

## Support

If issues occur during deployment:
1. Check the Render logs for detailed error messages
2. Verify database connectivity
3. Ensure all migration files are present in the deployment
4. Use the temporary fix as a fallback if needed

## Post-Deployment

After successful deployment:
1. Test comment functionality thoroughly
2. Verify that edit tracking works
3. Test soft deletion if implemented
4. Monitor for any performance impacts
5. Clean up temporary deployment files if desired

---

**Note**: This migration is designed to be safe and non-destructive. All existing comment data will be preserved with appropriate default values for the new tracking fields.