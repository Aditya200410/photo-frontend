import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [analytics, setAnalytics] = useState({
    assemblyFiles: 0,
    nagarNigamFiles: 0,
    panchayatFiles: 0,
    totalVoters: 0,
    maleVoters: 0,
    femaleVoters: 0,
    averageAge: 0,
    ageBrackets: { youth: 0, adult: 0, middle: 0, senior: 0 },
    printsCount: 0,
    lastPrintDate: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load analytics', err);
        setLoading(false);
      });
  }, []);

  const totalFiles = (analytics.assemblyFiles || 0) + (analytics.nagarNigamFiles || 0) + (analytics.panchayatFiles || 0);
  
  // Calculate percentages for gender
  const malePercent = analytics.totalVoters ? Math.round((analytics.maleVoters / analytics.totalVoters) * 100) : 0;
  const femalePercent = analytics.totalVoters ? Math.round((analytics.femaleVoters / analytics.totalVoters) * 100) : 0;

  return (
    <div className="flex flex-col items-center p-4 md:p-8 font-sans w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
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
                System Analytics
              </h1>
              <p className="text-lg text-slate-500 font-medium">
                Comprehensive overview of your Voter Directory data and printing activity.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 text-right">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Processed Voters</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {loading ? '...' : analytics.totalVoters.toLocaleString()}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.36z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Uploads</p>
                  <p className="text-4xl font-black text-slate-800">{totalFiles}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{analytics.assemblyFiles} Assembly</span>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">{analytics.panchayatFiles} Panchayat</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Slip Prints Generated</p>
                  <p className="text-4xl font-black text-slate-800">{analytics.printsCount.toLocaleString()}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-4 flex items-center gap-1">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {analytics.lastPrintDate ? new Date(analytics.lastPrintDate).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-purple-50 opacity-50 group-hover:scale-110 transition-transform">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Gender Demographics</p>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-3xl font-black text-indigo-600">{malePercent}% <span className="text-sm font-semibold text-slate-500 uppercase">M</span></p>
                    <p className="text-3xl font-black text-pink-500">{femalePercent}% <span className="text-sm font-semibold text-slate-500 uppercase">F</span></p>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden flex">
                    <div style={{ width: `${malePercent}%` }} className="h-full bg-indigo-500"></div>
                    <div style={{ width: `${femalePercent}%` }} className="h-full bg-pink-500"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-amber-50 opacity-50 group-hover:scale-110 transition-transform">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Average Age</p>
                  <p className="text-4xl font-black text-slate-800">{analytics.averageAge || 0} <span className="text-lg text-slate-500 font-semibold">yrs</span></p>
                  <p className="text-xs font-semibold text-slate-500 mt-4">Calculated from total parsed voters</p>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Age Distribution Chart */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Age Distribution
                </h3>
                
                <div className="space-y-5">
                  <AgeBar label="Youth (18-25)" value={analytics.ageBrackets?.youth || 0} total={analytics.totalVoters} color="bg-blue-500" />
                  <AgeBar label="Adults (26-40)" value={analytics.ageBrackets?.adult || 0} total={analytics.totalVoters} color="bg-emerald-500" />
                  <AgeBar label="Middle Age (41-60)" value={analytics.ageBrackets?.middle || 0} total={analytics.totalVoters} color="bg-amber-500" />
                  <AgeBar label="Seniors (60+)" value={analytics.ageBrackets?.senior || 0} total={analytics.totalVoters} color="bg-purple-500" />
                </div>
              </div>

              {/* Data Sources Breakdown */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Uploaded Files Breakdown
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                    <p className="text-3xl font-black text-slate-800 mb-1">{analytics.assemblyFiles}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Assembly Files</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                    <p className="text-3xl font-black text-slate-800 mb-1">{analytics.nagarNigamFiles}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Nagar Nigam</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                    <p className="text-3xl font-black text-slate-800 mb-1">{analytics.panchayatFiles}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Gram Panchayat</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-xl mt-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">System Health</h4>
                    <p className="text-sm text-blue-700">The system has successfully processed {totalFiles} Excel files, parsing a total of {analytics.totalVoters.toLocaleString()} voters ready for printing.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for age bars
function AgeBar({ label, value, total, color }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-800">{value.toLocaleString()}</span>
          <span className="text-xs font-semibold text-slate-400 ml-2">({percent}%)</span>
        </div>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

export default Admin;
