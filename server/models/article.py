from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from server.database import db
from server.models.post import Tag

# Association table for article tags
article_tags = db.Table('article_tags',
    db.Column('article_id', UUID(as_uuid=True), db.ForeignKey('articles.article_id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.tag_id'), primary_key=True)
)

class Article(db.Model):
    """Article model for agricultural knowledge base."""
    __tablename__ = 'articles'
    
    article_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    author_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))
    featured_image_url = db.Column(db.String(255))
    
    # Agricultural context
    related_crops = db.Column(ARRAY(db.Integer))  # Array of crop_ids
    related_livestock = db.Column(ARRAY(db.Integer))  # Array of livestock_ids
    applicable_locations = db.Column(ARRAY(db.Integer))  # Array of location_ids
    season_relevance = db.Column(db.String(50))  # spring, summer, fall, winter, year-round
    
    # Article metadata
    status = db.Column(db.String(20), default='draft')  # draft, published, archived
    view_count = db.Column(db.Integer, default=0)
    read_time = db.Column(db.Integer)  # estimated read time in minutes
    is_featured = db.Column(db.Boolean, default=False)
    
    # Timestamps
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = db.relationship('User', backref=db.backref('articles', lazy=True))
    category = db.relationship('Category', backref=db.backref('articles', lazy=True))
    tags = db.relationship('Tag', secondary=article_tags, backref=db.backref('articles', lazy=True))
    
    def to_dict(self):
        """Convert article to dictionary."""
        return {
            'article_id': str(self.article_id),
            'title': self.title,
            'content': self.content,
            'excerpt': self.excerpt,
            'author': {
                'user_id': str(self.author.user_id),
                'name': f"{self.author.first_name} {self.author.last_name}",
                'avatar_url': self.author.avatar_url
            } if self.author else None,
            'category': {
                'category_id': self.category.category_id,
                'name': self.category.name
            } if self.category else None,
            'featured_image_url': self.featured_image_url,
            'related_crops': self.related_crops,
            'related_livestock': self.related_livestock,
            'applicable_locations': self.applicable_locations,
            'season_relevance': self.season_relevance,
            'status': self.status,
            'view_count': self.view_count,
            'read_time': self.read_time,
            'is_featured': self.is_featured,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'tags': [tag.name for tag in self.tags] if hasattr(self, 'tags') else []
        }