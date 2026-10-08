import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('requests'); // 'requests' or 'users'
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [siteSettings, setSiteSettings] = useState(null);

  // Modal states for Approval with Credit
  const [approvingUser, setApprovingUser] = useState(null);
  const [approvalCredit, setApprovalCredit] = useState('100');
  const [isApproving, setIsApproving] = useState(false);

  // Modal states for Editing Credits on Active User
  const [managingCreditUser, setManagingCreditUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState('50');
  const [creditAction, setCreditAction] = useState('add'); // 'add' or 'set'
  const [isUpdatingCredit, setIsUpdatingCredit] = useState(false);

  // Modal states for Approving a Credit Increase Request
  const [approvingRequest, setApprovingRequest] = useState(null);
  const [overrideCreditAmount, setOverrideCreditAmount] = useState('');
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/admin/users`, {
        headers: { 'Authorization': 'Bearer DUMMY' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Failed to load users');
    }
  };

  const fetchCreditRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/admin/credit-requests`, {
        headers: { 'Authorization': 'Bearer DUMMY' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCreditRequests(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings`);
      const data = await res.json();
      setSiteSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchCreditRequests(), fetchSettings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Approving user registration
  const openApproveModal = (user) => {
    setApprovingUser(user);
    setApprovalCredit('100');
  };

  const handleConfirmApprove = async () => {
    if (!approvingUser) return;
    const creditVal = parseFloat(approvalCredit);
    if (isNaN(creditVal) || creditVal < 0) {
      alert('Please enter a valid credit amount (minimum 0).');
      return;
    }

    setIsApproving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/admin/approve-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY'
        },
        body: JSON.stringify({ 
          userId: approvingUser.id,
          credit: creditVal
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`User "${approvingUser.name}" approved successfully with ₹${creditVal.toFixed(2)} credit!`);
        setApprovingUser(null);
        fetchUsers();
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert(data.error || 'Failed to approve user');
      }
    } catch(e) {
      console.error(e);
      alert('Network error while approving user');
    } finally {
      setIsApproving(false);
    }
  };

  // Managing credits manually for active user
  const openManageCreditModal = (user) => {
    setManagingCreditUser(user);
    setCreditAmount('50');
    setCreditAction('add');
  };

  const handleUpdateCredit = async () => {
    if (!managingCreditUser) return;
    const amountVal = parseFloat(creditAmount);
    if (isNaN(amountVal) || amountVal < 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsUpdatingCredit(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/admin/update-credits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY'
        },
        body: JSON.stringify({ 
          userId: managingCreditUser.id,
          amount: amountVal,
          action: creditAction
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Credits updated for ${managingCreditUser.name}! New balance: ₹${data.credits.toFixed(2)}`);
        setManagingCreditUser(null);
        fetchUsers();
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert(data.error || 'Failed to update credits');
      }
    } catch(e) {
      console.error(e);
      alert('Network error while updating credits');
    } finally {
      setIsUpdatingCredit(false);
    }
  };

  // Block / Unblock user
  const handleToggleBlock = async (userId, currentStatus) => {
    const isBlocked = currentStatus === 'blocked';
    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/admin/toggle-block-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY'
        },
        body: JSON.stringify({ userId, block: !isBlocked })
      });
      if (res.ok) {
        setMessage(`User successfully ${action}ed!`);
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch(e) {
      console.error(e);
    }
  };

  // --- Credit Request Actions ---
  const openApproveRequestModal = (request) => {
    setApprovingRequest(request);
    setOverrideCreditAmount(String(request.amount));
  };

  const handleConfirmApproveRequest = async () => {
    if (!approvingRequest) return;
    const finalAmount = parseFloat(overrideCreditAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    setIsProcessingRequest(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/admin/approve-credit-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY'
        },
        body: JSON.stringify({
          requestId: approvingRequest.id,
          approvedAmount: finalAmount
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Approved recharge of ₹${finalAmount.toFixed(2)} for ${approvingRequest.userName}!`);
        setApprovingRequest(null);
        fetchCreditRequests();
        fetchUsers();
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert(data.error || 'Failed to approve credit request');
      }
    } catch(e) {
      console.error(e);
      alert('Network error while approving request');
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const handleRejectRequest = async (request) => {
    const reason = window.prompt(`Enter rejection reason for ${request.userName}'s request (UTR: ${request.utr}):`, 'Invalid UTR / Payment not received');
    if (reason === null) return; // user cancelled

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/admin/reject-credit-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY'
        },
        body: JSON.stringify({
          requestId: request.id,
          reason: reason
        })
      });
      if (res.ok) {
        setMessage(`Credit request for ${request.userName} rejected.`);
        fetchCreditRequests();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch(e) {
      console.error(e);
      alert('Failed to reject credit request');
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending_approval');
  const activeUsers = users.filter(u => (u.status === 'active' || u.status === 'blocked') && u.role !== 'admin');
  const pendingCreditRequests = creditRequests.filter(r => r.status === 'pending');
  const processedCreditRequests = creditRequests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading user management & credit requests...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">User & Credit Management</h2>
          <p className="text-slate-500 text-sm mt-1">Verify payment UTRs, approve recharge requests, and manage member wallets.</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/70 rounded-2xl px-4 py-2 text-xs font-semibold text-emerald-800 self-start sm:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Rates: {(siteSettings?.rateWithoutImage ?? 0.10) * 100}p (no image) | {(siteSettings?.rateWithImage ?? 0.12) * 100}p (with image)
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-medium flex items-center gap-3 shadow-sm">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <button
          onClick={() => setActiveAdminTab('requests')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeAdminTab === 'requests'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Credit Increase Requests
          {pendingCreditRequests.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeAdminTab === 'requests' ? 'bg-amber-400 text-slate-900' : 'bg-amber-500 text-white animate-pulse'
            }`}>
              {pendingCreditRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeAdminTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Users & Approvals
          {pendingUsers.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeAdminTab === 'users' ? 'bg-amber-400 text-slate-900' : 'bg-amber-500 text-white'
            }`}>
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* --- TAB 1: CREDIT INCREASE REQUESTS --- */}
      {activeAdminTab === 'requests' && (
        <div className="space-y-8">
          {/* Pending Credit Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                Pending Recharge Requests ({pendingCreditRequests.length})
              </h3>
              <span className="text-xs text-slate-400 font-medium">Verify UTR and click Approve to add credits instantly</span>
            </div>

            {pendingCreditRequests.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
                No pending credit increase requests at this time.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Requested Amount</th>
                      <th className="p-3.5">Transaction UTR</th>
                      <th className="p-3.5">Current Balance</th>
                      <th className="p-3.5">Date & Notes</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingCreditRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">
                          <div>{r.userName}</div>
                          <div className="text-xs text-slate-400 font-normal">{r.userEmail}</div>
                          {r.userPhone && <div className="text-[11px] text-slate-400 font-mono">{r.userPhone}</div>}
                        </td>
                        <td className="p-3.5 font-mono text-base font-black text-emerald-600">
                          ₹{Number(r.amount).toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-lg px-2.5 py-1 inline-block select-all">
                            {r.utr}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-sm font-bold text-slate-700">
                          ₹{(Number(r.currentUserCredits) || 0).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-xs text-slate-500">
                          <div>{new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          {r.notes && <div className="text-slate-400 italic mt-0.5 max-w-xs truncate">"{r.notes}"</div>}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => openApproveRequestModal(r)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                          >
                            Approve & Add ₹{Number(r.amount).toFixed(0)}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(r)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Processed Credit Requests History */}
          {processedCreditRequests.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                Processed Requests History ({processedCreditRequests.length})
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3">Date</th>
                      <th className="p-3">User</th>
                      <th className="p-3">UTR</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedCreditRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {r.userName} <span className="text-slate-400 font-normal">({r.userEmail})</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{r.utr}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          ₹{Number(r.approvedAmount || r.amount).toFixed(2)}
                        </td>
                        <td className="p-3">
                          {r.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                              ✓ Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700" title={r.rejectionReason}>
                              ✕ Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: USER REGISTRATION APPROVALS & ACTIVE USERS --- */}
      {activeAdminTab === 'users' && (
        <div className="space-y-10">
          {/* Pending Approvals Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Pending Registrations & Appeals ({pendingUsers.length})
              </h3>
              <span className="text-xs text-slate-400 font-medium">Verify UTR and grant credit upon approving</span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm">
                No pending registrations or appeals.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email / Phone</th>
                      <th className="p-3.5">Payment UTR</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{u.name}</td>
                        <td className="p-3.5 text-sm">
                          <div className="text-slate-800 font-medium">{u.email}</div>
                          <div className="text-slate-400 text-xs font-mono">{u.phone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 rounded-lg px-2.5 py-1 inline-block">
                            {u.utr || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button 
                            onClick={() => openApproveModal(u)} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ml-auto"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve & Grant Credit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Users Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Active Users & Wallets ({activeUsers.length})
              </h3>
              <span className="text-xs text-slate-400 font-medium">Manage user credits and access</span>
            </div>

            {activeUsers.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm">
                No active regular users found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email / Phone</th>
                      <th className="p-3.5">UTR</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Current Credit (₹)</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeUsers.map(u => (
                      <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${u.status === 'blocked' ? 'bg-rose-50/40' : ''}`}>
                        <td className="p-3.5 font-bold text-slate-800">
                          {u.name}
                        </td>
                        <td className="p-3.5 text-sm">
                          <div className="text-slate-800 font-medium">{u.email}</div>
                          <div className="text-slate-400 text-xs font-mono">{u.phone}</div>
                        </td>
                        <td className="p-3.5 font-mono text-xs text-slate-500">{u.utr || '-'}</td>
                        <td className="p-3.5">
                          {u.status === 'blocked' ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                Blocked
                              </span>
                              <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">False Payment Info</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-sm">
                            <span>₹{(Number(u.credits) || 0).toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button 
                            onClick={() => openManageCreditModal(u)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                            title="Add or edit user credits"
                          >
                            + Add / Set Credit
                          </button>
                          <button 
                            onClick={() => handleToggleBlock(u.id, u.status)} 
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                              u.status === 'blocked' 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200/80'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200/80'
                            }`}
                          >
                            {u.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Approve Credit Increase Request */}
      {approvingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ₹
                </span>
                Approve Credit Increase
              </h3>
              <button onClick={() => setApprovingRequest(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">User:</span>
                <span className="font-bold text-slate-800">{approvingRequest.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-medium text-slate-800">{approvingRequest.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment UTR:</span>
                <span className="font-mono font-bold text-blue-600">{approvingRequest.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Current Balance:</span>
                <span className="font-mono font-bold text-slate-700">₹{(Number(approvingRequest.currentUserCredits) || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Credit to Add to User Wallet (₹):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-lg">
                  ₹
                </span>
                <input 
                  type="number"
                  min="1"
                  step="0.01"
                  value={overrideCreditAmount}
                  onChange={(e) => setOverrideCreditAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 font-black text-lg outline-none"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Requested amount: ₹{Number(approvingRequest.amount).toFixed(2)}</p>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setApprovingRequest(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 text-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmApproveRequest}
                disabled={isProcessingRequest}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {isProcessingRequest ? 'Processing...' : `Confirm & Add ₹${parseFloat(overrideCreditAmount || 0).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Approve User Registration */}
      {approvingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
                Approve User & Give Credit
              </h3>
              <button onClick={() => setApprovingUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">User Name:</span>
                <span className="font-bold text-slate-800">{approvingUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-medium text-slate-800">{approvingUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">UTR Reference:</span>
                <span className="font-mono font-bold text-blue-600">{approvingUser.utr || 'N/A'}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Credit to Grant (in ₹ Rupees):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-lg">
                  ₹
                </span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={approvalCredit}
                  onChange={(e) => setApprovalCredit(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 font-black text-lg outline-none"
                  placeholder="e.g. 100"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2 mt-3">
                {['50', '100', '250', '500', '1000'].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setApprovalCredit(amt)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      approvalCredit === amt 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span>📄 Without Image: <strong>₹{Number(siteSettings?.rateWithoutImage ?? 0.10).toFixed(2)} / page</strong></span>
                <span>🖼️ With Image: <strong>₹{Number(siteSettings?.rateWithImage ?? 0.12).toFixed(2)} / page</strong></span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setApprovingUser(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 text-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmApprove}
                disabled={isApproving}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {isApproving ? 'Approving...' : `Approve & Grant ₹${parseFloat(approvalCredit || 0).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Manage Credits for Active User */}
      {managingCreditUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  ₹
                </span>
                Manage User Credits
              </h3>
              <button onClick={() => setManagingCreditUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">User:</span>
                <span className="font-bold text-slate-800">{managingCreditUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Current Balance:</span>
                <span className="font-extrabold text-emerald-600 text-base">₹{(Number(managingCreditUser.credits) || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setCreditAction('add')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  creditAction === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Add Credits (Top-up)
              </button>
              <button
                type="button"
                onClick={() => setCreditAction('set')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  creditAction === 'set' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Set Fixed Total
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {creditAction === 'add' ? 'Amount to Add (₹):' : 'New Exact Balance (₹):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-lg">
                  ₹
                </span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-black text-lg outline-none"
                  placeholder="50"
                />
              </div>

              {creditAction === 'add' && (
                <div className="flex gap-2 mt-3">
                  {['25', '50', '100', '250', '500'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCreditAmount(amt)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        creditAmount === amt 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setManagingCreditUser(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 text-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleUpdateCredit}
                disabled={isUpdatingCredit}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {isUpdatingCredit ? 'Updating...' : 'Save Credits'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
