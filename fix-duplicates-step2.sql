-- Step 2: Now add the unique constraint (run this AFTER step 1)
ALTER TABLE journal_entries 
ADD CONSTRAINT unique_user_entry 
UNIQUE (user_id, local_created_at);
