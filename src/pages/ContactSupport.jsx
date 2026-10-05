import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ContactSupport() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'credits',
    priority: 'normal',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // Fetch current user details
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setCurrentUser(data);
          // Autofill known user details
          setFormData(prev => ({
            ...prev,
            name: prev.name || data.name || '',
            email: prev.email || data.email || '',
            phone: prev.phone || data.mobile || data.phone || ''
          }));
        }
      })
      .catch(err => console.error("Failed to load user:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `VD-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketSubmitted(ticketId);
      setFormData(prev => ({
        ...prev,
        message: '',
        priority: 'normal'
      }));
    }, 700);
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', path: '/?view=overview', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'assembly', label: 'Assembly Directory', path: '/?view=assembly', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { id: 'nagar-nigam', label: 'Nagar Nigam Directory', path: '/?view=nagar-nigam', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'gram-panchayat', label: 'Gram Panchayat', path: '/?view=gram-panchayat', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  const faqs = [
    {
      q: 'How are printing credits calculated?',
      a: 'Credits are deducted strictly on a per-page basis: ₹0.10 (10 paisa) per page for text-only slips without photo, and ₹0.12 (12 paisa) per page for verified photo-inclusive slips. Your live balance is displayed in your top bar and Account tab.'
    },
    {
      q: 'How do I recharge my wallet credits via UPI?',
      a: 'Go to your Account tab, click on "Add Credits / Recharge", scan the official admin QR code with any UPI app (GPay, PhonePe, Paytm, etc.), pay your desired amount, and enter the 12-digit UTR/Transaction reference number. Once verified by admin, your credits are immediately updated.'
    },
    {
      q: 'What if my electoral directory records do not match?',
      a: 'Our directory syncs directly from certified state assembly, municipal (Nagar Nigam), and village panchayat records. Use the quick filter bar on any directory page to query by EPIC ID or voter name.'
    },
    {
      q: 'What is the standard support response time?',
      a: 'Our dedicated operations desk typically responds within 15 to 30 minutes during working hours (9:00 AM – 7:00 PM IST), and critical technical/wallet tickets are monitored 24/7.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Modern Luxury Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl border-r border-slate-800/80 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Brand Header */}
        <div className="h-18 px-5 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-3">
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
          </Link>
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
              {navItems.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 group text-left"
                >
                  <span className="text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200 shrink-0">
                    {item.icon}
                  </span>
                  <span className="truncate flex-1">{item.label}</span>
                </Link>
              ))}
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

              {/* Support (Active) */}
              <div
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/10"
              >
                <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="truncate flex-1">Support</span>
                <span className="w-1.5 h-4 rounded-full bg-white/90 shadow-sm shrink-0"></span>
              </div>

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

          {/* Logout Button in Bottom Sidebar */}
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
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full overflow-x-hidden">
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
            <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize tracking-tight truncate max-w-[140px] sm:max-w-none">
              Contact Support
            </h1>
            <div className="h-5 w-px bg-slate-300 hidden sm:block"></div>
            <span className="text-xs md:text-sm text-slate-500 font-medium bg-slate-100 px-2 md:px-3 py-1 rounded-full border border-slate-200 hidden sm:inline-block">
              24/7 Operations Desk
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-1 sm:gap-2 relative group z-50">
              <select
                className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[10px] sm:text-sm font-semibold rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 pr-6 sm:pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer shadow-sm w-[75px] sm:w-auto truncate"
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

            <div className="h-4 sm:h-6 w-px bg-slate-300 mx-0.5"></div>

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

            {/* Account Avatar Link */}
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

        {/* Support Page Content Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Banner Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
                <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Official Help Desk
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">assist you today?</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                  Have inquiries regarding your credit deductions, manual UPI recharge verification, or voter slip generation? Our operations support team is on standby to help.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-emerald-400">✓</span> Avg Response: &lt; 15 mins
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-blue-400">✓</span> Verified Support Engineers
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Support Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Phone */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Phone Support</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">Direct call assistance</p>
                <a href="tel:+919876543210" className="text-xs font-black font-mono text-blue-600 hover:text-blue-700 block truncate">
                  +91 98765 43210
                </a>
              </div>

              {/* Email */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Email Desk</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">Logs & detailed queries</p>
                <a href="mailto:support@voterdirectory.in" className="text-xs font-semibold text-purple-600 hover:text-purple-700 block truncate">
                  support@voterdirectory.in
                </a>
              </div>

              {/* Operational Hours */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Working Hours</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mon - Sat: 9:00 AM - 7:00 PM</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-1">24/7 Server Uptime</p>
              </div>

              {/* Direct UPI Verification */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Payment & UTR</h3>
                <p className="text-xs text-slate-500 mt-0.5">Admin approval desk</p>
                <Link to="/account" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 block mt-1">
                  View Ledger &rarr;
                </Link>
              </div>
            </div>

            {/* Support Form & Information Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Submit a Support Ticket</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Our support engineers will respond directly to you</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Online
                  </span>
                </div>

                {ticketSubmitted && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-bold">Ticket Submitted Successfully! ({ticketSubmitted})</p>
                      <p className="text-xs text-emerald-700 mt-1">Your request has been logged. Our help desk will inspect your issue and contact you shortly.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Phone / Mobile
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="+91 98765 00000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="rahul@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="credits">💳 Wallet Credits & UTR Recharge</option>
                        <option value="pdf">🖨️ PDF Slip Printing & Formatting</option>
                        <option value="directory">🗺️ Electoral Data & Booth Hierarchy</option>
                        <option value="account">🔐 Account Credentials & Access</option>
                        <option value="other">💬 General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="normal">🟢 Normal (Within 24 Hours)</option>
                        <option value="high">🟠 High (Within 2 Hours)</option>
                        <option value="urgent">🔴 Urgent / Print Machine Stall</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Issue Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Please write down your question or problem (e.g. UTR reference, booth number, or error prompt)..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Support Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Side Cards (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Rate Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Live Print Rates</span>
                    <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">Per Page</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-4">
                    Credits are deducted straight from your balance when slips are generated:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                      <p className="text-[11px] text-slate-300 font-medium">Without Image</p>
                      <p className="text-xl font-black text-white font-mono mt-0.5">₹0.10</p>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">10 paisa / page</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                      <p className="text-[11px] text-slate-300 font-medium">With Photo</p>
                      <p className="text-xl font-black text-white font-mono mt-0.5">₹0.12</p>
                      <p className="text-[10px] text-purple-300 font-semibold mt-0.5">12 paisa / page</p>
                    </div>
                  </div>
                </div>

                {/* Self-Service Shortcuts */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Self-Service Shortcuts
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Jump straight into the relevant portal tabs:</p>

                  <div className="space-y-2.5">
                    <Link
                      to="/account"
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all text-xs font-semibold text-slate-700 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">₹</span>
                        <div>
                          <p className="text-slate-800 font-bold">Wallet & Recharge</p>
                          <p className="text-[10px] text-slate-400">Add credits via UPI / view history</p>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">&rarr;</span>
                    </Link>

                    <Link
                      to="/?view=assembly"
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all text-xs font-semibold text-slate-700 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">🏛️</span>
                        <div>
                          <p className="text-slate-800 font-bold">Assembly Directory</p>
                          <p className="text-[10px] text-slate-400">State constituencies & booths</p>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 mt-1">Quick answers to common questions about directory usage</p>
              </div>

              <div className="space-y-3 max-w-3xl mx-auto">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50/50"
                    >
                      <span>{faq.q}</span>
                      <span className="text-slate-400 text-lg shrink-0">
                        {activeFaq === idx ? '−' : '+'}
                      </span>
                    </button>
                    {activeFaq === idx && (
                      <div className="px-5 pb-4 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ContactSupport;
