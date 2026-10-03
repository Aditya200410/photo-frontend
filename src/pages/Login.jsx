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
          setError(data.error || 'Login failed. Please check your email and password.');
        }
        return;
      }
      
      localStorage.setItem('userToken', data.token);
      
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
      
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please check your internet connection.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-slate-900">
      {/* Abstract Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/auth-bg.jpg')", opacity: 0.8 }}
      ></div>
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side - Marketing / Info */}
        <div className="w-full lg:w-1/2 p-10 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          
          {/* Subtle glow behind text */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-wide">Voter<span className="text-emerald-400">Directory</span></span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              Welcome back to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">The Ultimate Tool</span>
            </h1>
            
            <p className="text-lg text-slate-200 mb-10 font-medium max-w-md leading-relaxed">
              Login to access your powerful electoral management dashboard, seamlessly print slips, and manage voter data.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-white font-medium">Lightning Fast Printing</h3>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-white font-medium">100% Secure & Reliable</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-10 lg:p-14 bg-slate-900/60 backdrop-blur-2xl flex flex-col justify-center relative">
          
          <div className="max-w-md w-full mx-auto relative z-20">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-slate-400 font-medium text-base">Enter your credentials to continue</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl backdrop-blur-md">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Authenticating...
                    </span>
                  ) : 'Sign In'}
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-slate-400 font-medium text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
