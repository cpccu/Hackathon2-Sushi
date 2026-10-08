-- Phase 6: Complaint System Schema

-- 1. Complaints Table (anonymous — no user_id stored)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'academic', 'facilities', 'general', 'transport', 'hostel', 'other'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Complaint Attachments Table
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Complaint Responses Table (helpdesk_admin only, immutable)
CREATE TABLE IF NOT EXISTS complaint_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    responded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_id ON complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_responses_complaint_id ON complaint_responses(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_responses_responded_by ON complaint_responses(responded_by);
