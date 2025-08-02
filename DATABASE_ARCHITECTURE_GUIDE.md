# Agricultural Super App - Database Architecture Guide

## Overview

The Agricultural Super App uses a PostgreSQL database with a comprehensive schema designed to support a multi-faceted agricultural platform. The database is structured to handle user management, content creation, community features, expert consultations, payments, and real-time notifications.

## Database Design Principles

### 1. **Scalability First**
- UUID primary keys for distributed systems compatibility
- Proper indexing for query performance
- Normalized structure to reduce data redundancy
- Support for horizontal scaling

### 2. **Agricultural Context**
- Domain-specific fields for farming operations
- Location-based data organization
- Crop and livestock management
- Seasonal and climate considerations

### 3. **Flexibility & Extensibility**
- JSON fields for dynamic data (schedules, preferences)
- Array fields for multi-value attributes
- Soft deletion for data preservation
- Audit trails for critical operations

## Core Database Modules

### 1. User Management Module

#### **users** table
The central table managing all platform users with agricultural context.

**Key Features:**
- **Role-based system**: farmer, expert, supplier, researcher, student, admin
- **Agricultural profile**: farm size, experience, farming type
- **Location data**: Both hierarchical (location_id) and simple (country/city)
- **Contact management**: Phone, WhatsApp with verification
- **Media support**: Avatar and cover images

**Important Fields:**
```sql
user_id uuid PRIMARY KEY          -- Unique identifier
role varchar(50)                  -- User type for permissions
farm_size decimal(10,2)          -- Farm size in hectares
farming_experience integer        -- Years of experience
farming_type varchar(50)         -- organic, conventional, mixed
is_verified boolean              -- Account verification status
```

#### **user_expertise** table
Tracks specialized knowledge and certifications.

#### **user_follows** table
Manages expert-follower relationships with notification preferences.

### 2. Location Management Module

#### **countries** → **state_provinces** → **locations**
Three-tier hierarchical location system for precise geographical data.

**Benefits:**
- Supports location-based content filtering
- Enables regional community creation
- Facilitates climate-specific recommendations
- Supports multi-country expansion

### 3. Agricultural Data Module

#### **crops** table
Master data for all supported crops with growing requirements.

**Key Fields:**
```sql
scientific_name varchar(150)     -- Botanical classification
category varchar(50)            -- cereal, vegetable, fruit, etc.
growing_season varchar(50)      -- Planting/harvesting seasons
climate_requirements text       -- Environmental needs
soil_requirements text          -- Soil type preferences
```

#### **user_crops** table
Tracks individual farmer's crop management.

**Features:**
- Planting and harvest date tracking
- Area planted monitoring
- Status tracking (active, harvested, failed)
- Personal notes and observations

### 4. Content Management Module

#### **posts** table
Rich content system with agricultural context.

**Agricultural Features:**
```sql
season_relevance varchar(50)        -- When content is most relevant
applicable_locations text[]         -- Geographic applicability
related_crops text[]                -- Relevant crop types
```

**Content Features:**
- Draft/published workflow
- View count tracking
- Read time estimation
- Featured content system
- Multi-language support

#### **categories** and **tags**
Hierarchical categorization with agricultural-specific taxonomy.

#### **comments** table
Advanced commenting system with:
- Nested replies (parent_comment_id)
- Edit tracking with history
- Soft deletion for moderation
- Approval workflow

### 5. Community Features Module

#### **communities** table
Location and crop-specific community management.

**Community Types:**
- **Regional**: Location-based communities
- **Crop-Specific**: Focused on particular crops
- **Urban**: Urban farming communities
- **Professional**: Expert networks

#### **community_members** table
Role-based membership with status tracking.

**Roles:**
- **admin**: Full community management
- **moderator**: Content moderation
- **member**: Regular participation

#### **community_posts** and related tables
Simplified posting system for community discussions.

### 6. Expert Consultation Module

#### **expert_profiles** table
Comprehensive expert management system.

**Key Features:**
```sql
specialization text[]              -- Array of expertise areas
consultation_rate decimal(10,2)    -- Pricing per session
availability_schedule jsonb        -- Flexible scheduling data
rating decimal(3,2)               -- Average rating
total_consultations integer       -- Experience metric
```

#### **consultations** table
Complete consultation lifecycle management.

**Consultation Types:**
- video, phone, chat, in-person

**Status Flow:**
pending → confirmed → completed/cancelled

#### **expert_reviews** table
Rating and feedback system for quality assurance.

### 7. Payment System Module

#### **payments** table
M-Pesa integration with comprehensive transaction tracking.

**M-Pesa Integration:**
```sql
mpesa_checkout_request_id varchar(255)  -- M-Pesa request tracking
mpesa_transaction_id varchar(255)       -- M-Pesa transaction reference
phone_number varchar(20)                -- Payment phone number
```

**Payment Flow:**
pending → completed/failed/cancelled

### 8. Notification System Module

