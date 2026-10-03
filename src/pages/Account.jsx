import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          if (res.status === 401 || res.status === 404) {
            localStorage.removeItem('userToken');
            navigate('/login');
          } else {
            setError('Failed to fetch account details.');
          }
          return;
        }
        
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-emerald-400 font-semibold tracking-wider">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative flex flex-col font-inter">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/10 blur-[150px]"></div>
      </div>

      <header className="relative z-10 w-full p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">My <span className="text-emerald-400">Account</span></span>
        </div>
        <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-2 font-medium transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>
      </header>
      
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 w-full max-w-4xl mx-auto">
        
        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl w-full text-center">
            {error}
          </div>
        ) : (
          <div className="w-full bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mt-4 mb-8">
            
            {/* Header Profile Section */}
            <div className="relative overflow-hidden p-8 sm:p-12 border-b border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
                <div className="w-28 h-28 shrink-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl font-black text-slate-900 shadow-xl shadow-emerald-500/20 ring-4 ring-white/10">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-white tracking-tight">{user?.name || 'User'}</h1>
                      <p className="text-emerald-400 font-medium tracking-wider text-sm uppercase mt-1">
                        {user?.role === 'admin' ? 'System Administrator' : 'Premium Member'}
                      </p>
                    </div>
                    
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm mx-auto sm:mx-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active Status
                    </span>
                  </div>
                  
                  <p className="text-slate-400 mt-4 max-w-lg leading-relaxed text-sm">
                    Welcome to your profile. Your account is fully verified and you have unrestricted access to the Electoral Management System tools.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Details Section */}
            <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    Profile Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                      <div className="text-lg text-white font-medium">{user?.name || '—'}</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                      <div className="text-lg text-white font-medium break-all">{user?.email || '—'}</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                      <div className="text-lg text-white font-medium">{user?.phone || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Account Capabilities
                  </h3>
                  
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl p-6 sm:p-8 border border-emerald-500/20 shadow-inner">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/30">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Account Approved & Active</h4>
                    <p className="text-emerald-200/80 text-sm leading-relaxed">
                      You have full access to the Voter Directory slip printing tools, advanced search capabilities, and PDF generation module.
                    </p>
                  </div>
                </div>

                {user?.utr && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Transaction Reference (UTR)</label>
                    <div className="font-mono text-cyan-400 bg-cyan-950/30 rounded-lg px-3 py-2 text-sm border border-cyan-500/20 inline-block">
                      {user?.utr}
                    </div>
                  </div>
                )}
              </div>
              
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
};

export default Account;
