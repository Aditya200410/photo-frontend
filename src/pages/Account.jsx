import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

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
          if (res.status === 401) {
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500 font-medium">Loading account details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold mx-auto shadow-lg mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-blue-100 mt-1">{user?.role === 'admin' ? 'Administrator' : 'Premium Member'}</p>
              
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-400 text-green-900 shadow-sm">
                  Active
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                  <div className="text-slate-800 font-semibold">{user?.name}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                  <div className="text-slate-800 font-semibold">{user?.email}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                  <div className="text-slate-800 font-semibold">{user?.phone}</div>
                </div>
                
                {user?.utr && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Transaction Ref (UTR)</label>
                    <div className="text-slate-800 font-mono bg-slate-100 inline-block px-2 py-1 rounded text-sm">
                      {user?.utr}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Account Status</h2>
            <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Account Approved & Active</h3>
                <div className="mt-1 text-sm text-green-700">
                  You have full access to the Voter Directory slip printing tools.
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Account;
