-- Phase 3: Lost & Found Schema

CREATE TABLE IF NOT EXISTS lost_found_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('lost', 'found')),
    item_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    location VARCHAR(255) NOT NULL,
    incident_date DATE NOT NULL,
    contact_phone VARCHAR(50),
    
    images TEXT[] NOT NULL CHECK (cardinality(images) >= 1 AND cardinality(images) <= 3),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search and filter indexes
CREATE INDEX IF NOT EXISTS idx_lf_posts_user_id ON lost_found_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_lf_posts_post_type ON lost_found_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_lf_posts_status ON lost_found_posts(status);
CREATE INDEX IF NOT EXISTS idx_lf_posts_incident_date ON lost_found_posts(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_lf_posts_created_at ON lost_found_posts(created_at DESC);

-- GIN index for quick keyword lookups
CREATE INDEX IF NOT EXISTS idx_lf_posts_keywords ON lost_found_posts USING GIN (keywords);

-- Text search indexes for name and location
CREATE INDEX IF NOT EXISTS idx_lf_posts_item_name ON lost_found_posts(item_name);
CREATE INDEX IF NOT EXISTS idx_lf_posts_location ON lost_found_posts(location);
