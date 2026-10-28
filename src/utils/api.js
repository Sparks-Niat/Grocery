/**
 * Centralized API helper for environment-aware API requests.
 * 
 * - In local development: VITE_API_URL is unset, so getApiUrl('/api/...') returns '/api/...',
 *   which is seamlessly handled by Vite's dev server proxy to localhost:5000.
 * - In production (Vercel): VITE_API_URL is set to your Render backend URL (e.g. https://your-app.onrender.com),
 *   so getApiUrl('/api/...') returns https://your-app.onrender.com/api/...
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function getApiUrl(endpoint = '') {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default getApiUrl;
