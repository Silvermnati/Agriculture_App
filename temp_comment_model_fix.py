#!/usr/bin/env python3
"""
Temporary fix for Comment model to handle missing database fields
This can be used as a hotfix while the migration is being deployed
"""
import os

def apply_temporary_fix():
    """Apply temporary fix to Comment model to handle missing fields"""
    print("🔧 Applying temporary fix to Comment model...")
    
    model_file = "server/models/post.py"
    
    # Read the current file
    with open(model_file, 'r') as f:
        content = f.read()
    
    # Check if the fix is already applied
    if 'getattr(self, \'is_edited\'' in content:
        print("✅ Temporary fix already applied")
        return True
    
    # Apply the temporary fix to to_dict method
    old_to_dict = """    def to_dict(self, include_replies=True):
        \"\"\"Convert comment to dictionary.\"\"\"
        comment_dict = {
            'comment_id': str(self.comment_id),
            'parent_comment_id': str(self.parent_comment_id) if self.parent_comment_id else None,
            'content': self.content,
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url
            } if self.user else None,
            'is_edited': self.is_edited,
            'edit_count': self.edit_count,
            'last_edited_at': self.last_edited_at.isoformat() if self.last_edited_at else None,
            'is_deleted': self.is_deleted,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_replies:
            comment_dict['replies'] = [reply.to_dict() for reply in self.replies]
        
        return comment_dict"""
    
    new_to_dict = """    def to_dict(self, include_replies=True):
        \"\"\"Convert comment to dictionary.\"\"\"
        comment_dict = {
            'comment_id': str(self.comment_id),
            'parent_comment_id': str(self.parent_comment_id) if self.parent_comment_id else None,
            'content': self.content,
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url
            } if self.user else None,
            'is_edited': getattr(self, 'is_edited', False),
            'edit_count': getattr(self, 'edit_count', 0),
            'last_edited_at': self.last_edited_at.isoformat() if hasattr(self, 'last_edited_at') and self.last_edited_at else None,
            'is_deleted': getattr(self, 'is_deleted', False),
            'deleted_at': self.deleted_at.isoformat() if hasattr(self, 'deleted_at') and self.deleted_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_replies:
            comment_dict['replies'] = [reply.to_dict() for reply in self.replies] if hasattr(self, 'replies') else []
        
        return comment_dict"""
    
    # Comment out the field definitions temporarily
    old_fields = """    # Edit tracking fields
    is_edited = db.Column(db.Boolean, default=False, nullable=False)
    edit_count = db.Column(db.Integer, default=0, nullable=False)
    last_edited_at = db.Column(db.DateTime, nullable=True)
    # Soft deletion fields
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)"""
    
    new_fields = """    # Edit tracking fields (temporarily commented out until migration is applied)
    # is_edited = db.Column(db.Boolean, default=False, nullable=False)
    # edit_count = db.Column(db.Integer, default=0, nullable=False)
    # last_edited_at = db.Column(db.DateTime, nullable=True)
    # Soft deletion fields (temporarily commented out until migration is applied)
    # is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    # deleted_at = db.Column(db.DateTime, nullable=True)"""
    
    # Apply the fixes
    if old_to_dict in content and old_fields in content:
        content = content.replace(old_to_dict, new_to_dict)
        content = content.replace(old_fields, new_fields)
        
        # Write the updated content
        with open(model_file, 'w') as f:
            f.write(content)
        
        print("✅ Temporary fix applied successfully")
        print("⚠️  Remember to run the migration and then revert this fix!")
        return True
    else:
        print("❌ Could not apply temporary fix - file structure may have changed")
        return False

def revert_temporary_fix():
    """Revert the temporary fix after migration is complete"""
    print("🔄 Reverting temporary fix...")
    
    model_file = "server/models/post.py"
    
    # Read the current file
    with open(model_file, 'r') as f:
        content = f.read()
    
    # Check if the fix needs to be reverted
    if 'getattr(self, \'is_edited\'' not in content:
        print("✅ No temporary fix to revert")
        return True
    
    # Revert the to_dict method
    temp_to_dict = """    def to_dict(self, include_replies=True):
        \"\"\"Convert comment to dictionary.\"\"\"
        comment_dict = {
            'comment_id': str(self.comment_id),
            'parent_comment_id': str(self.parent_comment_id) if self.parent_comment_id else None,
            'content': self.content,
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url
            } if self.user else None,
            'is_edited': getattr(self, 'is_edited', False),
            'edit_count': getattr(self, 'edit_count', 0),
            'last_edited_at': self.last_edited_at.isoformat() if hasattr(self, 'last_edited_at') and self.last_edited_at else None,
            'is_deleted': getattr(self, 'is_deleted', False),
            'deleted_at': self.deleted_at.isoformat() if hasattr(self, 'deleted_at') and self.deleted_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_replies:
            comment_dict['replies'] = [reply.to_dict() for reply in self.replies] if hasattr(self, 'replies') else []
        
        return comment_dict"""
    
    final_to_dict = """    def to_dict(self, include_replies=True):
        \"\"\"Convert comment to dictionary.\"\"\"
        comment_dict = {
            'comment_id': str(self.comment_id),
            'parent_comment_id': str(self.parent_comment_id) if self.parent_comment_id else None,
            'content': self.content,
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url
            } if self.user else None,
            'is_edited': self.is_edited,
            'edit_count': self.edit_count,
            'last_edited_at': self.last_edited_at.isoformat() if self.last_edited_at else None,
            'is_deleted': self.is_deleted,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_replies:
            comment_dict['replies'] = [reply.to_dict() for reply in self.replies]
        
        return comment_dict"""
    
    # Uncomment the field definitions
    temp_fields = """    # Edit tracking fields (temporarily commented out until migration is applied)
    # is_edited = db.Column(db.Boolean, default=False, nullable=False)
    # edit_count = db.Column(db.Integer, default=0, nullable=False)
    # last_edited_at = db.Column(db.DateTime, nullable=True)
    # Soft deletion fields (temporarily commented out until migration is applied)
    # is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    # deleted_at = db.Column(db.DateTime, nullable=True)"""
    
    final_fields = """    # Edit tracking fields
    is_edited = db.Column(db.Boolean, default=False, nullable=False)
    edit_count = db.Column(db.Integer, default=0, nullable=False)
    last_edited_at = db.Column(db.DateTime, nullable=True)
    # Soft deletion fields
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)"""
    
    # Apply the reverts
    if temp_to_dict in content:
        content = content.replace(temp_to_dict, final_to_dict)
    
    if temp_fields in content:
        content = content.replace(temp_fields, final_fields)
    
    # Write the updated content
    with open(model_file, 'w') as f:
        f.write(content)
    
    print("✅ Temporary fix reverted successfully")
    print("✅ Comment model now uses direct field access")
    return True

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "revert":
        success = revert_temporary_fix()
    else:
        success = apply_temporary_fix()
    
    sys.exit(0 if success else 1)