import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import BatchA4PrintLayout from './BatchA4PrintLayout';
import VoterSlip from './VoterSlip';
import VoterSlipOption3 from './VoterSlipOption3';

function BatchSlipPrintManager({ isOpen, onClose, voters, assemblyName, boothNumber, wardNo }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printState, setPrintState] = useState({ active: false, currentPage: 1 });
  const [batchImage, setBatchImage] = useState(null);
  const [selectedOption, setSelectedOption] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(8);
  const [userBalance, setUserBalance] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [settings, setSettings] = useState(null);

  const printLayoutRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings`);
        if (res.ok) setSettings(await res.json());
      } catch (e) {
        console.error(e);
      }
    };

    fetchBalance();
    fetchSettings();
  }, [isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBatchImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const maxPages = voters ? Math.ceil(voters.length / cardsPerPage) : 1;
  const [pagesCount, setPagesCount] = useState(maxPages);

  useEffect(() => {
    if (isOpen) {
      setPagesCount(maxPages);
    }
  }, [isOpen, maxPages]);

  const hasImage = Boolean(selectedOption !== 2 && batchImage);
  const ratePerPage = hasImage ? (settings?.rateWithImage ?? 0.12) : (settings?.rateWithoutImage ?? 0.10);
  const numPages = Number(pagesCount) || 0;
  const totalSlips = Math.min(voters ? voters.length : 0, numPages * cardsPerPage);
  const totalCost = Math.round(numPages * ratePerPage * 100) / 100;
  const isBalanceSufficient = isAdminUser || userBalance === null || userBalance >= totalCost;

  const handlePrintGenerate = async (isPreviewMode = false) => {
    if (!voters || voters.length === 0 || !pagesCount || pagesCount < 1) return;
    if (!isPreviewMode && !isBalanceSufficient) {
      alert(`Insufficient credit balance! Required: ₹${totalCost.toFixed(2)}, Available: ₹${userBalance?.toFixed(2)}`);
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const numPagesToPrint = isPreviewMode ? 1 : pagesCount;

    for (let i = 1; i <= numPagesToPrint; i++) {
      setPrintState({ active: true, currentPage: i });
      await delay(500); // Give DOM time to render the layout

      if (printLayoutRef.current) {
        const canvas = await html2canvas(printLayoutRef.current, {
          scale: 1.5,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 1240,
          windowHeight: 1754,
          width: 1240,
          height: 1754
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.75);
        if (i > 1) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        setProgress((i / numPagesToPrint) * 100);
      }
    }

    if (!isPreviewMode) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/prints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token') || 'DUMMY'}` },
          body: JSON.stringify({
            optionType: `Batch Slips Option ${selectedOption}`,
            wardNo: wardNo || '-',
            partNo: boothNumber || '-',
            serialNo: 'ALL',
            voterName: 'Batch Print',
            pagesCount: pagesCount,
            cardsPerPage: cardsPerPage,
            slipsCount: totalSlips,
            hasImage: hasImage
          })
        });
        if (res.ok) {
          window.dispatchEvent(new Event('user-credits-updated'));
        }
      } catch (err) {
        console.error('Failed to log print to backend:', err);
      }
    }

    pdf.save(`batch-slips-${isPreviewMode ? 'preview' : pagesCount + '-pages'}.pdf`);

    setIsGenerating(false);
    setPrintState({ active: false, currentPage: 1 });
    onClose();
  };

  if (!isOpen) return null;

  const getAllPagesSlipsData = () => {
    const allPages = [];
    for (let i = 0; i < pagesCount; i++) {
      const startIndex = i * cardsPerPage;
      const endIndex = startIndex + cardsPerPage;
      const pageVoters = voters.slice(startIndex, endIndex);

      const pageSlips = [];
      pageVoters.forEach(voter => {
        pageSlips.push({
          wardNo: wardNo || '-',
          partNo: boothNumber || '-',
          serialNo: voter.ID || voter.VID || '1',
          idNumber: voter.VID || '-',
          voterName: voter.EFVNAME || voter.FVNAME || '-',
          fatherHusbandName: voter.EFRNAME || voter.FRNAME || '-',
          houseNo: voter.MHOUSENO || '0',
          gender: voter.MSEX === 'M' || voter.MSEX === 'पुरुष' ? 'पुरुष' : (voter.MSEX === 'F' || voter.MSEX === 'स्त्री' ? 'स्त्री' : voter.MSEX),
          age: voter.MAGE || '18',
          pollingStation: `${assemblyName || ''} ${boothNumber ? '- ' + boothNumber : ''}`,
          topImage: selectedOption === 1 ? batchImage : null,
          symbolImage: selectedOption === 3 ? batchImage : null,
        });
      });
      allPages.push(pageSlips);
    }
    return allPages;
  };

  const allPagesSlipsData = getAllPagesSlipsData();

  return (
    <>
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -10, width: '1240px', pointerEvents: 'none', opacity: 0, overflow: 'hidden' }}>
        {printState.active && allPagesSlipsData[printState.currentPage - 1] && (
          <BatchA4PrintLayout
            ref={printLayoutRef}
            slipsData={allPagesSlipsData[printState.currentPage - 1]}
            pageNumber={printState.currentPage}
            totalPages={pagesCount}
            SlipComponent={selectedOption === 3 ? VoterSlipOption3 : VoterSlip}
            headerData={{
              title: assemblyName || 'Voters Directory',
              wardNo: wardNo || '-',
              partNo: boothNumber || '-'
            }}
            cardsPerPage={cardsPerPage}
          />
        )}
      </div>

      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
        <div className="bg-white rounded-3xl p-5 sm:p-8 w-full shadow-2xl max-h-[90vh] overflow-y-auto max-w-5xl flex flex-col lg:flex-row gap-8">

          <div className="flex-1 min-w-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Batch Generating PDF</h2>
              {userBalance !== null && !isAdminUser && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-700">
                  <span>Wallet:</span>
                  <span className="font-extrabold">₹{userBalance.toFixed(2)}</span>
                </div>
              )}
            </div>

            {isGenerating ? (
              <div className="space-y-6 py-4">
                <p className="text-slate-600 font-medium text-center">Generating {pagesCount} pages... Please wait.</p>
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cards per Page</label>
                <select
                  value={cardsPerPage}
                  onChange={(e) => setCardsPerPage(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium bg-white"
                >
                  <option value={8}>8 Cards</option>
                  <option value={10}>10 Cards</option>
                  <option value={12}>12 Cards</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Pages ({cardsPerPage} entries per page)</label>
                <input
                  type="number"
                  min="1"
                  max={maxPages}
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
                <p className="text-xs text-slate-500 mt-1.5">Maximum available pages: {maxPages} ({voters.length} total entries)</p>
                
                {pagesCount === 0 || pagesCount === '' || pagesCount < 1 ? (
                   <p className="text-xs text-red-500 mt-1 font-medium">Please enter a valid number of pages (minimum 1).</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Template</label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium mb-3 bg-white"
                >
                  <option value={1}>Option 1 (Top Banner Image)</option>
                  <option value={2}>Option 2 (Standard Template - Text Only)</option>
                  <option value={3}>Option 3 (Right Symbol Image)</option>
                </select>
              </div>

              {selectedOption !== 2 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {selectedOption === 1 ? 'Top Banner Image (Optional)' : 'Symbol Image (Optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-2"
                />
                {batchImage && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <span>✓ Image attached (+2 paisa rate applies)</span>
                    <button type="button" onClick={() => setBatchImage(null)} className="text-rose-500 hover:text-rose-700">Remove</button>
                  </div>
                )}
              </div>
            )}

            {/* Credit Cost Estimate Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Batch Print Type:</span>
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
                onClick={() => handlePrintGenerate(true)}
                className="w-full lg:hidden px-6 py-3 sm:py-2.5 rounded-xl font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all text-center text-sm"
              >
                Download Free Preview (1 Page)
              </button>
              <button
                onClick={() => handlePrintGenerate(false)}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-center text-sm"
                disabled={!pagesCount || pagesCount < 1 || !isBalanceSufficient}
              >
                Start Print (₹{totalCost.toFixed(2)})
              </button>
            </div>
          </div>
          )}
        </div>

        <div className="hidden lg:flex flex-[1.2] flex-col items-center justify-start bg-slate-100 border border-slate-200 rounded-2xl p-4 overflow-hidden relative">
          <h3 className="text-sm font-bold text-slate-500 mb-4 w-full text-center uppercase tracking-wider">Page 1 Live Preview</h3>
          <div className="w-full flex-1 flex justify-center items-start custom-scrollbar overflow-hidden">
            <div className="origin-top flex justify-center shadow-md bg-white" style={{ transform: 'scale(0.4)', width: '1240px', height: '1754px' }}>
              <div className="w-full h-full pointer-events-none">
                {allPagesSlipsData[0] && (
                  <BatchA4PrintLayout
                    slipsData={allPagesSlipsData[0]}
                    pageNumber={1}
                    totalPages={pagesCount}
                    SlipComponent={selectedOption === 3 ? VoterSlipOption3 : VoterSlip}
                    headerData={{
                      title: assemblyName || 'Voters Directory',
                      wardNo: wardNo || '-',
                      partNo: boothNumber || '-'
                    }}
                    cardsPerPage={cardsPerPage}
                  />
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => handlePrintGenerate(true)}
            className="mt-4 px-6 py-2.5 rounded-xl font-bold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all text-center text-sm"
          >
            Download Free Preview PDF (1 Page)
          </button>
        </div>

      </div>
    </div >
    </>
  );
}

export default BatchSlipPrintManager;
