import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PhotoAssembly from './PhotoAssembly';
import PhotoNagarNigam from './PhotoNagarNigam';
import PhotoGramPanchayat from './PhotoGramPanchayat';
import dashboardData from '../data.json';

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
      fetch('http://localhost:5000/api/analytics')
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
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white text-blue-600 shadow-sm border border-slate-200">EN</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-800 transition-colors">HI</button>
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Stats by Location */}
              {dashboardData.locations.map(location => (
                <div key={location.id} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{location.name} Overview</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Voters</p>
                      <div className="text-4xl font-extrabold text-slate-800">
                        {(location.stats.totalVoters || 0).toLocaleString()}
                      </div>
                      <p className="text-sm font-medium text-emerald-600 mt-2">In {location.name}</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender Demographics</p>
                      <div className="text-xl font-extrabold text-slate-800 flex flex-col gap-1 mt-2">
                        <span className="text-blue-600 flex items-center justify-between">
                          <span>Male:</span> <span>{(location.stats.maleVoters || 0).toLocaleString()}</span>
                        </span>
                        <span className="text-pink-600 flex items-center justify-between">
                          <span>Female:</span> <span>{(location.stats.femaleVoters || 0).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Average Age</p>
                      <div className="text-4xl font-extrabold text-slate-800">
                        {location.stats.averageAge || 0}
                      </div>
                      <p className="text-sm font-medium text-slate-500 mt-2">Years old</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Printed Slips & Dirs</p>
                      <div className="flex flex-col gap-1 mt-2 text-lg font-bold text-slate-800">
                        <span className="text-amber-600 flex justify-between">
                          <span>Prints:</span> <span>{(location.stats.printsCount || 0).toLocaleString()}</span>
                        </span>
                        <span className="text-violet-600 flex justify-between">
                          <span>Indexed:</span> <span>{(location.stats.directoriesIndexed || 0).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => handleTabChange('assembly')} className="p-4 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-4 text-left group">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Assembly</p>
                      <p className="text-xs text-slate-500 font-medium">Manage constituencies</p>
                    </div>
                  </button>
                  <button onClick={() => handleTabChange('nagar-nigam')} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-4 text-left group">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Nagar Nigam</p>
                      <p className="text-xs text-slate-500 font-medium">Urban municipal records</p>
                    </div>
                  </button>
                  <button onClick={() => handleTabChange('gram-panchayat')} className="p-4 rounded-xl border border-violet-100 bg-violet-50 hover:bg-violet-100 transition-colors flex items-center gap-4 text-left group">
                    <div className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-violet-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Gram Panchayat</p>
                      <p className="text-xs text-slate-500 font-medium">Rural village records</p>
                    </div>
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
