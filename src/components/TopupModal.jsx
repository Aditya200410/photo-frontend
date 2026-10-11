import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';

function TopupModal({ isOpen, onClose, requiredAmount = 0, currentBalance = 0, onRechargeSuccess }) {
  const [settings, setSettings] = useState({});
  const [rechargeAmount, setRechargeAmount] = useState('100');
  const [utr, setUtr] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStatus(null);
    setStatusMessage('');
    setUtr('');
    setNotes('');

    // Suggest recommended topup amount if requiredAmount is given
    if (requiredAmount > 0) {
      const needed = Math.max(0, requiredAmount - currentBalance);
      if (needed > 0) {
        // Round up to nearest friendly amount: 50, 100, 200, 500
        const friendly = needed <= 50 ? 50 : needed <= 100 ? 100 : needed <= 250 ? 250 : Math.ceil(needed / 100) * 100;
        setRechargeAmount(String(friendly));
      }
    }

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data || {}))
      .catch(err => console.error('Failed to load settings:', err));
  }, [isOpen, requiredAmount, currentBalance]);

  if (!isOpen) return null;

  const currentUpiId = settings.upiId || 'elections@upi';
  const qrAmount = parseFloat(rechargeAmount) > 0 ? parseFloat(rechargeAmount) : '100';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(currentUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setStatusMessage('');

    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      setStatus('error');
      setStatusMessage('Please enter a valid top-up amount greater than 0.');
      return;
    }

    if (!utr.trim()) {
      setStatus('error');
      setStatusMessage('Please enter your 12-digit UPI Transaction Reference (UTR) number.');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('userToken');

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/credit-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amt,
          utr: utr.trim(),
          notes: notes.trim()
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setStatus('success');
        setStatusMessage('Top-up request submitted successfully! Admin will verify your UTR and credit your balance shortly.');
        setUtr('');
        setNotes('');
        if (onRechargeSuccess) {
          onRechargeSuccess();
        }
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to submit top-up request.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setStatus('error');
      setStatusMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-lg shadow-inner">
              ₹
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Recharge Printing Credits
              </h3>
              <p className="text-xs text-slate-400">
                Top up your wallet via UPI QR code to print voter slips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Balance Status Banner (if requiredAmount is set) */}
        {requiredAmount > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 sm:px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Required for this print: <strong>₹{requiredAmount.toFixed(2)}</strong></span>
            </div>
            <div className="text-slate-300 font-mono font-medium">
              Available: <span className="text-emerald-400 font-bold">₹{currentBalance.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 sm:p-6 sm:pb-8 max-h-[75vh] overflow-y-auto space-y-6">
          {status === 'success' ? (
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-lg shadow-emerald-500/20">
                ✓
              </div>
              <h4 className="text-xl font-extrabold text-white">Top-Up Request Submitted!</h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {statusMessage}
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
                >
                  Close & Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: QR Code & UPI Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center">
                <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-300 font-bold">
                  <span>Official UPI Payment QR</span>
                  <span className="text-emerald-400 font-mono">₹{rechargeAmount || 0}</span>
                </div>

                <div className="p-3 bg-white rounded-2xl shadow-lg border border-white/20 flex items-center justify-center mb-3">
                  <img
                    src={settings.qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(currentUpiId)}%26pn=VoterSlipRecharge%26am=${qrAmount}%26cu=INR`}
                    alt="Scan Payment QR"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>

                <div className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2 mt-1">
                  <div className="text-left overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">UPI ID</span>
                    <span className="text-xs font-mono font-bold text-white truncate block">{currentUpiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow shrink-0"
                  >
                    {copiedUpi ? 'Copied!' : 'Copy UPI'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  Scan using GPay, PhonePe, Paytm, or BHIM. Enter your payment amount, complete the transfer, and paste the 12-digit UTR on the right.
                </p>
              </div>

              {/* Right Column: Topup Amount & UTR Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                    {statusMessage}
                  </div>
                )}

                {/* Amount Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Top-Up Amount (₹) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {['50', '100', '250', '500'].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          rechargeAmount === amt
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UTR Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    UPI Transaction UTR / Ref No. <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="Enter 12-digit UTR from your receipt"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Found in Google Pay, PhonePe, or Paytm payment details.
                  </span>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paid via GPay"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting Top-Up...
                      </>
                    ) : (
                      <>
                        Submit Top-Up (₹{rechargeAmount || 0})
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TopupModal;
