import API_BASE_URL from '../config';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminToken } from '../utils/auth';

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
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingCreditsCount, setPendingCreditsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = getAdminToken();

      const [analyticsRes, usersRes, creditsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/analytics`),
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/credit-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        const analyticsData = await analyticsRes.value.json();
        setAnalytics(analyticsData);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const usersData = await usersRes.value.json();
        if (Array.isArray(usersData)) {
          const clientUsers = usersData.filter(u => u.role === 'user' && u.id);
          setUsersCount(clientUsers.length);
          const pending = usersData.filter(u => u.status === 'pending_approval');
          setPendingApprovalsCount(pending.length);
        }
      }

      if (creditsRes.status === 'fulfilled' && creditsRes.value.ok) {
        const creditsData = await creditsRes.value.json();
        if (Array.isArray(creditsData)) {
          const pendingCredits = creditsData.filter(r => r.status === 'pending');
          setPendingCreditsCount(pendingCredits.length);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalFiles = (analytics.assemblyFiles || 0) + (analytics.nagarNigamFiles || 0) + (analytics.panchayatFiles || 0);

  return (
    <div className="w-full space-y-6 sm:space-y-8 font-sans">
      
      {/* Top Banner Card */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden">
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 mb-6 sm:mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100/60 shrink-0">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                  Admin Dashboard
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium mt-1 truncate">
                Core system metrics, elector databases, and operations overview.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap self-stretch sm:self-auto justify-start md:justify-end">
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
              title="Refresh dashboard stats"
            >
              <svg className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/add-excel"
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Upload Excel</span>
            </Link>

            {(pendingApprovalsCount > 0 || pendingCreditsCount > 0) && (
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 animate-pulse whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>{pendingApprovalsCount + pendingCreditsCount} Pending Action</span>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="text-slate-400 font-medium text-sm">Gathering latest statistics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat Cards Grid with Aligned Buttons */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>System Highlights</span>
                </h2>
                <span className="text-xs text-slate-400 font-medium">Auto-updated metrics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* 1. Total Processed Voters */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 text-indigo-50/70 group-hover:scale-110 transition-transform pointer-events-none">
                    <svg className="w-24 h-24 sm:w-28 sm:h-28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Voters DB</p>
                    <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {analytics.totalVoters.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">All indexed electors</p>
                  </div>
                  <Link 
                    to="/admin/fetch-data" 
                    className="relative z-10 mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group/btn"
                  >
                    <span>Search Records Log</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* 2. Total Uploads */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 text-blue-50/70 group-hover:scale-110 transition-transform pointer-events-none">
                    <svg className="w-24 h-24 sm:w-28 sm:h-28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.36z"/></svg>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Excel Uploads</p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-800">{totalFiles}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">{analytics.assemblyFiles} Asm</span>
                      <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60">{analytics.nagarNigamFiles} Ngr</span>
                      <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/60">{analytics.panchayatFiles} Pnc</span>
                    </div>
                  </div>
                  <Link 
                    to="/admin/add-excel" 
                    className="relative z-10 mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group/btn"
                  >
                    <span>Upload New Excel</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* 3. Slip Prints Generated */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 text-emerald-50/70 group-hover:scale-110 transition-transform pointer-events-none">
                    <svg className="w-24 h-24 sm:w-28 sm:h-28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Prints</p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-800">{analytics.printsCount.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5 truncate">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{analytics.lastPrintDate ? new Date(analytics.lastPrintDate).toLocaleDateString() : 'No prints yet'}</span>
                    </p>
                  </div>
                  <Link 
                    to="/admin/print-data" 
                    className="relative z-10 mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors group/btn"
                  >
                    <span>View Print Records</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* 4. Registered Users */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 text-purple-50/70 group-hover:scale-110 transition-transform pointer-events-none">
                    <svg className="w-24 h-24 sm:w-28 sm:h-28" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Users</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl sm:text-4xl font-black text-slate-800">{usersCount}</p>
                      {pendingApprovalsCount > 0 && (
                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          +{pendingApprovalsCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Approved client wallets</p>
                  </div>
                  <Link 
                    to="/admin/users" 
                    className="relative z-10 mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors group/btn"
                  >
                    <span>Manage Users & Wallets</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

              </div>
            </div>

            {/* Quick Actions & Navigation Hub */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                    Quick Operations Hub
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Direct access to core administrative functions and database management.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                
                {/* Action Card 1: Assembly Excel Upload */}
                <Link
                  to="/admin/add-excel/assembly"
                  className="group p-5 bg-gradient-to-br from-white to-blue-50/40 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        Upload Assembly Excel
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Import AC voters, state, district & booth electoral registers.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span className="text-[11px] text-slate-400 font-semibold">{analytics.assemblyFiles} files loaded</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Upload &rarr;
                    </span>
                  </div>
                </Link>

                {/* Action Card 2: Nagar Nigam Excel Upload */}
                <Link
                  to="/admin/add-excel/nagar-nigam"
                  className="group p-5 bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        Upload Nagar Nigam Excel
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Upload municipal ward electors & urban local body lists.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span className="text-[11px] text-slate-400 font-semibold">{analytics.nagarNigamFiles} files loaded</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Upload &rarr;
                    </span>
                  </div>
                </Link>

                {/* Action Card 3: Gram Panchayat Excel Upload */}
                <Link
                  to="/admin/add-excel/panchayat"
                  className="group p-5 bg-gradient-to-br from-white to-amber-50/40 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                        Upload Gram Panchayat
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Import rural panchayat electors, tehsils, and village rosters.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-amber-700">
                    <span className="text-[11px] text-slate-400 font-semibold">{analytics.panchayatFiles} files loaded</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Upload &rarr;
                    </span>
                  </div>
                </Link>

                {/* Action Card 4: User Approvals & Credits */}
                <Link
                  to="/admin/users"
                  className="group p-5 bg-gradient-to-br from-white to-purple-50/40 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner relative">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {(pendingApprovalsCount > 0 || pendingCreditsCount > 0) && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                          User Approvals & Credits
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Approve user UTR payments, grant credits & manage access.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span className="text-[11px] text-purple-700 font-bold">
                      {pendingApprovalsCount} reg / {pendingCreditsCount} recharge
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Review Users &rarr;
                    </span>
                  </div>
                </Link>

                {/* Action Card 5: View Print Records */}
                <Link
                  to="/admin/print-data"
                  className="group p-5 bg-gradient-to-br from-white to-teal-50/40 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                        View Print Records
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Inspect slip printing history, user deductions & page logs.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-teal-600">
                    <span className="text-[11px] text-slate-400 font-semibold">{analytics.printsCount} total prints</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Logs &rarr;
                    </span>
                  </div>
                </Link>

                {/* Action Card 6: Site Settings & Rates */}
                <Link
                  to="/admin/settings"
                  className="group p-5 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                        Site Settings & Rates
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Configure UPI ID, QR payment image & per-slip print pricing.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold">Pricing & UPI</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Configure &rarr;
                    </span>
                  </div>
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
