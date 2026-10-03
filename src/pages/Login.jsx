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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Marketing Section - Simple & Trustworthy */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 opacity-90 z-10"></div>
        
        {/* Soft background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-20 right-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-20 flex flex-col justify-center px-16 xl:px-24 w-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="text-4xl font-extrabold text-white tracking-tight">Voter Directory</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Welcome to the <br/>
            Most Trusted Platform for <br/>
            <span className="text-yellow-300">Voter Slip Printing</span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-12 font-medium max-w-lg leading-relaxed">
            Easily search and print voter slips for your entire village or ward. Simple, fast, and 100% secure.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20">
              <div className="bg-white p-2 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Very Easy to Use</h3>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20">
              <div className="bg-white p-2 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Safe & Secure Data</h3>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20">
              <div className="bg-white p-2 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Fast Customer Support</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">Voter Directory</span>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Sign in to your account</h2>
            <p className="text-slate-600 font-medium text-lg">Please enter your email and password.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm text-red-800 font-semibold">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-700">Email Address</label>
              <div className="relative rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none bg-slate-50 border-r border-slate-200 pr-3">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="block w-full pl-16 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-lg" 
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-700">Password</label>
              <div className="relative rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none bg-slate-50 border-r border-slate-200 pr-3">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="block w-full pl-16 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-lg" 
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/40 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-200 text-center bg-slate-50 p-4 rounded-xl">
            <p className="text-slate-700 font-medium text-lg">
              Don't have an account?{' '}
              <br className="sm:hidden" />
              <Link to="/signup" className="text-blue-700 font-bold hover:underline mt-2 inline-block bg-blue-100 px-4 py-2 rounded-lg">
                Create Account Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
