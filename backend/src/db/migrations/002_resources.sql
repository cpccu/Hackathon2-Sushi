-- Phase 2: Resource Sharing Schema

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50),
    description TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester VARCHAR(20) NOT NULL CHECK (semester IN ('Spring', 'Summer', 'Fall')),
    department VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Mid Question',
        'Final Question',
        'Class Test',
        'Class Notes',
        'Slides',
        'Assignment',
        'Lab',
        'Other'
    )),
    optional_note TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_year ON resources(year);
CREATE INDEX IF NOT EXISTS idx_resources_semester ON resources(semester);
CREATE INDEX IF NOT EXISTS idx_resources_department ON resources(department);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- Resource Documents table
CREATE TABLE IF NOT EXISTS resource_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_docs_resource_id ON resource_documents(resource_id);

-- Resource Votes table
CREATE TABLE IF NOT EXISTS resource_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_votes_resource_id ON resource_votes(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_votes_user_id ON resource_votes(user_id);
