-- Add cascade deletes to prevent orphaned records

-- Drop existing foreign key constraints
ALTER TABLE agent_headers DROP CONSTRAINT IF EXISTS agent_headers_config_id_fkey;
ALTER TABLE agent_descriptions DROP CONSTRAINT IF EXISTS agent_descriptions_agent_id_fkey;
ALTER TABLE agent_user_descriptions DROP CONSTRAINT IF EXISTS agent_user_descriptions_agent_id_fkey;
ALTER TABLE validation_rules DROP CONSTRAINT IF EXISTS validation_rules_config_id_fkey;
ALTER TABLE agent_outputs DROP CONSTRAINT IF EXISTS agent_outputs_agent_id_fkey;
ALTER TABLE agent_persona_mappings DROP CONSTRAINT IF EXISTS config_persona_mappings_config_id_fkey;
ALTER TABLE test_runs DROP CONSTRAINT IF EXISTS test_runs_config_id_fkey;
ALTER TABLE test_scenarios DROP CONSTRAINT IF EXISTS test_scenarios_config_id_fkey;
ALTER TABLE test_conversations DROP CONSTRAINT IF EXISTS test_conversations_persona_id_fkey;
ALTER TABLE test_conversations DROP CONSTRAINT IF EXISTS test_conversations_run_id_fkey;
ALTER TABLE test_conversations DROP CONSTRAINT IF EXISTS test_conversations_scenario_id_fkey;
ALTER TABLE conversation_messages DROP CONSTRAINT IF EXISTS conversation_messages_conversation_id_fkey;

-- Re-add constraints with CASCADE DELETE
ALTER TABLE agent_headers 
  ADD CONSTRAINT agent_headers_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE agent_descriptions 
  ADD CONSTRAINT agent_descriptions_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE agent_user_descriptions 
  ADD CONSTRAINT agent_user_descriptions_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE validation_rules 
  ADD CONSTRAINT validation_rules_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE agent_outputs 
  ADD CONSTRAINT agent_outputs_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE agent_persona_mappings 
  ADD CONSTRAINT agent_persona_mappings_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE test_runs 
  ADD CONSTRAINT test_runs_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE test_scenarios 
  ADD CONSTRAINT test_scenarios_agent_id_fkey 
  FOREIGN KEY (agent_id) REFERENCES agent_configs(id) ON DELETE CASCADE;

ALTER TABLE test_conversations 
  ADD CONSTRAINT test_conversations_run_id_fkey 
  FOREIGN KEY (run_id) REFERENCES test_runs(id) ON DELETE CASCADE;

ALTER TABLE conversation_messages 
  ADD CONSTRAINT conversation_messages_conversation_id_fkey 
  FOREIGN KEY (conversation_id) REFERENCES test_conversations(id) ON DELETE CASCADE;