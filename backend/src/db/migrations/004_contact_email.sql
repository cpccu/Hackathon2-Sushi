-- Add contact_email to lost_found_posts if not exists
ALTER TABLE lost_found_posts ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
