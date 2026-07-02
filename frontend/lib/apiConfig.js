/**
 * API Configuration Utility
 * Provides environment-aware API base URL
 */

export const getApiUrl = () => {
  // In production (deployed), use the same origin
  // In development, the Next.js rewrites will handle it
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export const getApiEndpoint = (path) => {
  return `${getApiUrl()}/api${path}`;
};

export const getUploadUrl = (filename) => {
  return `${getApiUrl()}/uploads/${filename}`;
};
