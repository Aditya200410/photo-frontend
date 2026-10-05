import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [utr, setUtr] = useState('');
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/submit-utr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, utr })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error);
        return;
      }
      setStatus('success');
      setMessage('Payment request submitted successfully. Please wait for admin approval.');
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Submitted!</h2>
          <p className="mt-2 text-slate-600">{message}</p>
          <Link to="/login" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Activate Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">Scan the QR code below to make a payment and submit your UTR (Transaction Reference No.)</p>
        </div>
        
        <div className="flex justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=pay%3A%2F%2Fplaceholder" alt="Payment QR" className="rounded-lg shadow-sm w-48 h-48" />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {status === 'error' && <div className="text-red-500 text-sm text-center font-bold p-3 bg-red-50 rounded-lg">{message}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="utr" className="sr-only">UTR / Transaction ID</label>
              <input id="utr" name="utr" type="text" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Enter UTR / Transaction No." value={utr} onChange={e => setUtr(e.target.value)} />
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Submit Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Payment;
