import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';

const Login = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      
      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP.');
        return;
      }
      
      setMessage('OTP sent successfully!');
      setStep(2);
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please check your internet connection.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      
      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        if (data.status === 'pending_payment' || data.status === 'blocked') {
          navigate('/payment?userId=' + data.userId + '&status=' + data.status);
        } else {
          setError(data.error || 'OTP Verification failed.');
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
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/auth-bg.jpg')", opacity: 0.8 }}
      ></div>
      <div className="absolute inset-0 z-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden mt-4 mb-4">
        
        <div className="hidden lg:flex w-full lg:w-1/2 p-8 lg:p-14 flex-col justify-center border-r border-white/10 relative overflow-hidden">
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
              Login securely using OTP to access your powerful electoral management dashboard.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-14 bg-slate-900/60 backdrop-blur-2xl flex flex-col justify-center relative">
          
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8 relative z-20">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="text-xl font-extrabold text-white tracking-wide">Voter<span className="text-emerald-400">Directory</span></span>
          </div>
          
          <div className="max-w-md w-full mx-auto relative z-20">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Sign In with OTP</h2>
              <p className="text-slate-400 font-medium text-base">
                {step === 1 ? 'Enter your details to receive an OTP' : 'Enter the OTP sent to your phone'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl backdrop-blur-md mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-xl backdrop-blur-md mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-emerald-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <p className="text-sm text-emerald-200 font-medium">{message}</p>
                </div>
              </div>
            )}

            {step === 1 ? (
              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="block w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="block w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-300 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="block w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm" 
                    placeholder="Enter your 10-digit phone number"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-70"
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-300 ml-1">OTP</label>
                  <input 
                    type="text" 
                    required 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    className="block w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm text-center text-2xl tracking-widest" 
                    placeholder="XXXXXX"
                    maxLength={6}
                  />
                </div>
                
                <div className="pt-2 flex flex-col gap-3">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-70"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="w-full py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Back to details
                  </button>
                </div>
              </form>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
