import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { isAdminLoggedIn, setAuthSession } from '../utils/auth';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminLoggedIn());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(isAdminLoggedIn());
    };
    window.addEventListener('auth-state-changed', handleAuthChange);
    window.addEventListener('auth-logout', handleAuthChange);
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
      window.removeEventListener('auth-logout', handleAuthChange);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const clientAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    // 1. Check if client-side environment variable matches
    if (clientAdminPassword && password === clientAdminPassword) {
      setAuthSession({ role: 'admin', isAdmin: true });
      setIsAuthenticated(true);
      return;
    }

    // 2. Otherwise verify directly against the backend ADMIN_PASSWORD environment variable
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setAuthSession({ token: data.token, role: 'admin', isAdmin: true });
        setIsAuthenticated(true);
      } else {
        if (!clientAdminPassword && data?.error && data.error.includes('not configured')) {
          setError('Admin password not configured in environment. Please set ADMIN_PASSWORD in your backend .env or VITE_ADMIN_PASSWORD in frontend .env.');
        } else {
          setError(data?.error || 'Invalid password');
        }
      }
    } catch (err) {
      console.error('Admin login error:', err);
      if (!clientAdminPassword) {
        setError('Admin password not configured in frontend and could not connect to backend.');
      } else {
        setError('Invalid password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-6 sm:p-10 border border-white/20 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg shadow-blue-500/30">
            A
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Admin Authentication</h2>
          <p className="text-xs text-slate-500 mt-1">Please enter your administrative master password.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-slate-800 transition-all text-sm font-medium"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 text-sm active:scale-95 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Verifying access...' : 'Authenticate & Enter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProtectedRoute;
