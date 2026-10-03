import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.');
        return;
      }
      
      navigate('/payment?userId=' + data.userId);
      
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please check your connection.');
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
      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row-reverse bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden mt-4 mb-4">
        
        {/* Right Side - Marketing / Info */}
        <div className="hidden lg:flex w-full lg:w-1/2 p-8 lg:p-14 flex-col justify-center border-l border-white/10 relative overflow-hidden">
          
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-wide">Voter<span className="text-blue-400">Directory</span></span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              Create your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Premium Account</span>
            </h1>
            
            <p className="text-lg text-slate-200 mb-10 font-medium max-w-md leading-relaxed">
              Join thousands of professionals across the country relying on our top-tier electoral system.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10">
                <div className="text-2xl font-black text-white mb-1">5M+</div>
                <div className="text-slate-300 font-medium text-sm">Slips Printed</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10">
                <div className="text-2xl font-black text-white mb-1">99.9%</div>
                <div className="text-slate-300 font-medium text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side - Signup Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-14 bg-slate-900/60 backdrop-blur-2xl flex flex-col justify-center relative">
          
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8 relative z-20">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-xl font-extrabold text-white tracking-wide">Voter<span className="text-emerald-400">Directory</span></span>
          </div>
          
          <div className="max-w-md w-full mx-auto relative z-20">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Register</h2>
              <p className="text-slate-400 font-medium text-base">Fill in the details to get started.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSignup}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl backdrop-blur-md">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="block w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    className="block w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="block w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="you@example.com"
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
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="block w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/25 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-slate-400 font-medium text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Signup;
