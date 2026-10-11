// Centralized API configuration
// Reads API endpoint dynamically from environment variable (VITE_API_URL)
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;

