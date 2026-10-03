import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PhotoAssembly from './PhotoAssembly';
import PhotoNagarNigam from './PhotoNagarNigam';
import PhotoGramPanchayat from './PhotoGramPanchayat';


function PhotoIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('view') || 'overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [analytics, setAnalytics] = useState({ excelFilesCount: 0, printsCount: 0, lastPrintDate: null });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    // Sync state with URL params if they change
    const view = searchParams.get('view') || 'overview';
    if (view !== activeTab) {
      setActiveTab(view);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'overview') {
      setIsLoadingAnalytics(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics`)
        .then(res => res.json())
        .then(data => {
          setAnalytics(data);
          setIsLoadingAnalytics(false);
        })
        .catch(err => {
          console.error("Failed to load analytics:", err);
          setIsLoadingAnalytics(false);
        });
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ view: tab });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'assembly', label: 'Assembly Directory', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { id: 'nagar-nigam', label: 'Nagar Nigam Directory', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'gram-panchayat', label: 'Gram Panchayat', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            VoterDir<span className="text-blue-400">Pro</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 mt-4">Management</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 mt-8">System</p>

          <Link to="/contact-support" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium hover:bg-slate-800 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Support
          </Link>
        </div>
        

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize tracking-tight truncate max-w-[120px] sm:max-w-none">
              {activeTab.replace('-', ' ')}
            </h1>
            <div className="h-5 w-px bg-slate-300 hidden sm:block"></div>
            <span className="text-xs md:text-sm text-slate-500 font-medium bg-slate-100 px-2 md:px-3 py-1 rounded-full border border-slate-200 hidden sm:inline-block">
              Electoral Management System
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <button className="text-slate-400 hover:text-blue-600 transition-colors hidden sm:block">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="flex items-center gap-1 sm:gap-2 relative group z-50">
              <select 
                className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[10px] sm:text-sm font-semibold rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 pr-6 sm:pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer shadow-sm w-[80px] sm:w-auto truncate"
                onChange={(e) => {
                  const lang = e.target.value;
                  if (lang) {
                    document.cookie = `googtrans=/en/${lang}; path=/`;
                    document.cookie = `googtrans=/en/${lang}; domain=${window.location.hostname}; path=/`;
                    window.location.reload();
                  } else {
                    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
                    window.location.reload();
                  }
                }}
                defaultValue={(() => {
                  const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
                  return match ? match[1] : "";
                })()}
              >
                <option value="">EN</option>
                <option value="hi">HI</option>
                <option value="bn">BN</option>
                <option value="te">TE</option>
                <option value="mr">MR</option>
                <option value="ta">TA</option>
                <option value="ur">UR</option>
                <option value="gu">GU</option>
                <option value="kn">KN</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 sm:px-2 text-slate-500">
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <div className="h-4 sm:h-6 w-px bg-slate-300 mx-0.5 sm:mx-1"></div>
            <Link to="/account" className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="My Account">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </Link>
            <button 
              onClick={() => { localStorage.removeItem('userToken'); window.location.href = '/login'; }} 
              className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-700 transition-colors p-1"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full overflow-x-hidden">
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              
              {/* Header / Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <p className="text-slate-400 font-semibold tracking-widest text-sm uppercase mb-2">Total Electors</p>
                  <h2 className="text-5xl font-black mb-1">
                    {isLoadingAnalytics ? '...' : (analytics.totalVoters || 0).toLocaleString()}
                  </h2>
                  <p className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Fully Indexed & Verified
                  </p>
                </div>
                
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
                  <p className="text-slate-500 font-bold tracking-widest text-xs uppercase mb-2">Directories Processed</p>
                  <h2 className="text-4xl font-extrabold text-slate-800 mb-2">
                    {isLoadingAnalytics ? '...' : (analytics.assemblyFiles + analytics.nagarNigamFiles + analytics.panchayatFiles)}
                  </h2>
                  <div className="flex gap-4 text-xs font-bold text-slate-400 mt-2">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Assembly ({analytics.assemblyFiles})</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Nigam ({analytics.nagarNigamFiles})</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Rural ({analytics.panchayatFiles})</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  </div>
                  <p className="text-blue-200 font-semibold tracking-widest text-sm uppercase mb-2">Total Printed Slips</p>
                  <h2 className="text-5xl font-black mb-1">
                    {isLoadingAnalytics ? '...' : (analytics.printsCount || 0).toLocaleString()}
                  </h2>
                  <p className="text-blue-100 text-sm font-medium">
                    {analytics.lastPrintDate ? `Last print: ${new Date(analytics.lastPrintDate).toLocaleDateString()}` : 'No prints yet'}
                  </p>
                </div>
              </div>

              {/* Demographics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gender Split */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Elector Gender Distribution
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-bold text-blue-600">Male Voters</p>
                          <p className="text-2xl font-black text-slate-800">{(analytics.maleVoters || 0).toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-bold text-slate-400">
                          {analytics.totalVoters ? Math.round((analytics.maleVoters / analytics.totalVoters) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${analytics.totalVoters ? (analytics.maleVoters / analytics.totalVoters) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-bold text-pink-600">Female Voters</p>
                          <p className="text-2xl font-black text-slate-800">{(analytics.femaleVoters || 0).toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-bold text-slate-400">
                          {analytics.totalVoters ? Math.round((analytics.femaleVoters / analytics.totalVoters) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full" style={{ width: `${analytics.totalVoters ? (analytics.femaleVoters / analytics.totalVoters) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Age Brackets */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Age Demographics
                    </h3>
                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                      Avg Age: {analytics.averageAge || 0}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-slate-300 transition-colors">
                      <p className="text-xs font-bold text-slate-500 uppercase">Youth (18-25)</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{analytics.ageBrackets?.youth?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-slate-300 transition-colors">
                      <p className="text-xs font-bold text-slate-500 uppercase">Adult (26-40)</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{analytics.ageBrackets?.adult?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-slate-300 transition-colors">
                      <p className="text-xs font-bold text-slate-500 uppercase">Middle (41-60)</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{analytics.ageBrackets?.middle?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-slate-300 transition-colors">
                      <p className="text-xs font-bold text-slate-500 uppercase">Senior (60+)</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{analytics.ageBrackets?.senior?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Rapid Access Hub
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={() => handleTabChange('assembly')} className="p-6 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-blue-50 hover:to-blue-100 transition-all flex flex-col items-center text-center group">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-4 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <p className="font-bold text-lg text-slate-800">Assembly</p>
                    <p className="text-sm text-slate-500 mt-1">Manage state constituencies & polling booths</p>
                  </button>
                  <button onClick={() => handleTabChange('nagar-nigam')} className="p-6 rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-emerald-50 hover:to-emerald-100 transition-all flex flex-col items-center text-center group">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <p className="font-bold text-lg text-slate-800">Nagar Nigam</p>
                    <p className="text-sm text-slate-500 mt-1">Access urban municipal corporation records</p>
                  </button>
                  <button onClick={() => handleTabChange('gram-panchayat')} className="p-6 rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/50 to-violet-50 hover:to-violet-100 transition-all flex flex-col items-center text-center group">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500 text-white flex items-center justify-center mb-4 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="font-bold text-lg text-slate-800">Gram Panchayat</p>
                    <p className="text-sm text-slate-500 mt-1">Navigate rural and village voter directories</p>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto -mt-6">
            {/* Component containers rendered with slightly adjusted styling if needed */}
            {activeTab === 'assembly' && <PhotoAssembly onBack={() => handleTabChange('overview')} />}
            {activeTab === 'nagar-nigam' && <PhotoNagarNigam onBack={() => handleTabChange('overview')} />}
            {activeTab === 'gram-panchayat' && <PhotoGramPanchayat onBack={() => handleTabChange('overview')} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PhotoIndex;
