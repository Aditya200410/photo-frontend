import React, { useState, useEffect } from 'react';

function PrintModal({ isOpen, onClose, onGenerate, isGenerating, progress, pagesCount, setPagesCount, optionNumber, voterData, setVoterData, cardsPerPage, setCardsPerPage }) {
  const [userBalance, setUserBalance] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBalance = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserBalance(Number(data.credits) || 0);
          setIsAdminUser(data.role === 'admin');
        }
      } catch (e) {
        console.error('Error fetching balance:', e);
      }
    };

    fetchBalance();
  }, [isOpen]);

  if (!isOpen) return null;

  const hasImage = Boolean((optionNumber === 1 && voterData?.topImage) || (optionNumber === 3 && voterData?.symbolImage));
  const ratePerPage = hasImage ? 0.12 : 0.10;
  const numCards = Number(cardsPerPage) || 8;
  const numPages = Number(pagesCount) || 0;
  const totalSlips = numPages * numCards;
  const totalCost = Math.round(numPages * ratePerPage * 100) / 100;
  const isBalanceSufficient = isAdminUser || userBalance === null || userBalance >= totalCost;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Print Voter Slips</h2>
          {userBalance !== null && !isAdminUser && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-700">
              <span>Wallet:</span>
              <span className="font-extrabold">₹{userBalance.toFixed(2)}</span>
            </div>
          )}
        </div>

        {isGenerating ? (
          <div className="space-y-6 py-4">
            <p className="text-slate-600 font-medium text-center">Generating PDF... Please wait.</p>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-slate-500">{Math.round(progress)}% Complete</p>
          </div>
        ) : (
          <div className="space-y-5">
            {optionNumber === 1 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Poster / Banner Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setVoterData({ ...voterData, topImage: event.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 mb-3"
                />
                {voterData?.topImage && (
                  <div className="relative">
                    <img src={voterData.topImage} alt="Preview" className="w-full h-28 object-contain border border-slate-200 rounded-xl mb-2 bg-slate-50" />
                    <button 
                      type="button" 
                      onClick={() => setVoterData({ ...voterData, topImage: null })}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                    >
                      ✕ Remove Image
                    </button>
                  </div>
                )}
              </div>
            )}

            {optionNumber === 3 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Symbol Image (Right Side - Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setVoterData({ ...voterData, symbolImage: event.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 mb-3"
                />
                {voterData?.symbolImage && (
                  <div className="relative">
                    <img src={voterData.symbolImage} alt="Preview" className="w-full h-28 object-contain border border-slate-200 rounded-xl mb-2 bg-slate-50" />
                    <button 
                      type="button" 
                      onClick={() => setVoterData({ ...voterData, symbolImage: null })}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                    >
                      ✕ Remove Image
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cards per Page</label>
              <select
                value={cardsPerPage}
                onChange={(e) => setCardsPerPage(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium bg-white"
              >
                <option value={4}>4 Cards</option>
                <option value={8}>8 Cards</option>
                <option value={12}>12 Cards</option>
              </select>

              <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Pages ({cardsPerPage} slips per page)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={pagesCount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setPagesCount('');
                  } else {
                    setPagesCount(parseInt(val, 10));
                  }
                }}
                className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium"
              />
              <p className="text-xs text-slate-500 mt-1.5">Generating {totalSlips} total slips.</p>
              
              {/* Error Message */}
              {pagesCount === 0 || pagesCount === '' || pagesCount < 1 ? (
                 <p className="text-xs text-red-500 mt-1 font-medium">Please enter a valid number of pages (minimum 1).</p>
              ) : null}
            </div>

            {/* Credit Cost Estimate Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Print Type:</span>
                <span className="font-bold text-slate-800">
                  {hasImage ? '🖼️ With Image (12 Paisa / Page)' : '📄 Without Image (10 Paisa / Page)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Rate per Page:</span>
                <span className="font-mono font-semibold text-slate-800">₹{ratePerPage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Pages:</span>
                <span className="font-bold text-slate-800">{numPages} <span className="text-[11px] font-normal text-slate-500">({totalSlips} slips)</span></span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-extrabold text-sm">
                <span className="text-slate-800">Total Deduction:</span>
                <span className="text-indigo-600 font-mono text-base">₹{totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Insufficient balance warning */}
            {!isBalanceSufficient && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div className="font-bold">Insufficient Credit Balance!</div>
                  <div className="text-rose-600/90 mt-0.5">
                    You need ₹{totalCost.toFixed(2)}, but have only ₹{userBalance.toFixed(2)}. Please contact Admin to recharge your wallet.
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 sm:bg-transparent hover:bg-slate-200 sm:hover:bg-slate-100 transition-colors text-center text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pagesCount && pagesCount >= 1) {
                    onGenerate();
                  } else {
                    alert('Please enter a valid number of pages (minimum 1).');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-center text-sm"
                disabled={!pagesCount || pagesCount < 1 || !isBalanceSufficient}
              >
                Start Print (₹{totalCost.toFixed(2)})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrintModal;
