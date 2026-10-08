import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PhotoAssembly from './PhotoAssembly';
import PhotoNagarNigam from './PhotoNagarNigam';
import PhotoGramPanchayat from './PhotoGramPanchayat';


function PhotoIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('view') || 'overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [siteSettings, setSiteSettings] = useState({
    assemblyImage: "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?q=80&w=2070&auto=format&fit=crop",
    nagarNigamImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop",
    gramPanchayatImage: "https://images.unsplash.com/photo-1592659762303-90081d34b277?q=80&w=2073&auto=format&fit=crop"
  });

  const fetchSiteSettings = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSiteSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Failed to load site settings:", err));
  };

  const fetchCurrentUser = () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.status === 'blocked') {
            navigate(`/payment?userId=${data.id}&status=blocked`);
          } else if (data.status === 'pending_payment') {
            navigate(`/payment?userId=${data.id}`);
          } else {
            setCurrentUser(data);
          }
        }
      })
      .catch(err => console.error("Failed to load user:", err));
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchSiteSettings();
    const handleCreditsUpdate = () => {
      fetchCurrentUser();
      fetchAnalytics(false);
    };
    window.addEventListener('user-credits-updated', handleCreditsUpdate);
    return () => window.removeEventListener('user-credits-updated', handleCreditsUpdate);
  }, []);

  useEffect(() => {
    // Sync state with URL params if they change
    const view = searchParams.get('view') || 'overview';
    if (view !== activeTab) {
      setActiveTab(view);
    }
  }, [searchParams]);

  const fetchAnalytics = (showLoader = false) => {
    if (showLoader) setIsLoadingAnalytics(true);
    fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/analytics`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(prev => ({ ...prev, ...data }));
        setIsLoadingAnalytics(false);
      })
      .catch(err => {
        console.error("Failed to load analytics:", err);
        setIsLoadingAnalytics(false);
      });
  };

  // Fetch on mount and whenever the overview tab becomes active
  useEffect(() => {
    fetchAnalytics(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAnalytics(false);
    }
  }, [activeTab]);

  // Auto-refresh analytics every 30 seconds when on overview
  useEffect(() => {
    if (activeTab !== 'overview') return;
    const interval = setInterval(() => fetchAnalytics(false), 30000);
    return () => clearInterval(interval);
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
      <aside className={`w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl border-r border-slate-800/80 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Brand Header */}
        <div className="h-18 px-5 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-black text-lg tracking-tight text-white flex items-center gap-1 leading-none">
                <span>VoterDir</span>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-black">Pro</span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">v2.4</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Electoral Directory</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {/* Section: Management */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Management</span>
              <span className="h-px flex-1 bg-slate-800/80 ml-3"></span>
            </div>
            <div className="space-y-1">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group text-left relative ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/30 ring-1 ring-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={`transition-all duration-200 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 group-hover:scale-110'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-4 rounded-full bg-white/90 shadow-sm shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: System & Account */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">System</span>
              <span className="h-px flex-1 bg-slate-800/80 ml-3"></span>
            </div>
            <div className="space-y-1">
              {/* Account Tab */}
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="truncate flex-1">Account</span>
                {currentUser && currentUser.role !== 'admin' && (
                  <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    ₹{(Number(currentUser.credits) || 0).toFixed(2)}
                  </span>
                )}
              </Link>

              {/* Support */}
              <Link
                to="/contact-support"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-105 transition-all shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="truncate flex-1">Support</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                  24/7
                </span>
              </Link>

              {/* Admin Console Shortcut if admin */}
              {currentUser?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-105 transition-all shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="truncate flex-1">Admin Portal</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                    Admin
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom User Profile & Logout Section */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md space-y-2 mt-auto">
          {/* User Mini Card */}
          <Link
            to="/account"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 transition-all duration-200 group"
            title="View Account Profile"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-1 ring-white/10 group-hover:ring-blue-400 transition-all">
                {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                {currentUser?.name || 'Voter Operator'}
              </p>
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {currentUser?.email || 'operator@portal.in'}
              </p>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem('userToken');
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/30 transition-all text-xs font-bold active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
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

            {/* Wallet Credit Badge */}
            {currentUser && currentUser.role !== 'admin' && (
              <Link
                to="/account"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-sm transition-all shrink-0"
                title="Wallet Balance & History"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-emerald-700 hidden md:inline">Credits:</span>
                <span className="font-black font-mono text-emerald-900">₹{(Number(currentUser.credits) || 0).toFixed(2)}</span>
              </Link>
            )}

            <Link 
              to="/account" 
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors shadow-sm shrink-0" 
              title="My Account"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full overflow-x-hidden">
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto">

              {/* Header / Hero Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Wallet Balance & Credits Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-7 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden group flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-5 opacity-20 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-emerald-200 font-bold tracking-widest text-xs uppercase">Wallet Balance</p>
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">Active</span>
                    </div>
                    <h2 className="text-4xl font-black mb-1 font-mono tracking-tight">
                      ₹{(Number(currentUser?.credits) || 0).toFixed(2)}
                    </h2>
                  </div>
                  <div className="pt-3 border-t border-white/20 flex items-center justify-between mt-4">
                    <div className="text-[11px] text-emerald-100 font-medium leading-tight">
                      Rates: {(siteSettings?.rateWithoutImage ?? 0.10) * 100}p / {(siteSettings?.rateWithImage ?? 0.12) * 100}p per page
                    </div>
                    <Link to="/account" className="text-xs font-bold text-white underline hover:text-emerald-200 transition-colors">
                      History →
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-7 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <svg className="w-28 h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-2">Total Electors</p>
                    <h2 className="text-4xl font-black mb-1">
                      {isLoadingAnalytics ? '...' : (analytics.totalVoters || 0).toLocaleString()}
                    </h2>
                  </div>
                  <p className="text-emerald-400 text-xs font-medium flex items-center gap-1 pt-3 border-t border-slate-700/60 mt-4">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Indexed & Verified
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-500 font-bold tracking-widest text-xs uppercase mb-2">Directories</p>
                    <h2 className="text-4xl font-black text-slate-800 mb-1">
                      {isLoadingAnalytics ? '...' : (analytics.assemblyFiles + analytics.nagarNigamFiles + analytics.panchayatFiles)}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-400 pt-3 border-t border-slate-100 mt-4">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Asmb ({analytics.assemblyFiles})</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ngm ({analytics.nagarNigamFiles})</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Rurl ({analytics.panchayatFiles})</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-7 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  </div>
                  <div>
                    <p className="text-blue-200 font-bold tracking-widest text-xs uppercase mb-2">Total Prints</p>
                    <h2 className="text-4xl font-black mb-1">
                      {isLoadingAnalytics ? '...' : (analytics.printsCount || 0).toLocaleString()}
                    </h2>
                  </div>
                  <p className="text-blue-100 text-xs font-medium pt-3 border-t border-white/20 mt-4 truncate">
                    {analytics.lastPrintDate ? `Last: ${new Date(analytics.lastPrintDate).toLocaleDateString()}` : 'No prints yet'}
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

              {/* Rapid Access Hub with Images from Site Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Rapid Access Hub
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Quickly jump into regional voter directories</p>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Assembly Card */}
                  <button
                    onClick={() => handleTabChange('assembly')}
                    className="group rounded-3xl border border-slate-200/90 bg-white hover:border-blue-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col text-left active:scale-[0.98]"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={siteSettings.assemblyImage || "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?q=80&w=2070&auto=format&fit=crop"}
                        alt="Assembly"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                      <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Constituencies
                      </div>
                      <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-tight drop-shadow-md">Assembly</h4>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">Manage state constituencies & polling booths</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                        <span>Open Directory</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </button>

                  {/* Nagar Nigam Card */}
                  <button
                    onClick={() => handleTabChange('nagar-nigam')}
                    className="group rounded-3xl border border-slate-200/90 bg-white hover:border-emerald-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col text-left active:scale-[0.98]"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={siteSettings.nagarNigamImage || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop"}
                        alt="Nagar Nigam"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                      <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Urban Municipal
                      </div>
                      <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-tight drop-shadow-md">Nagar Nigam</h4>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">Access urban municipal corporation records</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                        <span>Open Directory</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </button>

                  {/* Gram Panchayat Card */}
                  <button
                    onClick={() => handleTabChange('gram-panchayat')}
                    className="group rounded-3xl border border-slate-200/90 bg-white hover:border-violet-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col text-left active:scale-[0.98]"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={siteSettings.gramPanchayatImage || "https://images.unsplash.com/photo-1592659762303-90081d34b277?q=80&w=2073&auto=format&fit=crop"}
                        alt="Gram Panchayat"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                      <div className="absolute top-3 right-3 bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Rural & Village
                      </div>
                      <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-tight drop-shadow-md">Gram Panchayat</h4>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">Navigate rural and village voter directories</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600 group-hover:text-violet-700">
                        <span>Open Directory</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="w-full min-w-0">
            {/* Component containers rendered with clean responsive styling */}
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
