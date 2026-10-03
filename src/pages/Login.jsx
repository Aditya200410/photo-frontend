import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        if (data.status === 'pending_payment') {
          navigate('/payment?userId=' + data.userId);
        } else {
          setError(data.error || 'Login failed');
        }
        return;
      }
      
      localStorage.setItem('userToken', data.token);
      
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
      
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 opacity-90 z-10"></div>
        
        {/* Abstract shapes for background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-20 flex flex-col justify-center px-16 xl:px-24 w-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">VoterDir<span className="text-blue-400">Pro</span></span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            India's Most Powerful <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Electoral Management</span> Platform
          </h1>
          
          <p className="text-xl text-blue-100 mb-12 font-medium max-w-lg leading-relaxed">
            Generate and manage voter slips for Assembly, Nagar Nigam, and Gram Panchayat elections in seconds. 
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-blue-500/30 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Lightning Fast Printing</h3>
                <p className="text-blue-200">Print thousands of fully-formatted slips per hour instantly.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-blue-500/30 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Bank-Grade Security</h3>
                <p className="text-blue-200">Your electoral data is secured with enterprise-level encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">VoterDir<span className="text-blue-600">Pro</span></span>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium text-lg">Sign in to your account to continue.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-semibold">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium bg-slate-50 focus:bg-white" 
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">Password</label>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium bg-slate-50 focus:bg-white" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-600 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-bold hover:underline underline-offset-4 transition-all">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
