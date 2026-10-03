import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [analytics, setAnalytics] = useState({ excelFilesCount: 0, printsCount: 0, lastPrintDate: null });
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

  return (
    <div className="flex flex-col items-center p-2 font-sans w-full">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-800 to-black"></div>
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-800 mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
            System Analytics
          </h1>
          <p className="text-lg text-slate-500">
            Overview of your Voter Directory System usage.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-10">Loading analytics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col items-center shadow-sm">
              <div className="text-blue-500 bg-blue-100 p-4 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Uploaded Files</h3>
              <p className="text-4xl font-extrabold text-slate-800">{analytics.excelFilesCount}</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col items-center shadow-sm">
              <div className="text-emerald-500 bg-emerald-100 p-4 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Slip Prints</h3>
              <p className="text-4xl font-extrabold text-slate-800">{analytics.printsCount}</p>
            </div>
            
            <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm mt-4">
              <div className="flex items-center gap-4">
                <div className="text-violet-500 bg-violet-100 p-3 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-slate-700 font-bold">Last Print Activity</h3>
                  <p className="text-sm text-slate-500">
                    {analytics.lastPrintDate ? new Date(analytics.lastPrintDate).toLocaleString() : 'No print activity yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
