-- Check if there are any messages in the database
SELECT COUNT(*) as message_count FROM conversation_messages;

-- Check recent messages
SELECT 
    cm.id,
    cm.conversation_id,
    cm.role,
    cm.created_at,
    tc.run_id,
    tc.status as conversation_status
FROM conversation_messages cm
JOIN test_conversations tc ON cm.conversation_id = tc.id
ORDER BY cm.created_at DESC
LIMIT 10;

-- Check if there are orphaned conversations
SELECT 
    tc.id,
    tc.status,
    tc.created_at,
    COUNT(cm.id) as message_count
FROM test_conversations tc
LEFT JOIN conversation_messages cm ON cm.conversation_id = tc.id
GROUP BY tc.id, tc.status, tc.created_at
ORDER BY tc.created_at DESC
LIMIT 20;