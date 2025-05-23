-- Remove is_correct column from conversation_messages
-- Validation is done at conversation level, not message level
ALTER TABLE conversation_messages 
DROP COLUMN IF EXISTS is_correct;