from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from server.database import db

class Category(db.Model):
    """Category model for posts."""
    __tablename__ = 'categories'
    
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    icon_url = db.Column(db.String(255), nullable=True)
    parent_category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'), nullable=True)
    is_agricultural_specific = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent_category = db.relationship('Category', remote_side=[category_id], backref='subcategories')
    
    def to_dict(self):
        """Convert category to dictionary."""
        return {
            'category_id': self.category_id,
            'name': self.name,
            'description': self.description,
            'icon_url': self.icon_url,
            'is_agricultural_specific': self.is_agricultural_specific
        }


class Tag(db.Model):
    """Tag model for posts."""
    __tablename__ = 'tags'
    
    tag_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=True)  # crop, technique, season, problem, solution
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert tag to dictionary."""
        return {
            'tag_id': self.tag_id,
            'name': self.name,
            'category': self.category
        }


# Association table for post tags
post_tags = db.Table('post_tags',
    db.Column('post_id', UUID(as_uuid=True), db.ForeignKey('posts.post_id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.tag_id'), primary_key=True)
)
########################################################################

class Post(db.Model):
    """Post model with agricultural context."""
    __tablename__ = 'posts'
    
    post_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text, nullable=True)
    author_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'), nullable=True)
    featured_image_url = db.Column(db.String(255), nullable=True)
    
    # Agricultural context
    season_relevance = db.Column(db.String(50), nullable=True)
    applicable_locations = db.Column(ARRAY(db.String), nullable=True)
    related_crops = db.Column(ARRAY(db.String), nullable=True)
    
    # Post metadata
    status = db.Column(db.String(20), default='draft')  # draft, published, archived
    view_count = db.Column(db.Integer, default=0)
    read_time = db.Column(db.Integer, nullable=True)
    is_featured = db.Column(db.Boolean, default=False)
    language = db.Column(db.String(10), default='en')
    
    # Timestamps
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = db.relationship('User', backref=db.backref('posts', lazy=True))
    category = db.relationship('Category', backref=db.backref('posts', lazy=True))
    tags = db.relationship('Tag', secondary=post_tags, backref=db.backref('posts', lazy=True))
    
    def to_dict(self, include_content=True, **kwargs):
        author_info = { 'name': 'Unknown Author', 'avatar_url': None, 'role': None }
        if self.author:
            author_info['name'] = f"{self.author.first_name} {self.author.last_name}"
            # Use relative path for avatar, let the frontend handle the base URL
            if self.author.avatar_url:
                author_info['avatar_url'] = self.author.avatar_url
            else:
                author_info['avatar_url'] = None  # Let frontend use fallback
            author_info['role'] = self.author.role

        # Fix featured image URL to use full path
        featured_image_url = None
        if self.featured_image_url:
            if self.featured_image_url.startswith('http'):
                featured_image_url = self.featured_image_url
            else:
                # Use relative path for uploads, let the frontend handle the base URL
                featured_image_url = self.featured_image_url

        post_dict = {
            'id': str(self.post_id), # Keep 'id' for frontend convenience
            'post_id': str(self.post_id), # Keep 'post_id' for backend consistency
            'title': self.title,
            'excerpt': self.excerpt,
            'featured_image_url': featured_image_url,
            'author': author_info,
            'category': self.category.to_dict() if self.category else None,
            'related_crops': self.related_crops or [],
            'applicable_locations': self.applicable_locations or [],
            'season_relevance': self.season_relevance,
            'view_count': self.view_count,
            'comment_count': kwargs.get('comment_count', 0),
            'like_count': kwargs.get('like_count', 0),
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'tags': [tag.name for tag in self.tags],
            'read_time': self.read_time
        }

        if include_content:
            post_dict['content'] = self.content

        return post_dict


class Comment(db.Model):
    """Comment model for posts."""
    __tablename__ = 'comments'
    
    comment_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('posts.post_id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    parent_comment_id = db.Column(UUID(as_uuid=True), db.ForeignKey('comments.comment_id'), nullable=True)
    content = db.Column(db.Text, nullable=False)
    is_approved = db.Column(db.Boolean, default=True)
    # Edit tracking fields
    is_edited = db.Column(db.Boolean, default=False, nullable=False)
    edit_count = db.Column(db.Integer, default=0, nullable=False)
    last_edited_at = db.Column(db.DateTime, nullable=True)
    # Soft deletion fields
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    post = db.relationship('Post', backref=db.backref('comments', lazy=True))
    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    parent_comment = db.relationship('Comment', remote_side=[comment_id], backref=db.backref('replies', lazy=True))
    
    def to_dict(self, include_replies=True):
        """Convert comment to dictionary."""
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
        
        return comment_dict


class ArticlePostLike(db.Model):
    """Article post like model."""
    __tablename__ = 'article_post_likes'
    
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('posts.post_id'), primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    post = db.relationship('Post', backref=db.backref('likes', lazy=True))
    user = db.relationship('User', backref=db.backref('article_likes', lazy=True))


class CommentEdit(db.Model):
    """Comment edit history model."""
    __tablename__ = 'comment_edits'
    
    edit_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comment_id = db.Column(UUID(as_uuid=True), db.ForeignKey('comments.comment_id'), nullable=False)
    original_content = db.Column(db.Text, nullable=False)
    new_content = db.Column(db.Text, nullable=False)
    edited_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    edit_reason = db.Column(db.String(255), nullable=True)
    edited_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    comment = db.relationship('Comment', backref=db.backref('edit_history', lazy=True))
    editor = db.relationship('User', backref=db.backref('comment_edits', lazy=True))
    
    def to_dict(self):
        """Convert comment edit to dictionary."""
        return {
            'edit_id': str(self.edit_id),
            'comment_id': str(self.comment_id),
            'original_content': self.original_content,
            'new_content': self.new_content,
            'edited_by': str(self.edited_by),
            'editor': {
                'user_id': str(self.editor.user_id),
                'name': f"{self.editor.first_name} {self.editor.last_name}",
                'avatar_url': self.editor.avatar_url
            } if self.editor else None,
            'edit_reason': self.edit_reason,
            'edited_at': self.edited_at.isoformat()
        }
    
    def __repr__(self):
        return f'<CommentEdit {self.edit_id} - {self.comment_id}>'