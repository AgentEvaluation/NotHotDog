/**
 * Validates required environment variables on startup
 */

const requiredEnvVars = [
  'DATABASE_URL',
] as const;

const optionalEnvVars = [
  'NEXT_PUBLIC_EDITION',
  'NODE_ENV',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file or environment configuration.`
    );
  }
  
  // Log optional env vars for debugging
  console.log('Environment configuration:');
  console.log(`- Edition: ${process.env.NEXT_PUBLIC_EDITION || 'community'}`);
  console.log(`- Node Environment: ${process.env.NODE_ENV || 'development'}`);
}

// Validate on module load
if (typeof window === 'undefined') {
  // Only run on server
  validateEnv();
}