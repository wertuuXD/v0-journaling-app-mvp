-- Step 1: Delete ALL duplicate entries first (keep only one per user+timestamp)
DELETE FROM journal_entries a USING journal_entries b
WHERE a.ctid < b.ctid  -- Delete older row, keep newer
  AND a.user_id = b.user_id 
  AND a.local_created_at = b.local_created_at;
