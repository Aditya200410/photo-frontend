const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. App.jsx
let appJsx = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8');
appJsx = `import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Option1 from './pages/Option1';
import Option2 from './pages/Option2';
import Option3 from './pages/Option3';
import Admin from './pages/Admin';
import AdminAddExcel from './pages/AdminAddExcel';
import AdminAddExcelAssembly from './pages/AdminAddExcelAssembly';
import AdminAddExcelNagarNigam from './pages/AdminAddExcelNagarNigam';
import AdminAddExcelPanchayat from './pages/AdminAddExcelPanchayat';
import AdminPrintData from './pages/AdminPrintData';
import AdminPrintDataAssembly from './pages/AdminPrintDataAssembly';
import AdminPrintDataNagarNigam from './pages/AdminPrintDataNagarNigam';
import AdminPrintDataPanchayat from './pages/AdminPrintDataPanchayat';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';
import PhotoIndex from './pages/PhotoIndex';
import PhotoAssembly from './pages/PhotoAssembly';
import PhotoNagarNigam from './pages/PhotoNagarNigam';
import PhotoGramPanchayat from './pages/PhotoGramPanchayat';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactSupport from './pages/ContactSupport';
import FloatingButtons from './components/FloatingButtons';
import ScrollToTop from './components/ScrollToTop';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminPrivacyPolicy from './pages/AdminPrivacyPolicy';
import AdminTerms from './pages/AdminTerms';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Payment from './pages/Payment';

function App() {
  return (
    <>
      <ScrollToTop />
      <FloatingButtons />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/payment" element={<Payment />} />
      
      {/* Protected User Routes */}
      <Route path="/" element={<UserProtectedRoute><PhotoIndex /></UserProtectedRoute>} />
      <Route path="/option/1" element={<UserProtectedRoute><Option1 /></UserProtectedRoute>} />
      <Route path="/option/2" element={<UserProtectedRoute><Option2 /></UserProtectedRoute>} />
      <Route path="/option/3" element={<UserProtectedRoute><Option3 /></UserProtectedRoute>} />
      <Route path="/photo" element={<UserProtectedRoute><Home /></UserProtectedRoute>} />
      
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<Admin />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="add-excel" element={<AdminAddExcel />} />
        <Route path="add-excel/assembly" element={<AdminAddExcelAssembly />} />
        <Route path="add-excel/nagar-nigam" element={<AdminAddExcelNagarNigam />} />
        <Route path="add-excel/panchayat" element={<AdminAddExcelPanchayat />} />
        <Route path="print-data" element={<AdminPrintData />} />
        <Route path="print-data/assembly" element={<AdminPrintDataAssembly />} />
        <Route path="print-data/nagar-nigam" element={<AdminPrintDataNagarNigam />} />
        <Route path="print-data/panchayat" element={<AdminPrintDataPanchayat />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="privacy-policy" element={<AdminPrivacyPolicy />} />
        <Route path="terms" element={<AdminTerms />} />
      </Route>
      
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/contact-support" element={<ContactSupport />} />
      </Routes>
    </>
  );
}

export default App;
`;
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsx);

// 2. UserProtectedRoute.jsx
const userProtectedRouteCode = `import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default UserProtectedRoute;
`;
fs.writeFileSync(path.join(srcDir, 'components', 'UserProtectedRoute.jsx'), userProtectedRouteCode);

// 3. Login.jsx
const loginCode = `import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
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
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-500 text-sm text-center font-bold p-3 bg-red-50 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Sign in
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/signup" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Login.jsx'), loginCode);

// 4. Signup.jsx
const signupCode = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/signup\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      
      navigate('/payment?userId=' + data.userId);
      
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && <div className="text-red-500 text-sm text-center font-bold p-3 bg-red-50 rounded-lg">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                Sign Up
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Signup;
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Signup.jsx'), signupCode);

// 5. Payment.jsx
const paymentCode = `import React, { useState, useEffect } from 'react';
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
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submit-utr\`, {
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
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'Payment.jsx'), paymentCode);

// 6. AdminUsers.jsx
const adminUsersCode = `import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      // In this app, admin login uses environment variable currently, 
      // but to call the backend we need a token. We'll pass a dummy token or if the backend authMiddleware allows it.
      // Wait, we need to bypass authMiddleware or use a real admin token. 
      // Assuming authMiddleware is updated or we just pass the dummy token for now.
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users\`, {
        // Temp hack since we don't have a real admin token yet in the frontend admin state
        headers: { 'Authorization': 'Bearer DUMMY' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/approve-user\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY'
        },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setMessage('User approved!');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending_approval');
  const activeUsers = users.filter(u => u.status === 'active' && u.role !== 'admin');

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">User Management</h2>
      {message && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">{message}</div>}
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-amber-600 mb-4 border-b pb-2">Pending Approvals</h3>
        {pendingUsers.length === 0 ? <p className="text-slate-500">No pending approvals.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Phone</th>
                  <th className="p-3 border-b">UTR</th>
                  <th className="p-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600">{u.phone}</td>
                    <td className="p-3 font-mono text-blue-600 bg-blue-50 rounded px-2">{u.utr}</td>
                    <td className="p-3">
                      <button onClick={() => handleApprove(u.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 rounded shadow-sm text-sm font-bold">Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Active Users</h3>
        {activeUsers.length === 0 ? <p className="text-slate-500">No active users.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Phone</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600">{u.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminUsers;
`;
fs.writeFileSync(path.join(srcDir, 'pages', 'AdminUsers.jsx'), adminUsersCode);

console.log('Frontend setup for auth complete');
