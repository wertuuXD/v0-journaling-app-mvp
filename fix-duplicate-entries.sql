-- Fix duplicate entries by adding unique constraint
-- This prevents the same entry from being backed up multiple times

-- Add unique constraint on user_id + local_created_at
-- (Same user, same timestamp = same entry)
ALTER TABLE journal_entries 
ADD CONSTRAINT unique_user_entry 
UNIQUE (user_id, local_created_at);

-- Delete existing duplicates (keep the newest)
DELETE FROM journal_entries a USING journal_entries b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.local_created_at = b.local_created_at;
