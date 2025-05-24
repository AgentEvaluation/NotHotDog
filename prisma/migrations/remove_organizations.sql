-- Remove organization-related tables and columns for community edition

-- Drop foreign key constraints first
ALTER TABLE agent_configs DROP CONSTRAINT IF EXISTS agent_configs_org_id_fkey;
ALTER TABLE agent_configs DROP CONSTRAINT IF EXISTS agent_configs_created_by_fkey;
ALTER TABLE personas DROP CONSTRAINT IF EXISTS personas_org_id_fkey;
ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_org_id_fkey;
ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_created_by_fkey;
ALTER TABLE test_runs DROP CONSTRAINT IF EXISTS test_runs_created_by_fkey;

-- Drop org_id columns
ALTER TABLE agent_configs DROP COLUMN IF EXISTS org_id;
ALTER TABLE agent_configs DROP COLUMN IF EXISTS created_by;
ALTER TABLE personas DROP COLUMN IF EXISTS org_id;
ALTER TABLE metrics DROP COLUMN IF EXISTS org_id;
ALTER TABLE metrics DROP COLUMN IF EXISTS created_by;
ALTER TABLE test_runs DROP COLUMN IF EXISTS created_by;

-- Drop tables
DROP TABLE IF EXISTS test_run_metrics CASCADE;
DROP TABLE IF EXISTS agent_metrics CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS org_members CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_agent_configs_org;
DROP INDEX IF EXISTS idx_personas_org;
DROP INDEX IF EXISTS idx_metrics_org;