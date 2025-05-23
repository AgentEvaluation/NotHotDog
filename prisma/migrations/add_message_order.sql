-- Add message_order column with SERIAL (auto-increment)
ALTER TABLE conversation_messages 
ADD COLUMN IF NOT EXISTS message_order SERIAL;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_conversation_messages_order 
ON conversation_messages(conversation_id, message_order);

-- Update existing messages to have proper order based on created_at
WITH ordered_messages AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at) as new_order
  FROM conversation_messages
)
UPDATE conversation_messages cm
SET message_order = om.new_order
FROM ordered_messages om
WHERE cm.id = om.id;