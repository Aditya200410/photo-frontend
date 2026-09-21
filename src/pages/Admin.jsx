import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [prints, setPrints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrints();
    }
  }, [isAuthenticated]);

  const fetchPrints = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/prints');
      if (!response.ok) {
        throw new Error('Failed to fetch prints data');
      }
      const data = await response.json();
      setPrints(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin123' && password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2">Admin Login</h2>
            <p className="text-slate-300">Enter your credentials to access the dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter password"
                required
              />
            </div>
            
            {authError && <p className="text-red-400 text-sm font-medium">{authError}</p>}
            
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-indigo-300 hover:text-white text-sm font-medium transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 py-10 px-4 md:px-10 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center text-indigo-300 hover:text-white mb-8 font-medium transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Home
        </Link>

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">
            Admin Dashboard
          </h1>
          <button 
            onClick={fetchPrints}
            className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-xl border border-white/20 transition-all flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center">
            <svg className="w-6 h-6 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-indigo-300">
                  <th className="py-4 px-4 font-semibold text-sm">ID</th>
                  <th className="py-4 px-4 font-semibold text-sm">Date & Time</th>
                  <th className="py-4 px-4 font-semibold text-sm">Option Type</th>
                  <th className="py-4 px-4 font-semibold text-sm">Voter Name</th>
                  <th className="py-4 px-4 font-semibold text-sm">Ward / Part / Serial</th>
                  <th className="py-4 px-4 font-semibold text-sm">Pages Printed</th>
                  <th className="py-4 px-4 font-semibold text-sm text-right">Total Slips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">Loading prints data...</td>
                  </tr>
                ) : prints.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">No print records found. Generate a PDF to see it here!</td>
                  </tr>
                ) : (
                  prints.map((print) => (
                    <tr key={print.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-slate-400">#{print.id}</td>
                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        {new Date(print.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-indigo-500/20 text-indigo-300 py-1 px-3 rounded-full text-xs font-semibold border border-indigo-500/30">
                          {print.option_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-white">{print.voter_name || 'N/A'}</td>
                      <td className="py-4 px-4 text-slate-300">
                        {print.ward_no || '-'} / {print.part_no || '-'} / {print.serial_no || '-'}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {print.pages_count}
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-bold text-right">
                        {print.pages_count * 8}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
