import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [analytics, setAnalytics] = useState({
    assemblyFiles: 0,
    nagarNigamFiles: 0,
    panchayatFiles: 0,
    totalVoters: 0,
    printsCount: 0,
    lastPrintDate: null
  });
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const analyticsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics`);
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);

        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const usersRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData)) {
            // Filter out admins so it only shows actual client users
            const clientUsers = usersData.filter(u => u.role !== 'admin');
            setUsersCount(clientUsers.length);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalFiles = (analytics.assemblyFiles || 0) + (analytics.nagarNigamFiles || 0) + (analytics.panchayatFiles || 0);

  return (
    <div className="flex flex-col items-center p-4 md:p-8 font-sans w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100/50">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-slate-500 font-medium">
                Core system metrics and activity overview.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Processed Voters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-indigo-50 opacity-50 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Voters DB</p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {analytics.totalVoters.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Total Uploads */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.36z"/></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Excel Uploads</p>
                <p className="text-4xl font-black text-slate-800">{totalFiles}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{analytics.assemblyFiles} Assembly</span>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">{analytics.nagarNigamFiles} Nagar</span>
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded-md">{analytics.panchayatFiles} Panchayat</span>
                </div>
              </div>
            </div>

            {/* Slip Prints Generated */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Prints</p>
                <p className="text-4xl font-black text-slate-800">{analytics.printsCount.toLocaleString()}</p>
                <p className="text-xs font-semibold text-slate-500 mt-4 flex items-center gap-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {analytics.lastPrintDate ? new Date(analytics.lastPrintDate).toLocaleDateString() : 'No prints yet'}
                </p>
              </div>
            </div>

            {/* Registered Users */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-purple-50 opacity-50 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Users</p>
                <p className="text-4xl font-black text-slate-800">{usersCount}</p>
                <Link to="/admin/users" className="text-xs font-semibold text-purple-600 hover:text-purple-800 mt-4 inline-flex items-center gap-1 transition-colors">
                  Manage Users
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