#### **notifications** table
Comprehensive notification management.

**Notification Types:**
- follow, like, comment, consultation, payment, system

**Multi-channel Delivery:**
```sql
sent_via_email boolean
sent_via_sms boolean  
sent_via_push boolean
```

**Related Entity Tracking:**
Links notifications to users, posts, consultations, payments.

#### **notification_preferences** table
User-specific notification settings with granular control.

## Advanced Features

### 1. **Audit Trail System**
- **comment_edits**: Complete edit history for comments
- Timestamp tracking on all major entities
- Soft deletion with deletion timestamps

### 2. **Performance Optimization**
- Strategic indexing on frequently queried fields
- Composite indexes for complex queries
- Array field indexing using GIN indexes

### 3. **Data Integrity**
- Foreign key constraints for referential integrity
- Unique constraints where appropriate
- Check constraints for data validation

### 4. **Scalability Features**
- UUID primary keys for distributed systems
- Partitioning-ready design
- Minimal cross-table dependencies

## Key Relationships

### **One-to-Many Relationships**
- users → posts (author relationship)
- users → consultations (expert and client)
- communities → community_posts
- posts → comments

### **Many-to-Many Relationships**
- posts ↔ tags (via post_tags junction table)
- communities ↔ users (via community_members)
- users ↔ users (via user_follows for expert following)

### **Self-Referencing Relationships**
- comments → comments (nested replies)
- categories → categories (hierarchical categories)

## Indexing Strategy

### **Primary Indexes**
All tables have UUID or integer primary keys with automatic indexing.

### **Foreign Key Indexes**
All foreign key columns are indexed for join performance.

### **Business Logic Indexes**
```sql
-- User management
users(email) UNIQUE
users(role, is_active)
users(country, city)

-- Content discovery
posts(status, published_at)
posts(author_id, created_at)
posts(category_id, is_featured)

-- Community features
communities(community_type, location_country)
community_posts(community_id, created_at)

-- Expert system
expert_profiles(is_verified, is_available, rating)
consultations(expert_id, status, scheduled_at)

-- Notifications
notifications(user_id, is_read, created_at)
```

### **Array Field Indexes (GIN)**
```sql
expert_profiles(specialization) -- For expertise search
posts(related_crops) -- For crop-specific content
```

## Data Types and Constraints

### **UUID Fields**
All entity primary keys use UUID for:
- Global uniqueness
- Distributed system compatibility
- Security (non-sequential IDs)

### **Array Fields**
PostgreSQL arrays for multi-value attributes:
- `specialization text[]` - Expert specializations
- `related_crops text[]` - Post crop relevance
- `focus_crops text[]` - Community focus areas

### **JSON Fields**
JSONB for flexible, structured data:
- `availability_schedule jsonb` - Expert availability

### **Decimal Fields**
Precise decimal handling for:
- Financial amounts (consultation_rate, payment amounts)
- Measurements (farm_size, coordinates)

## Security Considerations

### **Data Protection**
- Password hashing (handled at application level)
- Sensitive data encryption capabilities
- Audit trail for data changes

### **Access Control**
- Role-based access through user.role field
- Community membership controls
- Expert verification system

### **Data Privacy**
- Soft deletion for user data preservation
- Anonymous review options
- Notification preference controls

## Performance Considerations

### **Query Optimization**
- Proper indexing for common query patterns
- Efficient join strategies
- Pagination support for large datasets

### **Storage Optimization**
- Normalized design to reduce redundancy
- Appropriate data types for storage efficiency
- Archive strategies for old data

## Migration and Maintenance

### **Schema Evolution**
- Flask-Migrate for version control
- Backward compatibility considerations
- Data migration scripts

### **Data Maintenance**
- Regular cleanup of soft-deleted records
- Archive old notifications and logs
- Performance monitoring and optimization

## Future Enhancements

### **Planned Additions**
1. **Chat System**: Real-time messaging tables (already outlined)
2. **Advanced Analytics**: User behavior tracking tables
3. **Marketplace**: Product and transaction tables
4. **Weather Integration**: Weather data and alerts
5. **IoT Integration**: Sensor data and monitoring

### **Scalability Improvements**
1. **Partitioning**: Time-based partitioning for large tables
2. **Read Replicas**: Separate read/write database instances
3. **Caching Layer**: Redis integration for frequently accessed data
4. **Search Engine**: Elasticsearch for advanced search capabilities

## Database Statistics

### **Current Table Count**: 25+ tables
### **Estimated Storage**: 
- Small deployment: < 1GB
- Medium deployment: 1-10GB  
- Large deployment: 10GB+

### **Expected Growth Patterns**:
- **High Growth**: notifications, community_posts, comments
- **Medium Growth**: posts, consultations, payments
- **Low Growth**: users, crops, locations, categories

This database architecture provides a solid foundation for a comprehensive agricultural platform while maintaining flexibility for future enhancements and scalability requirements.