import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import { setAuthSession, isUserLoggedIn, getUserToken } from '../utils/auth';

const Login = () => {
  // Step 1: phone, Step 2: otp, Step 3: name (only if user doesn't already have a name)
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [userRole, setUserRole] = useState('user');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isUserLoggedIn()) {
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });
    }
  }, [navigate, location]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      
      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP.');
        return;
      }
      
      setMessage('OTP sent successfully to your mobile number!');
      setStep(2);
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please check your internet connection.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!otp || otp.trim().length === 0) {
      setError('Please enter the OTP received.');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: otp.trim() })
      });
      
      const data = await res.json();
      setIsLoading(false);
      
      if (!res.ok) {
        if (data.status === 'blocked') {
          navigate('/payment?userId=' + data.userId + '&status=blocked');
          return;
        } else {
          setError(data.error || 'OTP verification failed.');
          return;
        }
      }

      // Check if user has a name already
      if (data.hasName && data.user?.name) {
        // Name is already present: Log directly into dashboard!
        setAuthSession({ token: data.token, role: data.role || 'user' });
        const origin = location.state?.from?.pathname || '/';
        navigate(origin, { replace: true });
      } else {
        // Name is NOT present: prompt for name, then save it
        setTempToken(data.token);
        setUserRole(data.role || 'user');
        setStep(3);
        setMessage('OTP verified! Please enter your name to complete your profile.');
      }
      
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please check your internet connection.');
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name || !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/save-name`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ name: name.trim() })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to save name.');
        return;
      }

      // Successfully saved name, finalize session and redirect to dashboard
      setAuthSession({ token: tempToken, role: userRole });
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please try again.');
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
              Fast, secure and seamless OTP login to manage your voter slips and electoral directories.
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Instant OTP</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> No Password</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> 100% Secure</span>
            </div>
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
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                {step === 1 && 'Sign In with Mobile'}
                {step === 2 && 'Verify Mobile OTP'}
                {step === 3 && 'What should we call you?'}
              </h2>
              <p className="text-slate-400 font-medium text-base">
                {step === 1 && 'Enter your mobile number to get a verification code'}
                {step === 2 && `Enter the 6-digit OTP sent to +91 ${phone}`}
                {step === 3 && 'Please enter your name to complete registration'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl backdrop-blur-md mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-xl backdrop-blur-md mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-emerald-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <p className="text-sm text-emerald-200 font-medium">{message}</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-300 ml-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</span>
                    <input 
                      type="tel" 
                      required 
                      autoFocus
                      maxLength={10}
                      value={phone} 
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                      className="block w-full pl-14 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm text-lg tracking-wider" 
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP →'}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-300 ml-1">Enter OTP Code</label>
                  <input 
                    type="text" 
                    required 
                    autoFocus
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                    className="block w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold backdrop-blur-sm text-center text-3xl tracking-[0.3em]" 
                    placeholder="••••••"
                    maxLength={6}
                  />
                </div>
                
                <div className="pt-2 flex flex-col gap-3">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/25 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
                  </button>
                  <div className="flex items-center justify-between text-xs font-semibold px-1">
                    <button 
                      type="button" 
                      onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      Change Number
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === 3 && (
              <form className="space-y-5" onSubmit={handleSaveName}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-300 ml-1">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    autoFocus
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="block w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium backdrop-blur-sm text-base" 
                    placeholder="e.g. Rahul Sharma"
                  />
                  <p className="text-xs text-slate-400 mt-1 ml-1">
                    This will appear in your dashboard header and greeting. You won't be asked again.
                  </p>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? 'Saving...' : 'Save & Go to Dashboard →'}
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
