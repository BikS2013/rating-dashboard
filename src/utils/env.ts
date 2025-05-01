// Declare the window.env type
declare global {
  interface Window {
    env?: Record<string, string>;
  }
}

/**
 * Gets an environment variable from either:
 * 1. Runtime window.env (set by env.sh script in Docker)
 * 2. Build-time import.meta.env (set by Vite during build)
 * 3. Fallback value
 */
export function getEnv(key: string, fallback = ''): string {
  // First try runtime env vars (from window.env)
  if (window.env && window.env[key] !== undefined) {
    return window.env[key];
  }
  
  // Then try build time env vars (from import.meta.env)
  // @ts-ignore - Vite specific
  if (import.meta.env[key] !== undefined) {
    // @ts-ignore - Vite specific
    return import.meta.env[key];
  }
  
  // Fallback value
  return fallback;
}

/**
 * Common environment variables used in the application
 */
export const ENV = {
  API_URL: getEnv('VITE_API_URL', 'https://api.default.com/v1'),
  AUTH_TOKEN: getEnv('VITE_AUTH_TOKEN', ''),
  ENABLE_ANALYTICS: getEnv('VITE_ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_DETAILED_LOGGING: getEnv('VITE_ENABLE_DETAILED_LOGGING', 'false') === 'true',
};