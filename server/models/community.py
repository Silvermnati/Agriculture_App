from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from server.database import db

class Community(db.Model):
    """Community model with agricultural context."""
    __tablename__ = 'communities'
    
    community_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    community_type = db.Column(db.String(50), nullable=False)  # Regional, Crop-Specific, Urban, Professional
    focus_crops = db.Column(ARRAY(db.String), nullable=True)
    location_city = db.Column(db.String(100), nullable=True)
    location_country = db.Column(db.String(100), nullable=False)
    is_private = db.Column(db.Boolean, default=False)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref=db.backref('created_communities', lazy=True))
    
    def to_dict(self):
        """Convert community to dictionary."""
        return {
            'community_id': str(self.community_id),
            'name': self.name,
            'description': self.description,
            'community_type': self.community_type,
            'focus_crops': self.focus_crops,
            'location': {
                'city': self.location_city,
                'country': self.location_country
            },
            'is_private': self.is_private,
            'created_by': str(self.created_by),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CommunityMember(db.Model):
    """Community member model."""
    __tablename__ = 'community_members'
    
    community_id = db.Column(UUID(as_uuid=True), db.ForeignKey('communities.community_id'), primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), primary_key=True)
    role = db.Column(db.String(20), default='member')  # admin, moderator, member
    status = db.Column(db.String(20), default='active')  # active, pending, banned
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    community = db.relationship('Community', backref=db.backref('members', lazy=True))
    user = db.relationship('User', backref=db.backref('communities', lazy=True))
    
    def to_dict(self):
        """Convert community member to dictionary."""
        return {
            'community_id': str(self.community_id),
            'user_id': str(self.user_id),
            'role': self.role,
            'status': self.status,
            'joined_at': self.joined_at.isoformat()
        }


class CommunityPost(db.Model):
    """Community post model."""
    __tablename__ = 'community_posts'
    
    post_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    community_id = db.Column(UUID(as_uuid=True), db.ForeignKey('communities.community_id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    community = db.relationship('Community', backref=db.backref('posts', lazy=True))
    user = db.relationship('User', backref=db.backref('community_posts', lazy=True))
    
    def to_dict(self, include_likes=False, include_comments=False):
        """Convert community post to dictionary."""
        post_dict = {
            'post_id': str(self.post_id),
            'community_id': str(self.community_id),
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url,
                'role': self.user.role
            } if self.user else None,
            'content': self.content,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'like_count': PostLike.query.filter_by(post_id=self.post_id).count(),
            'comment_count': PostComment.query.filter_by(post_id=self.post_id).count()
        }
        
        if include_likes:
            likes = PostLike.query.filter_by(post_id=self.post_id).all()
            post_dict['likes'] = [like.to_dict() for like in likes]
            
        if include_comments:
            comments = PostComment.query.filter_by(post_id=self.post_id).order_by(PostComment.created_at).all()
            post_dict['comments'] = [comment.to_dict() for comment in comments]
            
        return post_dict


class PostLike(db.Model):
    """Post like model."""
    __tablename__ = 'post_likes'
    
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('community_posts.post_id'), primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    post = db.relationship('CommunityPost', backref=db.backref('likes', lazy=True))
    user = db.relationship('User', backref=db.backref('post_likes', lazy=True))
    
    def to_dict(self):
        """Convert post like to dictionary."""
        return {
            'post_id': str(self.post_id),
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url
            } if self.user else None,
            'created_at': self.created_at.isoformat()
        }


class PostComment(db.Model):
    """Post comment model."""
    __tablename__ = 'post_comments'
    
    comment_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('community_posts.post_id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    post = db.relationship('CommunityPost', backref=db.backref('comments', lazy=True))
    user = db.relationship('User', backref=db.backref('post_comments', lazy=True))
    
    def to_dict(self):
        """Convert comment to dictionary."""
        return {
            'comment_id': str(self.comment_id),
            'post_id': str(self.post_id),
            'user': {
                'user_id': str(self.user.user_id),
                'name': f"{self.user.first_name} {self.user.last_name}",
                'avatar_url': self.user.avatar_url,
                'role': self.user.role
            } if self.user else None,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_edited': self.created_at != self.updated_at
        }