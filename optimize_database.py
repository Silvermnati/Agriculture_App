#!/usr/bin/env python3
"""
Database optimization script for Agricultural Super App.
Adds indexes for better query performance.
"""

from server import create_app
from server.database import db
from sqlalchemy import text
import sys

def create_indexes():
    """Create database indexes for optimal performance."""
    
    indexes = [
        # Article indexes
        "CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);",
        "CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);",
        "CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);",
        "CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);",
        "CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured);",
        "CREATE INDEX IF NOT EXISTS idx_articles_season ON articles(season_relevance);",
        "CREATE INDEX IF NOT EXISTS idx_articles_title_search ON articles USING gin(to_tsvector('english', title));",
        "CREATE INDEX IF NOT EXISTS idx_articles_content_search ON articles USING gin(to_tsvector('english', content));",
        
        # User indexes
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);",
        "CREATE INDEX IF NOT EXISTS idx_users_location_id ON users(location_id);",
        "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);",
        
        # Crop indexes
        "CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(name);",
        "CREATE INDEX IF NOT EXISTS idx_crops_category ON crops(category);",
        "CREATE INDEX IF NOT EXISTS idx_crops_growing_season ON crops(growing_season);",
        "CREATE INDEX IF NOT EXISTS idx_crops_name_search ON crops USING gin(to_tsvector('english', name));",
        
        # User crop indexes
        "CREATE INDEX IF NOT EXISTS idx_user_crops_user_id ON user_crops(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_crops_crop_id ON user_crops(crop_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_crops_season ON user_crops(season);",
        "CREATE INDEX IF NOT EXISTS idx_user_crops_planting_date ON user_crops(planting_date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_user_crops_harvest_date ON user_crops(actual_harvest DESC);",
        
        # Location indexes
        "CREATE INDEX IF NOT EXISTS idx_locations_country_id ON locations(country_id);",
        "CREATE INDEX IF NOT EXISTS idx_locations_state_id ON locations(state_id);",
        "CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);",
        "CREATE INDEX IF NOT EXISTS idx_states_country_id ON states_provinces(country_id);",
        "CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);",
        
        # Category and tag indexes
        "CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);",
        "CREATE INDEX IF NOT EXISTS idx_categories_agricultural ON categories(is_agricultural_specific);",
        "CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);",
        "CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);",
        
        # Expert and consultation indexes
        "CREATE INDEX IF NOT EXISTS idx_expert_profiles_user_id ON expert_profiles(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_expert_profiles_status ON expert_profiles(availability_status);",
        "CREATE INDEX IF NOT EXISTS idx_expert_profiles_hourly_rate ON expert_profiles(hourly_rate);",
        "CREATE INDEX IF NOT EXISTS idx_consultations_farmer_id ON consultations(farmer_id);",
        "CREATE INDEX IF NOT EXISTS idx_consultations_expert_id ON consultations(expert_id);",
        "CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);",
        "CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_date ON consultations(scheduled_date DESC);",
        
        # Review indexes
        "CREATE INDEX IF NOT EXISTS idx_expert_reviews_farmer_id ON expert_reviews(farmer_id);",
        "CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert_id ON expert_reviews(expert_id);",
        "CREATE INDEX IF NOT EXISTS idx_expert_reviews_rating ON expert_reviews(rating DESC);",
        "CREATE INDEX IF NOT EXISTS idx_expert_reviews_created_at ON expert_reviews(created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_expert_reviews_consultation_id ON expert_reviews(consultation_id);",
        
        # Community indexes
        "CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);",
        "CREATE INDEX IF NOT EXISTS idx_communities_type ON communities(community_type);",
        "CREATE INDEX IF NOT EXISTS idx_communities_private ON communities(is_private);",
        "CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);",
        "CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_community_members_role ON community_members(role);",
        "CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON community_posts(community_id);",
        "CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);",
        
        # Post indexes
        "CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);",
        "CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts USING gin(to_tsvector('english', title));",
        "CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('english', content));",
        
        # Comment indexes
        "CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);",
        "CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);",
        "CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);",
        
        # Like indexes
        "CREATE INDEX IF NOT EXISTS idx_article_post_likes_post_id ON article_post_likes(post_id);",
        "CREATE INDEX IF NOT EXISTS idx_article_post_likes_user_id ON article_post_likes(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);",
        "CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);",
        
        # Association table indexes
        "CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);",
        "CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);",
        "CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);",
        "CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);",
        
        # Composite indexes for common query patterns
        "CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON articles(status, published_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_articles_author_status ON articles(author_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_articles_category_status ON articles(category_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_user_crops_user_season ON user_crops(user_id, season);",
        "CREATE INDEX IF NOT EXISTS idx_consultations_expert_status ON consultations(expert_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_consultations_farmer_status ON consultations(farmer_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert_rating ON expert_reviews(expert_id, rating DESC);",
        "CREATE INDEX IF NOT EXISTS idx_community_posts_community_created ON community_posts(community_id, created_at DESC);",
    ]
    
    print("🔧 Creating database indexes for optimal performance...")
    
    success_count = 0
    error_count = 0
    
    for index_sql in indexes:
        try:
            db.session.execute(text(index_sql))
            success_count += 1
            print(f"✅ Created index: {index_sql.split('idx_')[1].split(' ')[0] if 'idx_' in index_sql else 'unnamed'}")
        except Exception as e:
            error_count += 1
            print(f"⚠️  Warning creating index: {str(e)}")
    
    try:
        db.session.commit()
        print(f"\n🎉 Database optimization completed!")
        print(f"✅ Successfully created: {success_count} indexes")
        if error_count > 0:
            print(f"⚠️  Warnings: {error_count} indexes")
        print("\n📊 Performance improvements:")
        print("- Faster article searches and filtering")
        print("- Optimized user and crop queries")
        print("- Improved location-based lookups")
        print("- Enhanced consultation and review queries")
        print("- Better community and post performance")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error committing indexes: {str(e)}")
        return False
    
    return True

