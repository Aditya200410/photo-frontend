import API_BASE_URL from '../config';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import BatchA4PrintLayout from './BatchA4PrintLayout';
import VoterSlip from './VoterSlip';
import VoterSlipOption3 from './VoterSlipOption3';
import TopupModal from './TopupModal';
import { printViaWindowPrint, generatePdfFromHtml, logPrintTransaction } from '../utils/printService';

function BatchSlipPrintManager({ isOpen, onClose, voters, assemblyName, boothNumber, wardNo }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [batchImage, setBatchImage] = useState(null);
  const [selectedOption, setSelectedOption] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(8);
  const [userBalance, setUserBalance] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBalance = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
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
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) setSettings(await res.json());
      } catch (e) {
        console.error('Error fetching settings:', e);
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

  const totalVotersCount = voters && Array.isArray(voters) ? voters.length : 0;
  const maxPages = totalVotersCount > 0 ? Math.ceil(totalVotersCount / cardsPerPage) : 1;

  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setStartPage(1);
      setEndPage(Math.min(maxPages, 10));
      setIsGenerating(false);
      setProgress(0);
      setStatusText('');
    }
  }, [isOpen, maxPages]);

  const hasImage = Boolean(selectedOption !== 2 && batchImage);
  const ratePerPage = hasImage ? (settings?.rateWithImage ?? 0.12) : (settings?.rateWithoutImage ?? 0.10);

  // Safe numerical calculations: From Page to To Page
  const currentStartPage = Math.max(1, Math.min(maxPages, Number(startPage) || 1));
  const currentEndPage = Math.max(currentStartPage, Math.min(maxPages, Number(endPage) || currentStartPage));
  const actualPagesToPrint = Math.max(1, currentEndPage - currentStartPage + 1);

  const totalSlips = Math.min(totalVotersCount, actualPagesToPrint * cardsPerPage);
  const totalCost = Math.round(actualPagesToPrint * ratePerPage * 100) / 100;
  const isBalanceSufficient = isAdminUser || userBalance === null || userBalance >= totalCost;

  // On-demand slip mapping for requested pages (avoids mapping 24,000 voters in memory)
  const mapVoterToSlip = (voter) => {
    if (!voter) return null;
    const rawGender = voter.FGENDER || voter.MSEX || voter.GENDER || voter.SEX || '';
    const mappedGender = rawGender === 'M' || rawGender === 'पुरुष' ? 'पुरुष' : (rawGender === 'F' || rawGender === 'स्त्री' ? 'स्त्री' : rawGender);

    const vFName = voter.V_FNAME_EN ? `${voter.V_FNAME_EN} ${voter.V_LNAME_EN || ''}`.trim() : (voter.V_FNAME_HI || '');
    const fFName = voter.VR_FNAME_EN ? `${voter.VR_FNAME_EN} ${voter.VR_LNAME_EN || ''}`.trim() : (voter.VR_FNAME_HI || '');

    const rawWard = voter.WARDNO !== undefined && voter.WARDNO !== null && String(voter.WARDNO).trim() !== '' ? voter.WARDNO : (
      voter['PANCHAYAT WARD NO'] || voter.WARD_NO || voter['WARD NO'] || voter.WARD || voter.NWARDNO || voter._meta_ward || voter.ward
    );
    const wardStr = rawWard !== undefined && rawWard !== null ? String(rawWard).trim() : '';
    const resolvedWard = (wardStr && wardStr.toLowerCase() !== 'all' && wardStr.toLowerCase() !== 'null' && wardStr.toLowerCase() !== 'undefined') 
      ? wardStr 
      : (wardNo && String(wardNo).trim().toLowerCase() !== 'all' ? String(wardNo).trim() : '-');

    const rawPart = voter.BOOTH_NO !== undefined && voter.BOOTH_NO !== null && String(voter.BOOTH_NO).trim() !== '' ? voter.BOOTH_NO : (
      voter.PARTNO || voter.PART_NO || voter['PART NO'] || voter.BOOTH || voter._meta_booth || voter.booth
    );
    const partStr = rawPart !== undefined && rawPart !== null ? String(rawPart).trim() : '';
    const resolvedPart = (partStr && partStr.toLowerCase() !== 'all' && partStr.toLowerCase() !== 'null' && partStr.toLowerCase() !== 'undefined')
      ? partStr
      : (boothNumber && String(boothNumber).trim().toLowerCase() !== 'all' ? String(boothNumber).trim() : '-');

    return {
      wardNo: resolvedWard,
      partNo: resolvedPart,
      serialNo: voter.SRNO || voter.SNO || voter.SERIAL_NO || voter.SLNOINPART || voter.ID || voter.VID || '1',
      idNumber: voter.VID || voter.IDCARD || voter.EPIC || voter.EPIC_NO || '-',
      voterName: voter.EFVNAME || voter.FVNAME || voter.VOTER_NAME || vFName || '-',
      fatherHusbandName: voter.EFRNAME || voter.FRNAME || voter.RELATIVE_NAME || fFName || '-',
      houseNo: voter.HOUSE_NO || voter.FHOUSENO || voter.MHOUSENO || voter.HOUSENO || '0',
      gender: mappedGender,
      age: voter.AGE || voter.FAGE || voter.MAGE || '18',
      pollingStation: voter.PS_EN || voter.PS_HI || `${assemblyName || ''} ${resolvedPart !== '-' ? '- Booth ' + resolvedPart : ''}`.trim(),
      topImage: selectedOption === 1 ? batchImage : null,
      symbolImage: selectedOption === 3 ? batchImage : null,
    };
  };

  const getPageSlips = (pageIndex) => {
    if (!voters || !Array.isArray(voters)) return [];
    const startIndex = pageIndex * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageVoters = voters.slice(startIndex, endIndex);
    return pageVoters.map(mapVoterToSlip).filter(Boolean);
  };

  const previewSlipsData = useMemo(() => {
    return getPageSlips(0);
  }, [voters, cardsPerPage, selectedOption, batchImage, assemblyName, boothNumber, wardNo]);

  const handlePrintGenerate = async (mode = 'print') => {
    const isPreviewMode = mode === 'preview' || mode === true;
    const isDownloadOnly = mode === 'download';

    if (!voters || voters.length === 0) {
      alert('No voter data available to print.');
      return;
    }

    const printPageCount = isPreviewMode ? 1 : actualPagesToPrint;
    const printStartPageIndex = isPreviewMode ? 0 : currentStartPage - 1;

    if (!isPreviewMode && printPageCount > 100) {
      alert(`For optimal browser performance and to avoid crashes, please print up to 100 pages per batch.\nYou can print in batches (e.g. Pages 1 to 100, then 101 to 200).`);
      return;
    }

    if (!isPreviewMode && !isBalanceSufficient) {
      alert(`Insufficient credit balance! Required: ₹${totalCost.toFixed(2)}, Available: ₹${userBalance?.toFixed(2)}`);
      return;
    }

    setIsGenerating(true);
    setProgress(5);
    setStatusText(`Initializing batch of ${printPageCount} ${printPageCount === 1 ? 'page' : 'pages'}...`);

    try {
      // Yield so the browser paints the "Generating..." screen immediately
      await new Promise(r => setTimeout(r, 60));

      const ReactDOMServer = await import('react-dom/server');
      const SlipComp = selectedOption === 3 ? VoterSlipOption3 : VoterSlip;

      const pagesHtml = [];
      const targetPrepMax = isDownloadOnly ? 30 : 90;

      for (let i = 0; i < printPageCount; i++) {
        const pageIndex = printStartPageIndex + i;
        const pageSlips = getPageSlips(pageIndex);
        if (!pageSlips || pageSlips.length === 0) break;

        setStatusText(`Preparing page ${i + 1} of ${printPageCount}...`);

        pagesHtml.push(
          ReactDOMServer.renderToString(
            <BatchA4PrintLayout
              slipsData={pageSlips}
              pageNumber={pageIndex + 1}
              totalPages={printStartPageIndex + printPageCount}
              SlipComponent={SlipComp}
              headerData={{
                title: assemblyName || 'Voters Directory',
                wardNo: wardNo || '-',
                partNo: boothNumber || '-'
              }}
              cardsPerPage={cardsPerPage}
            />
          )
        );

        const currentPct = 5 + Math.round(((i + 1) / printPageCount) * (targetPrepMax - 5));
        setProgress(currentPct);

        // Yield execution to the browser event loop so UI progress updates smoothly
        await new Promise(r => setTimeout(r, 15));
      }

      if (pagesHtml.length === 0) {
        alert('No voter entries found for the selected pages.');
        return;
      }

      const actualSlipsCount = Math.min(voters.length, pagesHtml.length * cardsPerPage);

      if (isPreviewMode) {
        setStatusText('Generating preview PDF...');
        setProgress(70);
        await generatePdfFromHtml({
          pagesHtml,
          filename: `preview-batch-voter-slip.pdf`,
          onProgress: (p) => {
            setProgress(70 + Math.round(p * 0.3));
          },
          scale: 1.4,
          quality: 0.85
        });
        setProgress(100);
      } else if (isDownloadOnly) {
        setStatusText('Building PDF file for download...');
        await generatePdfFromHtml({
          pagesHtml,
          filename: `batch-voter-slips-p${currentStartPage}-to-p${currentStartPage + pagesHtml.length - 1}.pdf`,
          onProgress: (p) => {
            setProgress(30 + Math.round(p * 0.7));
            setStatusText(`Rendering page ${Math.ceil((p / 100) * pagesHtml.length)} of ${pagesHtml.length}...`);
          },
          scale: 1.4,
          quality: 0.85
        });
        setStatusText('Recording print transaction...');
        await logPrintTransaction({
          optionType: `Batch Slips Option ${selectedOption}`,
          wardNo: wardNo || '-',
          partNo: boothNumber || '-',
          serialNo: `${currentStartPage}-${currentStartPage + pagesHtml.length - 1}`,
          voterName: 'Batch Print',
          pagesCount: pagesHtml.length,
          cardsPerPage: cardsPerPage,
          slipsCount: actualSlipsCount,
          hasImage: hasImage
        });
        setProgress(100);
      } else {
        setStatusText('Opening browser print dialog...');
        setProgress(95);
        await printViaWindowPrint({
          htmlContent: pagesHtml.join(''),
          title: `batch-voter-slips-p${currentStartPage}-to-p${currentStartPage + pagesHtml.length - 1}`
        });
        setStatusText('Recording print transaction...');
        await logPrintTransaction({
          optionType: `Batch Slips Option ${selectedOption}`,
          wardNo: wardNo || '-',
          partNo: boothNumber || '-',
          serialNo: `${currentStartPage}-${currentStartPage + pagesHtml.length - 1}`,
          voterName: 'Batch Print',
          pagesCount: pagesHtml.length,
          cardsPerPage: cardsPerPage,
          slipsCount: actualSlipsCount,
          hasImage: hasImage
        });
        setProgress(100);
      }

      if (!isPreviewMode) {
        onClose();
      }
    } catch (err) {
      console.error('Batch print generation error:', err);
      alert('Error during batch print: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
        <div className="bg-white rounded-3xl p-5 sm:p-8 w-full shadow-2xl max-h-[90vh] overflow-y-auto max-w-5xl flex flex-col lg:flex-row gap-8">

          {/* Left Column: Form & Actions */}
          <div className="flex-1 min-w-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Batch Print Slips</h2>
              {userBalance !== null && !isAdminUser && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-700">
                  <span>Wallet:</span>
                  <span className="font-extrabold">₹{userBalance.toFixed(2)}</span>
                </div>
              )}
            </div>

            {isGenerating ? (
              <div className="space-y-6 py-6 px-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center shadow-inner">
                    <svg className="w-6 h-6 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">
                      Generating {actualPagesToPrint} {actualPagesToPrint === 1 ? 'Page' : 'Pages'}... Please wait.
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {statusText || `Pages ${currentStartPage} to ${currentEndPage} (${totalSlips} voter slips)`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-600 h-3.5 rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span className="animate-pulse text-indigo-600">
                      {progress < 95 ? '⚡ Processing slips in background...' : '🖨️ Finalizing output...'}
                    </span>
                    <span className="font-extrabold text-slate-700 font-mono">{Math.round(progress)}% Complete</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cards Per Page */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cards per Page</label>
                  <select
                    value={cardsPerPage}
                    onChange={(e) => setCardsPerPage(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium bg-white text-sm"
                  >
                    <option value={8}>8 Cards (Standard 2x4 Grid)</option>
                    {selectedOption !== 1 && <option value={10}>10 Cards (Compact 2x5 Grid)</option>}
                    {selectedOption !== 1 && <option value={12}>12 Cards (Dense 2x6 Grid)</option>}
                  </select>
                </div>

                {/* Clean, Easy Page Range Selector */}
                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Page Range
                    </label>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Total Available: <strong className="text-slate-800">{maxPages} Pages</strong> ({totalVotersCount} voters)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">From Page</label>
                      <input
                        type="number"
                        min="1"
                        max={maxPages}
                        value={startPage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStartPage(val === '' ? '' : Math.max(1, Math.min(maxPages, parseInt(val, 10) || 1)));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">To Page</label>
                      <input
                        type="number"
                        min="1"
                        max={maxPages}
                        value={endPage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEndPage(val === '' ? '' : Math.max(1, Math.min(maxPages, parseInt(val, 10) || 1)));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {/* Clean summary and simple "Next 10 Pages" shortcut */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-slate-600">
                    <span>
                      Printing: <strong className="text-indigo-600 font-bold">{actualPagesToPrint} Pages</strong> ({totalSlips} voter slips)
                    </span>

                    {currentEndPage < maxPages && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextStart = Math.min(maxPages, currentEndPage + 1);
                          const nextEnd = Math.min(maxPages, nextStart + 9);
                          setStartPage(nextStart);
                          setEndPage(nextEnd);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Next 10 Pages ➔
                      </button>
                    )}
                  </div>

                  {actualPagesToPrint > 100 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                      ⚠️ You selected {actualPagesToPrint} pages. To prevent browser freezing, please print up to 100 pages per batch.
                    </div>
                  )}
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Template</label>
                  <select
                    value={selectedOption}
                    onChange={(e) => {
                      const newOption = Number(e.target.value);
                      setSelectedOption(newOption);
                      if (newOption === 1 && cardsPerPage > 8) {
                        setCardsPerPage(8);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium bg-white text-sm"
                  >
                    <option value={1}>Option 1 (Top Banner Image)</option>
                    <option value={2}>Option 2 (Standard Template - Text Only)</option>
                    <option value={3}>Option 3 (Right Symbol Image)</option>
                  </select>
                </div>

                {/* Optional Image Attachment */}
                {selectedOption !== 2 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {selectedOption === 1 ? 'Top Banner Image (Optional)' : 'Symbol Image (Optional)'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {batchImage && (
                      <div className="mt-1.5 flex items-center justify-between text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span>✓ Image attached (+2 paisa rate applies)</span>
                        <button type="button" onClick={() => setBatchImage(null)} className="text-rose-500 hover:text-rose-700">Remove</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Credit Cost Estimate Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5">
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
                    <span>Pages to Print:</span>
                    <span className="font-bold text-slate-800">{actualPagesToPrint} <span className="text-[11px] font-normal text-slate-500">({totalSlips} slips)</span></span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-extrabold text-sm">
                    <span className="text-slate-800">Total Deduction:</span>
                    <span className="text-indigo-600 font-mono text-base">₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* Insufficient balance warning & Quick Top-Up */}
                {!isBalanceSufficient && (
                  <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-rose-200/80 text-rose-800 p-3.5 rounded-2xl text-xs space-y-2.5 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5 text-rose-600 font-bold">
                        ₹
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-rose-900">Insufficient Wallet Balance!</div>
                        <div className="text-slate-600 mt-0.5 leading-relaxed">
                          You need <strong className="text-rose-700">₹{totalCost.toFixed(2)}</strong> for {actualPagesToPrint} {actualPagesToPrint === 1 ? 'page' : 'pages'}, but your balance is <strong className="text-emerald-700">₹{(userBalance || 0).toFixed(2)}</strong>.
                        </div>
                      </div>
                    </div>

                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setIsTopupOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Recharge Wallet via UPI QR Code</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Area: Tip + Hero Button + Secondary Row */}
                <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                  {/* Tip Callout */}
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 text-amber-900 shadow-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-bold">⚡</span>
                    <p className="text-[11px] leading-snug text-slate-700">
                      <strong className="text-slate-900">Instant Download:</strong> Click <span className="font-semibold text-indigo-700">Print / Save as PDF</span> and select <span className="font-bold text-slate-900">"Save as PDF"</span> in the browser pop-up to save in 1 second!
                    </p>
                  </div>

                  {/* Primary Hero Button */}
                  <button
                    type="button"
                    onClick={() => handlePrintGenerate('print')}
                    disabled={!actualPagesToPrint || actualPagesToPrint < 1 || actualPagesToPrint > 100 || !isBalanceSufficient}
                    className="w-full py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:via-blue-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-between group"
                    title="Instant window.print popup - Save as PDF or Print directly"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-extrabold tracking-wide text-white">Print / Save as PDF</div>
                        <div className="text-[11px] font-medium text-indigo-100">Instant pop-up • Ready to download</div>
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-black font-mono tracking-tight text-white border border-white/25">
                      ₹{totalCost.toFixed(2)}
                    </div>
                  </button>

                  {/* Secondary Actions Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2.5 px-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 text-center text-xs transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintGenerate('download')}
                      disabled={!actualPagesToPrint || actualPagesToPrint < 1 || actualPagesToPrint > 100 || !isBalanceSufficient}
                      className="py-2.5 px-3 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm text-center text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      title="Generate and download .pdf file directly"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintGenerate('preview')}
                      className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl font-bold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 text-center text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Free Preview (1p)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Topup Modal */}
          <TopupModal
            isOpen={isTopupOpen}
            onClose={() => setIsTopupOpen(false)}
            requiredAmount={totalCost}
            currentBalance={userBalance || 0}
            onRechargeSuccess={() => {
              const token = localStorage.getItem('userToken');
              if (token) {
                fetch(`${API_BASE_URL}/api/me`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                  .then(r => r.json())
                  .then(d => {
                    if (d && !d.error) {
                      setUserBalance(Number(d.credits) || 0);
                    }
                  })
                  .catch(() => {});
              }
            }}
          />

          {/* Right Column: Live Preview */}
          <div className="hidden lg:flex flex-[1.2] flex-col items-center justify-start bg-slate-100 border border-slate-200 rounded-2xl p-4 overflow-hidden relative">
            <h3 className="text-sm font-bold text-slate-500 mb-4 w-full text-center uppercase tracking-wider">Page 1 Live Preview</h3>
            <div className="w-full flex-1 flex justify-center items-start custom-scrollbar overflow-y-auto py-2">
              <div className="flex justify-center shadow-md bg-white pointer-events-none" style={{ width: '210mm', height: '296.5mm', zoom: 0.45 }}>
                {previewSlipsData && previewSlipsData.length > 0 && (
                  <BatchA4PrintLayout
                    slipsData={previewSlipsData}
                    pageNumber={1}
                    totalPages={actualPagesToPrint}
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
            <button
              onClick={() => handlePrintGenerate('preview')}
              className="mt-4 px-6 py-2.5 rounded-xl font-bold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all text-center text-sm"
            >
              Download Free Preview PDF (1 Page)
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default BatchSlipPrintManager;
