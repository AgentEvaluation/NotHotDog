/**
 * Feature flags for Community vs Enterprise editions
 * Set NEXT_PUBLIC_EDITION=enterprise in environment to enable enterprise features
 */

const isEnterprise = process.env.NEXT_PUBLIC_EDITION === 'enterprise';

export const FEATURES = {
  // Core features (available in both editions)
  AGENT_TESTING: true,
  TEST_GENERATION: true,
  HALLUCINATION_DETECTION: true,
  BASIC_METRICS: true,
  FILE_UPLOAD: true,
  VALIDATION_RULES: true,
  
  // Enterprise-only features
  CUSTOM_PERSONAS: isEnterprise,
  CUSTOM_METRICS: isEnterprise,
  ANALYTICS_DASHBOARD: isEnterprise,
  TEAMS_AND_ORGS: isEnterprise,
  AUDIT_TRAILS: isEnterprise,
  SSO_AUTH: isEnterprise,
  ADVANCED_EXPORT: isEnterprise,
  BULK_OPERATIONS: isEnterprise,
  WEBHOOK_INTEGRATION: isEnterprise,
  PRIORITY_SUPPORT: isEnterprise,
} as const;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] ?? false;
}

// Helper function to require enterprise edition
export function requireEnterprise(featureName: string): void {
  if (!isEnterprise) {
    throw new Error(
      `${featureName} is only available in the Enterprise edition. ` +
      `Visit https://nothotdog.ai/enterprise for more information.`
    );
  }
}