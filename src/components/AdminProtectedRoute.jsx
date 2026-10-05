import React, { useState } from 'react';
import API_BASE_URL from '../config';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAdmin') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const clientAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    // 1. Check if client-side environment variable matches
    if (clientAdminPassword && password === clientAdminPassword) {
      sessionStorage.setItem('isAdmin', 'true');
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
        sessionStorage.setItem('isAdmin', 'true');
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('userToken', data.token);
        }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-2 px-4 rounded transition duration-200 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProtectedRoute;
