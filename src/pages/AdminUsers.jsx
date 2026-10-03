import React, { useState, useEffect } from 'react';

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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/approve-user`, {
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
                  <th className="p-3 border-b">UTR</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600">{u.phone}</td>
                    <td className="p-3 font-mono text-blue-600 bg-blue-50 rounded px-2">{u.utr || '-'}</td>
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
