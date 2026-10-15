import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { getAdminToken } from '../utils/auth';

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

  // Modal states for Viewing Full User Details, Credit Spending & Past Records
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [activeRequestDetail, setActiveRequestDetail] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsData, setUserDetailsData] = useState(null);
  const [detailsTab, setDetailsTab] = useState('spending'); // 'spending' | 'fetches' | 'ledger' | 'profile'
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${getAdminToken() || ''}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to load users (status ${res.status})`);
      }
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
      const res = await fetch(`${API_BASE_URL}/api/admin/credit-requests`, {
        headers: { 'Authorization': `Bearer ${getAdminToken() || ''}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to load credit requests (status ${res.status})`);
      }
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
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (!res.ok) {
        throw new Error(`Failed to load settings (status ${res.status})`);
      }
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
      const res = await fetch(`${API_BASE_URL}/api/admin/approve-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
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
      const res = await fetch(`${API_BASE_URL}/api/admin/update-credits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
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
      const res = await fetch(`${API_BASE_URL}/api/admin/toggle-block-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
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
      const res = await fetch(`${API_BASE_URL}/api/admin/approve-credit-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
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
      const res = await fetch(`${API_BASE_URL}/api/admin/reject-credit-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
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

  const handleViewUserDetails = async (identifier, requestContext = null) => {
    const lookupId = identifier || requestContext?.userId || requestContext?.userPhone || requestContext?.userEmail;
    if (!lookupId) return;
    setActiveRequestDetail(requestContext);
    setSelectedUserDetail(lookupId);
    setUserDetailsLoading(true);
    setDetailsTab('spending');
    setDetailsSearchQuery('');

    try {
      const token = getAdminToken() || '';
      const res = await fetch(`${API_BASE_URL}/api/admin/user-details/${encodeURIComponent(lookupId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetailsData(data);
      } else {
        throw new Error('API returned ' + res.status);
      }
    } catch (e) {
      console.warn('Compiling fallback user details:', e);
      const matchedUser = users.find(u => 
        u.id === lookupId || 
        (u.phone && u.phone === lookupId) || 
        (u.email && u.email === lookupId) ||
        (requestContext && ((u.phone && u.phone === requestContext.userPhone) || (u.email && u.email === requestContext.userEmail)))
      );
      const userReqs = creditRequests.filter(r => 
        (matchedUser && (r.userId === matchedUser.id || r.userPhone === matchedUser.phone || r.userEmail === matchedUser.email)) ||
        r.userId === lookupId || r.userPhone === lookupId || r.userEmail === lookupId ||
        (requestContext && r.id === requestContext.id)
      );
      setUserDetailsData({
        user: matchedUser || {
          id: lookupId,
          name: requestContext?.userName || 'User',
          phone: requestContext?.userPhone || lookupId,
          email: requestContext?.userEmail || lookupId,
          status: 'active',
          credits: requestContext?.currentUserCredits || 0,
          creditHistory: []
        },
        creditRequests: userReqs,
        prints: [],
        fetches: [],
        summary: {
          currentCredits: matchedUser ? (Number(matchedUser.credits) || 0) : (Number(requestContext?.currentUserCredits) || 0),
          totalApprovedCredits: userReqs.filter(r => r.status === 'approved').reduce((s, r) => s + (Number(r.approvedAmount || r.amount) || 0), 0),
          totalSpent: 0,
          totalPrintsCount: 0,
          totalPages: 0,
          totalSlips: 0,
          totalFetchesCount: 0
        }
      });
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handlePrintStatement = () => {
    window.print();
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
                          <div className="text-xs text-slate-600 font-mono font-medium">{r.userPhone || r.userEmail || '—'}</div>
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
                            onClick={() => handleViewUserDetails(r.userId || r.userPhone || r.userEmail, r)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                            title="View user details & past credit usage"
                          >
                            Details
                          </button>
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
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedCreditRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {r.userName} <span className="text-slate-500 font-mono font-normal">({r.userPhone || r.userEmail || '—'})</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200/80 rounded px-1.5 py-0.5 inline-block text-slate-700">
                            {r.utr}
                          </span>
                        </td>
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
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleViewUserDetails(r.userId || r.userPhone || r.userEmail, r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm shadow-blue-600/20"
                            title="View user details, past records, fetch, print and credit spending"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
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
                      <th className="p-3.5">Phone Number</th>
                      <th className="p-3.5">Payment UTR</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{u.name}</td>
                        <td className="p-3.5 text-sm font-mono font-semibold text-slate-800">
                          {u.phone || u.email || '—'}
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
                      <th className="p-3.5">Phone Number</th>
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
                        <td className="p-3.5 text-sm font-mono font-semibold text-slate-800">
                          {u.phone || u.email || '—'}
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
                            onClick={() => handleViewUserDetails(u.id || u.phone || u.email)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                            title="View complete user details, print and fetch history"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            History & Details
                          </button>
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
                <span className="text-slate-500 font-medium">Phone Number:</span>
                <span className="font-mono font-bold text-slate-800">{approvingRequest.userPhone || approvingRequest.userEmail}</span>
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
                <span className="text-slate-500 font-medium">Phone Number:</span>
                <span className="font-mono font-bold text-slate-800">{approvingUser.phone || approvingUser.email}</span>
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

      {/* Modal 4: Comprehensive User Details, Credit Spending & History */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:hidden overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 my-6 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md shadow-blue-500/20">
                  {userDetailsData?.user?.name ? userDetailsData.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-800">
                      {userDetailsData?.user?.name || activeRequestDetail?.userName || 'User Details'}
                    </h3>
                    {userDetailsData?.user?.status === 'blocked' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span>📞 {userDetailsData?.user?.phone || activeRequestDetail?.userPhone || '—'}</span>
                    {userDetailsData?.user?.email && userDetailsData.user.email !== userDetailsData.user.phone && (
                      <span>✉️ {userDetailsData.user.email}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handlePrintStatement}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-slate-900/10"
                  title="Print complete user activity and credit spending statement"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Statement
                </button>
                <button
                  onClick={() => {
                    setSelectedUserDetail(null);
                    setUserDetailsData(null);
                    setActiveRequestDetail(null);
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Context Banner if opened from a specific credit request */}
            {activeRequestDetail && (
              <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <span className="font-bold">Credit Request Context:</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700">
                    UTR: {activeRequestDetail.utr}
                  </span>
                  <span>Requested ₹{Number(activeRequestDetail.amount).toFixed(2)}</span>
                  <span>•</span>
                  <span>Date: {new Date(activeRequestDetail.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  {activeRequestDetail.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 border border-emerald-300 text-emerald-800">
                      ✓ Approved (₹{Number(activeRequestDetail.approvedAmount || activeRequestDetail.amount).toFixed(2)})
                    </span>
                  ) : activeRequestDetail.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 border border-amber-300 text-amber-800">
                      ⏳ Pending Approval
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 border border-rose-300 text-rose-800">
                      ✕ Rejected {activeRequestDetail.rejectionReason ? `(${activeRequestDetail.rejectionReason})` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Loading Indicator or Modal Body */}
            {userDetailsLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-slate-500">Loading complete user details, past records, fetch & print activity...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Available Wallet Balance</span>
                    <div className="text-2xl font-black text-emerald-700 mt-2">
                      ₹{(Number(userDetailsData?.summary?.currentCredits ?? userDetailsData?.user?.credits) || 0).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-emerald-600/80 font-medium mt-1">Ready to use</span>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Total Recharged / Added</span>
                    <div className="text-2xl font-black text-blue-700 mt-2">
                      ₹{(Number(userDetailsData?.summary?.totalApprovedCredits) || 0).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-blue-600/80 font-medium mt-1">
                      {userDetailsData?.creditRequests?.filter(r => r.status === 'approved').length || 0} approved recharges
                    </span>
                  </div>

                  <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Total Credit Spent</span>
                    <div className="text-2xl font-black text-purple-700 mt-2">
                      ₹{(Number(userDetailsData?.summary?.totalSpent) || 0).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-purple-600/80 font-medium mt-1">
                      {userDetailsData?.summary?.totalPrintsCount || 0} print jobs ({userDetailsData?.summary?.totalSlips || 0} slips)
                    </span>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Voter Searches & Fetches</span>
                    <div className="text-2xl font-black text-amber-700 mt-2">
                      {userDetailsData?.summary?.totalFetchesCount || 0}
                    </div>
                    <span className="text-[11px] text-amber-600/80 font-medium mt-1">Total fetch requests</span>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setDetailsTab('spending')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        detailsTab === 'spending'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>🖨️</span>
                      <span>Credit Spent (Print Logs)</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${detailsTab === 'spending' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {userDetailsData?.prints?.length || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => setDetailsTab('fetches')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        detailsTab === 'fetches'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>🔍</span>
                      <span>Fetch History</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${detailsTab === 'fetches' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {userDetailsData?.fetches?.length || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => setDetailsTab('ledger')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        detailsTab === 'ledger'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>💳</span>
                      <span>Recharge & Wallet Ledger</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${detailsTab === 'ledger' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {userDetailsData?.creditRequests?.length || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => setDetailsTab('profile')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        detailsTab === 'profile'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>👤</span>
                      <span>User Profile</span>
                    </button>
                  </div>

                  {/* Search input for filtering tables */}
                  {(detailsTab === 'spending' || detailsTab === 'fetches') && (
                    <div className="relative min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={detailsSearchQuery}
                        onChange={(e) => setDetailsSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* TAB 1: Credit Spent (Print Records) */}
                {detailsTab === 'spending' && (
                  <div>
                    {(() => {
                      const prints = (userDetailsData?.prints || []).filter(p => {
                        if (!detailsSearchQuery) return true;
                        const q = detailsSearchQuery.toLowerCase();
                        return (
                          (p.voter_name && p.voter_name.toLowerCase().includes(q)) ||
                          (p.option_type && p.option_type.toLowerCase().includes(q)) ||
                          (p.panchayat && p.panchayat.toLowerCase().includes(q)) ||
                          (p.assembly && p.assembly.toLowerCase().includes(q)) ||
                          (p.district && p.district.toLowerCase().includes(q)) ||
                          (p.part_no && String(p.part_no).toLowerCase().includes(q))
                        );
                      });

                      if (prints.length === 0) {
                        return (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                            <span className="text-3xl block mb-2">🖨️</span>
                            <p className="text-slate-600 font-bold text-sm">No credit spending / print records found.</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {detailsSearchQuery ? 'Try clearing your search query.' : 'This user has not yet spent credit on printing slips or directories.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Option / Service</th>
                                <th className="p-3">Voter / Part Details</th>
                                <th className="p-3">Location</th>
                                <th className="p-3 text-center">Pages / Slips</th>
                                <th className="p-3 text-center">Photo Mode</th>
                                <th className="p-3 text-right">Cost Deducted</th>
                                <th className="p-3 text-right">Balance After</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {prints.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="p-3 text-slate-500 whitespace-nowrap font-mono">
                                    <div>{new Date(p.timestamp).toLocaleDateString()}</div>
                                    <div className="text-[10px] text-slate-400">{new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                  </td>
                                  <td className="p-3 font-bold text-slate-800">
                                    <span className="inline-block px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-[11px]">
                                      {p.option_type || 'Slip Generation'}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-bold text-slate-800">{p.voter_name || 'Voter Slips'}</div>
                                    <div className="text-[11px] text-slate-500 font-mono">
                                      Part: {p.part_no || '—'} | Sr: {p.serial_no || '—'} | Ward: {p.ward_no || '—'}
                                    </div>
                                  </td>
                                  <td className="p-3 text-slate-600">
                                    <div className="font-medium text-slate-800">{p.panchayat || p.assembly || p.district || '—'}</div>
                                    <div className="text-[10px] text-slate-400">
                                      {[p.district, p.state].filter(Boolean).join(', ') || '—'}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="font-bold text-slate-800">{p.pages_count || 1} p</span>
                                    <span className="text-slate-400 text-[10px] block">({p.slips_count || 8} slips)</span>
                                  </td>
                                  <td className="p-3 text-center">
                                    {p.has_image ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        📷 With Photo
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        No Photo
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right font-mono font-black text-rose-600 text-sm whitespace-nowrap">
                                    -₹{Number(p.cost || 0).toFixed(2)}
                                  </td>
                                  <td className="p-3 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                                    {p.balance_after !== null && p.balance_after !== undefined ? `₹${Number(p.balance_after).toFixed(2)}` : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB 2: Voter Search & Fetch History */}
                {detailsTab === 'fetches' && (
                  <div>
                    {(() => {
                      const fetches = (userDetailsData?.fetches || []).filter(f => {
                        if (!detailsSearchQuery) return true;
                        const q = detailsSearchQuery.toLowerCase();
                        return (
                          (f.category && f.category.toLowerCase().includes(q)) ||
                          (f.panchayat && f.panchayat.toLowerCase().includes(q)) ||
                          (f.assembly && f.assembly.toLowerCase().includes(q)) ||
                          (f.district && f.district.toLowerCase().includes(q)) ||
                          (f.village && f.village.toLowerCase().includes(q))
                        );
                      });

                      if (fetches.length === 0) {
                        return (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                            <span className="text-3xl block mb-2">🔍</span>
                            <p className="text-slate-600 font-bold text-sm">No voter search or fetch records found.</p>
                            <p className="text-slate-400 text-xs mt-1">This user has not searched or fetched voter lists yet.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">State & District</th>
                                <th className="p-3">Assembly / Samiti</th>
                                <th className="p-3">Panchayat / Local Body</th>
                                <th className="p-3">Village / Ward / Booth</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {fetches.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="p-3 text-slate-500 whitespace-nowrap font-mono">
                                    <div>{new Date(f.timestamp).toLocaleDateString()}</div>
                                    <div className="text-[10px] text-slate-400">{new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                  </td>
                                  <td className="p-3 font-bold text-slate-800">
                                    <span className="capitalize px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                                      {f.category}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-700">
                                    <div className="font-semibold">{f.district || '—'}</div>
                                    <div className="text-[10px] text-slate-400">{f.state || '—'}</div>
                                  </td>
                                  <td className="p-3 font-semibold text-slate-800">{f.assembly || '—'}</td>
                                  <td className="p-3 font-bold text-slate-800">{f.panchayat || '—'}</td>
                                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                                    {[f.village !== '-' ? f.village : null, f.ward !== '-' ? `Ward ${f.ward}` : null, f.booth !== '-' ? `Booth ${f.booth}` : null].filter(Boolean).join(' • ') || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB 3: Recharge Requests & Wallet Ledger */}
                {detailsTab === 'ledger' && (
                  <div className="space-y-6">
                    {/* All Credit Recharge Requests */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <span>💳</span> All UPI Recharge Requests ({userDetailsData?.creditRequests?.length || 0})
                      </h4>
                      {(!userDetailsData?.creditRequests || userDetailsData.creditRequests.length === 0) ? (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs">
                          No credit requests recorded.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                                <th className="p-3">Request Date</th>
                                <th className="p-3">Payment UTR</th>
                                <th className="p-3">Requested</th>
                                <th className="p-3">Approved</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Admin Note / Processed At</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {userDetailsData.creditRequests.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 text-slate-500 whitespace-nowrap">
                                    {new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="p-3 font-mono font-bold text-blue-700 select-all">{r.utr}</td>
                                  <td className="p-3 font-mono font-bold text-slate-800">₹{Number(r.amount).toFixed(2)}</td>
                                  <td className="p-3 font-mono font-bold text-emerald-700">
                                    {r.approvedAmount ? `₹${Number(r.approvedAmount).toFixed(2)}` : '—'}
                                  </td>
                                  <td className="p-3">
                                    {r.status === 'approved' ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        ✓ Approved
                                      </span>
                                    ) : r.status === 'pending' ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        ⏳ Pending
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        ✕ Rejected
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-slate-500">
                                    {r.rejectionReason || r.notes || (r.approvedAt ? `Approved on ${new Date(r.approvedAt).toLocaleDateString()}` : '—')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Credit Ledger History */}
                    {userDetailsData?.user?.creditHistory && userDetailsData.user.creditHistory.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <span>📋</span> Internal Balance Ledger ({userDetailsData.user.creditHistory.length})
                        </h4>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                                <th className="p-3">Timestamp</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-right">Balance After</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {userDetailsData.user.creditHistory.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 text-slate-500 whitespace-nowrap font-mono">
                                    {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                      entry.amount >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                      {entry.type}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-700 font-medium">{entry.description}</td>
                                  <td className={`p-3 text-right font-mono font-bold ${entry.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {entry.amount >= 0 ? `+₹${Number(entry.amount).toFixed(2)}` : `-₹${Math.abs(Number(entry.amount)).toFixed(2)}`}
                                  </td>
                                  <td className="p-3 text-right font-mono font-bold text-slate-800">
                                    ₹{Number(entry.balanceAfter).toFixed(2)}
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

                {/* TAB 4: User Profile & Security Details */}
                {detailsTab === 'profile' && (
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 border-b pb-2">User Registration & Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Full Name:</span>
                        <span className="font-bold text-slate-800">{userDetailsData?.user?.name || '—'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Registered Phone:</span>
                        <span className="font-mono font-bold text-slate-800">{userDetailsData?.user?.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Email / Username:</span>
                        <span className="font-mono font-bold text-slate-800">{userDetailsData?.user?.email || '—'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Registration Payment UTR:</span>
                        <span className="font-mono font-bold text-blue-700">{userDetailsData?.user?.utr || '—'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Account Status:</span>
                        <span className="font-bold uppercase text-slate-800">{userDetailsData?.user?.status || 'active'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">System Role:</span>
                        <span className="font-bold uppercase text-slate-800">{userDetailsData?.user?.role || 'user'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Current Balance:</span>
                        <span className="font-bold text-emerald-700 text-sm">₹{(Number(userDetailsData?.user?.credits) || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Photo ID Voter Management System • Complete User Activity & Spending Record
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintStatement}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>🖨️</span>
                  <span>Print Activity Statement</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserDetail(null);
                    setUserDetailsData(null);
                    setActiveRequestDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STANDALONE PRINTABLE STATEMENT FOR BROWSER PRINT --- */}
      {userDetailsData && (
        <div id="printable-user-statement" className="hidden print:block font-sans text-black">
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>PHOTO ID VOTER SLIP SERVICE</h1>
            <h2 style={{ fontSize: '14px', margin: 0, color: '#333' }}>CUSTOMER CREDIT USAGE & ACTIVITY STATEMENT</h2>
            <div style={{ fontSize: '11px', marginTop: '6px', color: '#666' }}>
              Generated On: {new Date().toLocaleString()}
            </div>
          </div>

          {/* User Profile Box */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{userDetailsData?.user?.name || 'User'}</div>
              <div style={{ fontSize: '12px' }}>Phone: {userDetailsData?.user?.phone || '—'}</div>
              <div style={{ fontSize: '12px' }}>Email: {userDetailsData?.user?.email || '—'}</div>
              <div style={{ fontSize: '12px' }}>Status: {userDetailsData?.user?.status || 'Active'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#666' }}>Current Wallet Balance:</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#047857' }}>
                ₹{(Number(userDetailsData?.summary?.currentCredits ?? userDetailsData?.user?.credits) || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                Total Recharged: ₹{(Number(userDetailsData?.summary?.totalApprovedCredits) || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '11px' }}>
                Total Spent: ₹{(Number(userDetailsData?.summary?.totalSpent) || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Credit Spending Breakdown (Print Records) */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
              CREDIT SPENDING BREAKDOWN (PRINT & SLIP GENERATION) ({userDetailsData?.prints?.length || 0})
            </h3>
            {(!userDetailsData?.prints || userDetailsData.prints.length === 0) ? (
              <div style={{ fontSize: '11px', fontStyle: 'italic', padding: '8px 0' }}>No print or credit deduction records.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #000', textAlign: 'left' }}>
                    <th style={{ padding: '6px 4px' }}>Date & Time</th>
                    <th style={{ padding: '6px 4px' }}>Option / Job</th>
                    <th style={{ padding: '6px 4px' }}>Voter / Part Info</th>
                    <th style={{ padding: '6px 4px' }}>Location</th>
                    <th style={{ padding: '6px 4px', textAlign: 'center' }}>Pages / Slips</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right' }}>Amount Deducted</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetailsData.prints.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '6px 4px', whiteSpace: 'nowrap' }}>{new Date(p.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>{p.option_type || 'Slip'}</td>
                      <td style={{ padding: '6px 4px' }}>{p.voter_name || '—'} {p.part_no ? `(Part ${p.part_no})` : ''}</td>
                      <td style={{ padding: '6px 4px' }}>{[p.panchayat || p.assembly, p.district].filter(Boolean).join(', ') || '—'}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'center' }}>{p.pages_count || 1}p / {p.slips_count || 8}s {p.has_image ? '(Photo)' : ''}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>-₹{Number(p.cost || 0).toFixed(2)}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{p.balance_after !== null && p.balance_after !== undefined ? `₹${Number(p.balance_after).toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Location Fetches Table */}
          {userDetailsData?.fetches && userDetailsData.fetches.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                VOTER LOCATION SEARCHES & FETCH RECORDS ({userDetailsData.fetches.length})
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #000', textAlign: 'left' }}>
                    <th style={{ padding: '6px 4px' }}>Date & Time</th>
                    <th style={{ padding: '6px 4px' }}>Category</th>
                    <th style={{ padding: '6px 4px' }}>District</th>
                    <th style={{ padding: '6px 4px' }}>Assembly / Samiti</th>
                    <th style={{ padding: '6px 4px' }}>Panchayat</th>
                    <th style={{ padding: '6px 4px' }}>Village / Ward / Booth</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetailsData.fetches.slice(0, 50).map((f, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '6px 4px' }}>{new Date(f.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '6px 4px', textTransform: 'capitalize' }}>{f.category}</td>
                      <td style={{ padding: '6px 4px' }}>{f.district || '—'}</td>
                      <td style={{ padding: '6px 4px' }}>{f.assembly || '—'}</td>
                      <td style={{ padding: '6px 4px' }}>{f.panchayat || '—'}</td>
                      <td style={{ padding: '6px 4px' }}>{[f.village !== '-' ? f.village : null, f.ward !== '-' ? `Ward ${f.ward}` : null, f.booth !== '-' ? `Booth ${f.booth}` : null].filter(Boolean).join(' • ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recharge History Table */}
          {userDetailsData?.creditRequests && userDetailsData.creditRequests.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                UPI RECHARGE & WALLET TOP-UP HISTORY ({userDetailsData.creditRequests.length})
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #000', textAlign: 'left' }}>
                    <th style={{ padding: '6px 4px' }}>Date</th>
                    <th style={{ padding: '6px 4px' }}>UTR Number</th>
                    <th style={{ padding: '6px 4px' }}>Requested Amount</th>
                    <th style={{ padding: '6px 4px' }}>Approved Amount</th>
                    <th style={{ padding: '6px 4px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetailsData.creditRequests.map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '6px 4px' }}>{new Date(r.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '6px 4px', fontFamily: 'monospace' }}>{r.utr}</td>
                      <td style={{ padding: '6px 4px' }}>₹{Number(r.amount).toFixed(2)}</td>
                      <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>{r.approvedAmount ? `₹${Number(r.approvedAmount).toFixed(2)}` : '—'}</td>
                      <td style={{ padding: '6px 4px', textTransform: 'uppercase' }}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ borderTop: '1px solid #000', paddingTop: '8px', fontSize: '10px', textAlign: 'center', color: '#666', marginTop: '20px' }}>
            This is an official computer-generated activity statement for user {userDetailsData?.user?.name} ({userDetailsData?.user?.phone || '—'}).
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

