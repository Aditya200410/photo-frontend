// Centralized API configuration
// Automatically resolves backend URL and prevents mixed-content/localhost CORS errors in production
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When running on onlinevoterslip.com or subdomains
    if (host.includes('onlinevoterslip.com')) {
      return 'https://api.onlinevoterslip.com';
    }
    // If accessing via any remote hostname (e.g. Vercel, Cloudflare, custom domain) and env is localhost or missing
    if (host !== 'localhost' && host !== '127.0.0.1' && (!envUrl || envUrl.includes('localhost'))) {
      return 'https://api.onlinevoterslip.com';
    }
  }

  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/$/, '');
  }

  // Production backend URL as standard default
  return 'https://api.onlinevoterslip.com';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
