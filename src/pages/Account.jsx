import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Account = () => {
  const [user, setUser] = useState(null);
  const [printHistory, setPrintHistory] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [settings, setSettings] = useState({ upiId: 'elections@upi', qrCodeImage: '' });
  
  const [activeTab, setActiveTab] = useState('recharge'); // 'recharge', 'prints', 'ledger'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Recharge Form State
  const [rechargeAmount, setRechargeAmount] = useState('100');
  const [rechargeUtr, setRechargeUtr] = useState('');
  const [rechargeNotes, setRechargeNotes] = useState('');
  const [isSubmittingRecharge, setIsSubmittingRecharge] = useState(false);
  const [rechargeMessage, setRechargeMessage] = useState('');
  const [rechargeError, setRechargeError] = useState('');

  const navigate = useNavigate();

  const fetchAccountData = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // 1. Fetch user profile
      const userRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userRes.ok) {
        if (userRes.status === 401 || userRes.status === 404) {
          localStorage.removeItem('userToken');
          navigate('/login');
        } else {
          setError('Failed to fetch account details.');
        }
        return;
      }

      const userData = await userRes.json();
      setUser(userData);

      // 2. Fetch user's print history and credit transactions
      const historyRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/user/print-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setPrintHistory(historyData.prints || []);
        setCreditHistory(historyData.creditHistory || []);
        if (historyData.credits !== undefined) {
          setUser(prev => ({ ...prev, credits: historyData.credits }));
        }
      }

      // 3. Fetch user's credit recharge requests
      const reqRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/user/credit-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setCreditRequests(reqData);
      }

      // 4. Fetch system settings for UPI and QR Code
      const settingsRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings`);
      if (settingsRes.ok) {
        const setts = await settingsRes.json();
        setSettings(prev => ({ ...prev, ...setts }));
      }
    } catch (err) {
      setError('Network error while loading account information.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccountData();

    const handleUpdate = () => fetchAccountData();
    window.addEventListener('user-credits-updated', handleUpdate);
    return () => window.removeEventListener('user-credits-updated', handleUpdate);
  }, [navigate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAccountData();
  };

  const handleCopyUpi = () => {
    const upi = settings.upiId || 'elections@upi';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmitRecharge = async (e) => {
    e.preventDefault();
    setRechargeMessage('');
    setRechargeError('');

    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      setRechargeError('Please enter a valid recharge amount greater than 0.');
      return;
    }
    if (!rechargeUtr || !rechargeUtr.trim()) {
      setRechargeError('Please provide the UPI Transaction Reference (UTR) number.');
      return;
    }

    setIsSubmittingRecharge(true);
    const token = localStorage.getItem('userToken');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/user/credit-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amt,
          utr: rechargeUtr.trim(),
          notes: rechargeNotes.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setRechargeMessage('Recharge request submitted successfully! Admin will verify your UTR and credit your balance shortly.');
        setRechargeUtr('');
        setRechargeNotes('');
        // Refresh requests
        fetchAccountData();
        setTimeout(() => setRechargeMessage(''), 8000);
      } else {
        setRechargeError(data.error || 'Failed to submit recharge request.');
      }
    } catch (err) {
      setRechargeError('Network error while submitting recharge request.');
    } finally {
      setIsSubmittingRecharge(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-emerald-400 font-semibold tracking-wider">Loading Profile & UPI Wallet...</p>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalSlipsPrinted = printHistory.reduce((acc, p) => acc + (Number(p.slips_count) || (Number(p.pages_count || 1) * 8)), 0);
  const totalCostDeducted = printHistory.reduce((acc, p) => acc + (Number(p.cost) || 0), 0);
  const withImageCount = printHistory.filter(p => p.has_image).length;
  const withoutImageCount = printHistory.length - withImageCount;

  // Filtered lists
  const filteredPrints = printHistory.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.option_type && p.option_type.toLowerCase().includes(q)) ||
      (p.voter_name && p.voter_name.toLowerCase().includes(q)) ||
      (p.part_no && String(p.part_no).toLowerCase().includes(q)) ||
      (p.ward_no && String(p.ward_no).toLowerCase().includes(q))
    );
  });

  const filteredLedger = creditHistory.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.type && c.type.toLowerCase().includes(q))
    );
  });

  const currentUpiId = settings.upiId || 'elections@upi';
  const qrAmount = parseFloat(rechargeAmount) > 0 ? parseFloat(rechargeAmount) : '100';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative flex flex-col font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-blue-600/15 blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/10 blur-[160px]"></div>
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full p-4 sm:p-6 flex justify-between items-center bg-slate-900/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-wide">My <span className="text-emerald-400">Account</span></span>
            <span className="block text-xs text-slate-400">Wallet, UPI Recharge & Print History</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
            title="Refresh Account Data"
          >
            <svg className={`w-4 h-4 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-2 font-bold text-sm transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Profile & Wallet Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-slate-950 shadow-xl shadow-emerald-500/20 ring-4 ring-white/10">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{user?.name || 'User'}</h1>
                    <p className="text-emerald-400 font-semibold tracking-wider text-xs uppercase mt-0.5">
                      {user?.role === 'admin' ? 'System Administrator' : 'Verified Member'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm mx-auto sm:mx-0 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Account Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-white/5 rounded-xl px-3.5 py-2.5 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Email</span>
                    <span className="text-white font-medium truncate block">{user?.email || '—'}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl px-3.5 py-2.5 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Phone</span>
                    <span className="text-white font-medium">{user?.phone || '—'}</span>
                  </div>
                  {user?.utr && (
                    <div className="bg-white/5 rounded-xl px-3.5 py-2.5 border border-white/5 sm:col-span-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Initial UTR:</span>
                      <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">{user?.utr}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance Hero Card */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-emerald-900/30 border border-emerald-400/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <svg className="w-28 h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  Available Credits
                </span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                  Wallet
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white mb-2">
                ₹{(Number(user?.credits) || 0).toFixed(2)}
              </h2>
              <p className="text-emerald-100/90 text-xs leading-relaxed">
                Recharge anytime using UPI below. Credits will be approved promptly.
              </p>
            </div>

            {/* Print Rate Card Info */}
            <div className="mt-5 pt-4 border-t border-white/20 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Official Print Rates (Per Page):
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                  <span className="text-emerald-200 block text-[10px]">Without Image:</span>
                  <span className="font-extrabold text-white text-sm font-mono">10 Paisa <span className="text-[10px] font-normal text-emerald-200">(₹0.10 / page)</span></span>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                  <span className="text-emerald-200 block text-[10px]">With Image:</span>
                  <span className="font-extrabold text-white text-sm font-mono">12 Paisa <span className="text-[10px] font-normal text-emerald-200">(₹0.12 / page)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/5">
            <span className="text-slate-400 text-xs font-semibold block mb-1">Total Print Jobs</span>
            <span className="text-2xl font-black text-white font-mono">{printHistory.length}</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/5">
            <span className="text-slate-400 text-xs font-semibold block mb-1">Total Slips Printed</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{totalSlipsPrinted.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/5">
            <span className="text-slate-400 text-xs font-semibold block mb-1">Total Spent</span>
            <span className="text-2xl font-black text-rose-400 font-mono">₹{totalCostDeducted.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/5">
            <span className="text-slate-400 text-xs font-semibold block mb-1">Pending Recharges</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {creditRequests.filter(r => r.status === 'pending').length}
            </span>
          </div>
        </div>

        {/* Navigation Tabs for Activity & Recharge */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Wallet Recharge & Print Ledger
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Scan UPI QR to recharge, request credit increase, and track your print jobs.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('recharge')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'recharge' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                💳 UPI Recharge
              </button>
              <button
                onClick={() => setActiveTab('prints')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'prints' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Print History ({printHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ledger' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wallet Ledger ({creditHistory.length})
              </button>
            </div>
          </div>

          {/* TAB 1: UPI RECHARGE & CREDIT REQUEST */}
          {activeTab === 'recharge' && (
            <div className="space-y-8">
              {/* Alert Messages */}
              {rechargeMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl font-medium flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {rechargeMessage}
                </div>
              )}
              {rechargeError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl font-medium text-sm">
                  {rechargeError}
                </div>
              )}

              {/* UPI QR & Payment Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* QR Code & UPI Details Box */}
                <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col items-center text-center shadow-xl">
                  <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Scan & Pay via any UPI App</span>
                    <span className="text-[11px] font-mono text-slate-400">GPay, PhonePe, Paytm</span>
                  </div>

                  {/* QR Code Display */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 mb-4 relative group flex justify-center items-center min-h-[200px]">
                    <img 
                      src={settings.qrCodeImage || 'https://via.placeholder.com/200?text=Scan+QR+Code'} 
                      alt="Payment UPI QR" 
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                    />
                  </div>

                  {/* UPI ID with 1-click Copy */}
                  <div className="w-full bg-white/5 rounded-2xl p-3.5 border border-white/10 flex items-center justify-between gap-2 mt-2">
                    <div className="text-left truncate">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">UPI ID / VPA</span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-white truncate block">{currentUpiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1"
                    >
                      {copiedUpi ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy UPI
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                    Scan the QR code with any UPI app, complete the payment, then copy the <strong>12-digit UTR</strong> and submit the form on the right.
                  </p>
                </div>

                {/* Recharge Request Form */}
                <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
                  <h4 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    Submit Recharge Request
                  </h4>
                  <p className="text-xs text-slate-400 mb-6">
                    Enter the amount you transferred and the UTR / Reference number from your payment receipt.
                  </p>

                  <form onSubmit={handleSubmitRecharge} className="space-y-5">
                    {/* Amount Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Recharge Amount (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-base">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          required
                        />
                      </div>

                      {/* Quick Select Buttons */}
                      <div className="flex gap-2 mt-2.5">
                        {['50', '100', '250', '500', '1000'].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setRechargeAmount(amt)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                              rechargeAmount === amt 
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' 
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* UTR Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Transaction UTR / Reference ID <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={rechargeUtr}
                        onChange={(e) => setRechargeUtr(e.target.value)}
                        placeholder="e.g. 428192837192 (12-digit UPI reference)"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        required
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Found in your Google Pay, PhonePe, or Paytm payment confirmation.
                      </span>
                    </div>

                    {/* Optional Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Remarks / Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={rechargeNotes}
                        onChange={(e) => setRechargeNotes(e.target.value)}
                        placeholder="e.g. Paid from HDFC UPI"
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRecharge}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingRecharge ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Request Credit Increase (₹{rechargeAmount || 0})
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* User's Past Recharge Requests */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  My Credit Recharge Requests ({creditRequests.length})
                </h4>

                {creditRequests.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-xs text-slate-500">
                    No recharge requests submitted yet. Use the form above to top up your balance.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-white/10">
                          <th className="p-3.5">Date & Time</th>
                          <th className="p-3.5">Requested Amount</th>
                          <th className="p-3.5">Payment UTR</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {creditRequests.map(r => (
                          <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-3.5 text-slate-300 whitespace-nowrap">
                              <div className="font-bold text-white">{new Date(r.createdAt).toLocaleDateString()}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="p-3.5 font-mono font-extrabold text-emerald-400 text-sm">
                              ₹{Number(r.amount).toFixed(2)}
                            </td>
                            <td className="p-3.5">
                              <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-lg inline-block">
                                {r.utr}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {r.status === 'approved' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                  ✓ Approved & Added (₹{Number(r.approvedAmount || r.amount).toFixed(2)})
                                </span>
                              ) : r.status === 'rejected' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400" title={r.rejectionReason}>
                                  ✕ Rejected ({r.rejectionReason || 'Declined'})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                  Pending Admin Verification
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Print History Table */}
          {activeTab === 'prints' && (
            <div>
              {/* Search Box */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by voter, option, part..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {filteredPrints.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-bold text-base mb-1">No print history found</h4>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    {searchQuery ? "No prints match your search query." : "You have not generated any slips yet. Start printing voter slips from the directories to see your logs here."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-white/10">
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Print Operation</th>
                        <th className="p-3.5">Details (Part/Ward)</th>
                        <th className="p-3.5">Slips & Pages</th>
                        <th className="p-3.5">Type & Rate</th>
                        <th className="p-3.5 text-right">Cost Deducted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                      {filteredPrints.map((p) => {
                        const slips = p.slips_count || (Number(p.pages_count || 1) * (Number(p.cards_per_page) || 8));
                        const pages = Number(p.pages_count || 1);
                        const hasImg = Boolean(p.has_image);
                        const rate = p.rate_per_page !== undefined 
                          ? Number(p.rate_per_page) 
                          : (p.rate_per_slip !== undefined ? Number(p.rate_per_slip) : (hasImg ? 0.12 : 0.10));
                        const cost = p.cost !== undefined ? Number(p.cost) : Math.round(pages * rate * 100) / 100;
                        const dateObj = new Date(p.timestamp);

                        return (
                          <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-3.5 text-slate-300 whitespace-nowrap">
                              <div className="font-bold text-white">{dateObj.toLocaleDateString()}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-white block">{p.option_type || 'Voter Slip'}</span>
                              <span className="text-[11px] text-slate-400">{p.voter_name || 'Voter'}</span>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              <div>Part: <span className="font-mono text-cyan-400">{p.part_no || '-'}</span></div>
                              {p.ward_no && p.ward_no !== '-' && (
                                <div className="text-[11px] text-slate-400">Ward: {p.ward_no}</div>
                              )}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-bold text-white font-mono">{pages} {pages === 1 ? 'page' : 'pages'}</span>
                              <span className="text-[11px] text-slate-400 block font-mono">({slips} total slips)</span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {hasImg ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                                  🖼️ Photo (12p/pg)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 border border-slate-500/30 text-slate-300">
                                  📄 Text (10p/pg)
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <span className="font-extrabold font-mono text-rose-400 text-sm">
                                -₹{cost.toFixed(2)}
                              </span>
                              {p.balance_after !== null && p.balance_after !== undefined && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  bal: ₹{Number(p.balance_after).toFixed(2)}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Wallet Ledger Table */}
          {activeTab === 'ledger' && (
            <div>
              {/* Search Box */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ledger transactions..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {filteredLedger.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                  <p className="text-slate-400 text-sm">No ledger transactions recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-white/10">
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Transaction Type</th>
                        <th className="p-3.5">Description</th>
                        <th className="p-3.5 text-right">Amount</th>
                        <th className="p-3.5 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                      {filteredLedger.map((c) => {
                        const isCredit = (c.amount || 0) > 0;
                        const dateObj = new Date(c.timestamp);

                        return (
                          <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-3.5 text-slate-300 whitespace-nowrap">
                              <div className="font-bold text-white">{dateObj.toLocaleDateString()}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {isCredit ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                  + Credit Added
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                                  - Deduction
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-200">
                              {c.description || (isCredit ? 'Credit recharge' : 'Print deduction')}
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap font-mono font-bold">
                              {isCredit ? (
                                <span className="text-emerald-400">+₹{Math.abs(c.amount).toFixed(2)}</span>
                              ) : (
                                <span className="text-rose-400">-₹{Math.abs(c.amount).toFixed(2)}</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap font-mono font-bold text-white">
                              ₹{(Number(c.balanceAfter) || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Account;