def analyze_query_performance():
    """Analyze query performance and suggest optimizations."""
    
    print("\n📈 Analyzing query performance...")
    
    # Common queries to analyze
    queries = [
        ("Article list query", """
            SELECT a.article_id, a.title, a.view_count, u.first_name, u.last_name, c.name as category_name
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.user_id
            LEFT JOIN categories c ON a.category_id = c.category_id
            WHERE a.status = 'published'
            ORDER BY a.published_at DESC
            LIMIT 10;
        """),
        
        ("User crops by season", """
            SELECT uc.user_crop_id, uc.area_planted, cr.name as crop_name
            FROM user_crops uc
            JOIN crops cr ON uc.crop_id = cr.crop_id
            WHERE uc.user_id = (SELECT user_id FROM users LIMIT 1)
            AND uc.season = 'spring'
            ORDER BY uc.planting_date DESC;
        """),
        
        ("Expert reviews with rating", """
            SELECT er.review_id, er.rating, er.review_text, u.first_name, u.last_name
            FROM expert_reviews er
            JOIN users u ON er.farmer_id = u.user_id
            WHERE er.expert_id = (SELECT expert_id FROM expert_profiles LIMIT 1)
            ORDER BY er.rating DESC, er.created_at DESC;
        """),
        
        ("Community posts by activity", """
            SELECT cp.post_id, cp.content, u.first_name, u.last_name, c.name as community_name
            FROM community_posts cp
            JOIN users u ON cp.user_id = u.user_id
            JOIN communities c ON cp.community_id = c.community_id
            WHERE c.is_private = false
            ORDER BY cp.created_at DESC
            LIMIT 20;
        """)
    ]
    
    for query_name, query_sql in queries:
        try:
            # Use EXPLAIN ANALYZE to get query performance
            explain_query = f"EXPLAIN ANALYZE {query_sql}"
            result = db.session.execute(text(explain_query))
            
            print(f"\n📊 {query_name}:")
            for row in result:
                if 'cost=' in str(row[0]) or 'Time:' in str(row[0]):
                    print(f"   {row[0]}")
                    
        except Exception as e:
            print(f"⚠️  Could not analyze {query_name}: {str(e)}")

def main():
    """Main function to run database optimization."""
    
    print("🚀 Starting database optimization for Agricultural Super App")
    print("=" * 60)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        try:
            # Test database connection
            db.session.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            
            # Create indexes
            if create_indexes():
                print("\n🔍 Running query performance analysis...")
                analyze_query_performance()
                
                print("\n" + "=" * 60)
                print("🎯 Optimization recommendations:")
                print("1. Monitor slow query log for additional optimization opportunities")
                print("2. Consider partitioning large tables by date if they grow significantly")
                print("3. Regularly update table statistics with ANALYZE command")
                print("4. Monitor index usage and remove unused indexes")
                print("5. Consider materialized views for complex reporting queries")
                
            else:
                print("❌ Database optimization failed")
                sys.exit(1)
                
        except Exception as e:
            print(f"❌ Database optimization error: {str(e)}")
            sys.exit(1)
    
    print("\n✨ Database optimization completed successfully!")

if __name__ == "__main__":
    main()