"""Add comment tracking fields

Revision ID: 09c5a19621ad
Revises: 
Create Date: 2025-07-27 15:55:09.103101

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '09c5a19621ad'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to comments table with error handling for existing columns
    connection = op.get_bind()
    
    # Check which columns already exist
    result = connection.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name IN ('is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at')
    """))
    existing_columns = {row[0] for row in result}
    
    # Add columns only if they don't exist
    if 'is_edited' not in existing_columns:
        op.add_column('comments', sa.Column('is_edited', sa.Boolean(), nullable=False, server_default='false'))
    
    if 'edit_count' not in existing_columns:
        op.add_column('comments', sa.Column('edit_count', sa.Integer(), nullable=False, server_default='0'))
    
    if 'last_edited_at' not in existing_columns:
        op.add_column('comments', sa.Column('last_edited_at', sa.DateTime(), nullable=True))
    
    if 'is_deleted' not in existing_columns:
        op.add_column('comments', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    
    if 'deleted_at' not in existing_columns:
        op.add_column('comments', sa.Column('deleted_at', sa.DateTime(), nullable=True))


def downgrade():
    # Remove columns if rollback is needed
    op.drop_column('comments', 'deleted_at')
    op.drop_column('comments', 'is_deleted')
    op.drop_column('comments', 'last_edited_at')
    op.drop_column('comments', 'edit_count')
    op.drop_column('comments', 'is_edited')
