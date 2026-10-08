-- Phase 5: Smart Helpdesk Schema

-- 1. Extend user roles to support 'helpdesk_admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'club_admin', 'helpdesk_admin'));

-- 2. Helpdesk Posts Table
CREATE TABLE IF NOT EXISTS helpdesk_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('academic', 'facilities')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    last_updated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Helpdesk Attachments Table
CREATE TABLE IF NOT EXISTS helpdesk_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES helpdesk_posts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Search and filter indexes
CREATE INDEX IF NOT EXISTS idx_helpdesk_post_type ON helpdesk_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_helpdesk_created_at ON helpdesk_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_helpdesk_updated_at ON helpdesk_posts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_helpdesk_keywords ON helpdesk_posts USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_helpdesk_title ON helpdesk_posts(title);
CREATE INDEX IF NOT EXISTS idx_helpdesk_attachments_post_id ON helpdesk_attachments(post_id);
