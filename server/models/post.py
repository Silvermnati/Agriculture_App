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
    related_crops = db.Column(ARRAY(db.Integer), nullable=True)  # Array of crop_ids
    related_livestock = db.Column(ARRAY(db.Integer), nullable=True)  # Array of livestock_ids
    applicable_locations = db.Column(ARRAY(db.Integer), nullable=True)  # Array of location_ids
    season_relevance = db.Column(db.String(50), nullable=True)  # spring, summer, fall, winter, year-round
    
    # Post metadata
    status = db.Column(db.String(20), default='draft')  # draft, published, archived
    view_count = db.Column(db.Integer, default=0)
    read_time = db.Column(db.Integer, nullable=True)  # estimated read time in minutes
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
    
    def to_dict(self, include_content=True):
        """Convert post to dictionary."""
        post_dict = {
            'post_id': str(self.post_id),
            'title': self.title,
            'excerpt': self.excerpt,
            'author': {
                'user_id': str(self.author.user_id),
                'name': f"{self.author.first_name} {self.author.last_name}",
                'avatar_url': self.author.avatar_url
            } if self.author else None,
            'category': self.category.to_dict() if self.category else None,
            'featured_image_url': self.featured_image_url,
            'related_crops': self.related_crops,
            'related_livestock': self.related_livestock,
            'season_relevance': self.season_relevance,
            'status': self.status,
            'view_count': self.view_count,
            'read_time': self.read_time,
            'is_featured': self.is_featured,
            'tags': [tag.to_dict() for tag in self.tags],
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    post = db.relationship('Post', backref=db.backref('comments', lazy=True))
    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    parent_comment = db.relationship('Comment', remote_side=[comment_id], backref=db.backref('replies', lazy=True))
    
    def to_dict(self):
        """Convert comment to dictionary."""
        return {
            'comment_id': str(self.comment_id),
            'content': self.content,
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url
            } if self.user else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'replies': [reply.to_dict() for reply in self.replies] if hasattr(self, 'replies') else []
        }


class PostLike(db.Model):
    """Post like model."""
    __tablename__ = 'post_likes'
    
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('posts.post_id'), primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    post = db.relationship('Post', backref=db.backref('likes', lazy=True))
    user = db.relationship('User', backref=db.backref('post_likes', lazy=True))