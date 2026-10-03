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
    <div className="min-h-screen bg-slate-50 flex flex-row-reverse">
      {/* Right Marketing Section - Simple & Trustworthy */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-green-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-600 opacity-90 z-10"></div>
        
        {/* Soft background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-20 right-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-20 flex flex-col justify-center px-16 xl:px-24 w-full">
          
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-10">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Join thousands of local leaders using our system.
          </h1>
          
          <p className="text-xl text-green-100 mb-12 font-medium max-w-lg leading-relaxed">
            Create your account today to easily print Voter Slips for Assembly, Nagar Nigam, and Panchayat elections.
          </p>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-8 max-w-md">
            <h3 className="text-yellow-300 font-bold text-xl mb-2">Why register?</h3>
            <ul className="space-y-3 text-white font-medium text-lg">
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Save time with fast printing</li>
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Very easy to understand</li>
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 100% Secure and safe</li>
            </ul>
          </div>
          
        </div>
      </div>

      {/* Left Signup Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative bg-white">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">Voter Directory</span>
        </div>

        <div className="w-full max-w-md mt-12 lg:mt-0">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Create Your Account</h2>
            <p className="text-slate-600 font-medium text-lg">Please fill the form below to register.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm text-red-800 font-semibold">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-700">Full Name</label>
              <div className="relative rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none bg-slate-50 border-r border-slate-200 pr-3">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="block w-full pl-16 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-lg" 
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-700">Phone Number</label>
              <div className="relative rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none bg-slate-50 border-r border-slate-200 pr-3">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="block w-full pl-16 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-lg" 
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-700">Email Address</label>
              <div className="relative rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none bg-slate-50 border-r border-slate-200 pr-3">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="block w-full pl-16 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-lg" 
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-700">Password</label>
              <div className="relative rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none bg-slate-50 border-r border-slate-200 pr-3">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="block w-full pl-16 pr-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-lg" 
                  placeholder="Enter a password"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-green-500/40 text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-200 text-center bg-slate-50 p-4 rounded-xl">
            <p className="text-slate-700 font-medium text-lg">
              Already have an account?{' '}
              <br className="sm:hidden" />
              <Link to="/login" className="text-green-700 font-bold hover:underline mt-2 inline-block bg-green-100 px-4 py-2 rounded-lg">
                Sign In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Signup;
