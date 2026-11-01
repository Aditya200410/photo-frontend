import React, { useState, useRef } from 'react';
import API_BASE_URL from '../config';
import html2canvas from 'html2canvas-pro';
import { downloadPdfWithImageOverlay } from '../utils/pdfImageOverlay';

const FORMAT_DETAILS = [
  // --- Without Header Options ---
  {
    id: 'simple8',
    legacyId: null,
    group: 'withoutHeader',
    title: 'Without Header',
    hindiTitle: 'बिना हेडर मतदाता पर्ची',
    badge: '8 Per Page',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Clean standard voter card layout on A4 paper (8 slips per page) without candidate header.',
    cardsPerPage: 8,
    hasHeader: false,
    accentColor: 'from-emerald-600 to-teal-600',
    tag: '8 Slip / A4'
  },
  {
    id: 'simple10',
    legacyId: null,
    group: 'withoutHeader',
    title: 'Without Header',
    hindiTitle: 'बिना हेडर मतदाता पर्ची',
    badge: '10 Per Page',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Medium density voter cards (10 slips per page) formatted for A4 printing without header.',
    cardsPerPage: 10,
    hasHeader: false,
    accentColor: 'from-blue-600 to-cyan-600',
    tag: '10 Slip / A4'
  },
  {
    id: 'simple12',
    legacyId: null,
    group: 'withoutHeader',
    title: 'Without Header',
    hindiTitle: 'बिना हेडर मतदाता पर्ची',
    badge: '12 Per Page',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Maximum density voter cards (12 slips per page) to save paper and printing costs.',
    cardsPerPage: 12,
    hasHeader: false,
    accentColor: 'from-slate-700 to-slate-900',
    tag: '12 Slip / A4'
  },

  // --- With Header Options ---
  {
    id: 'header6',
    legacyId: 'header', // maps to existing 6/page header pregenerated pdf
    group: 'withHeader',
    title: 'With Header',
    hindiTitle: 'हेडर / बैनर मतदाता पर्ची',
    badge: '6 Per Page',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Includes candidate & election banner at top of each slip (6 slips per A4 page).',
    cardsPerPage: 6,
    hasHeader: true,
    accentColor: 'from-purple-600 to-violet-600',
    tag: '6 Slip / A4'
  },
  {
    id: 'header8',
    legacyId: 'header',
    group: 'withHeader',
    title: 'With Header',
    hindiTitle: 'हेडर / बैनर मतदाता पर्ची',
    badge: '8 Per Page',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Includes candidate banner on 8 slips per A4 page for compact election campaign slips.',
    cardsPerPage: 8,
    hasHeader: true,
    accentColor: 'from-indigo-600 to-blue-600',
    tag: '8 Slip / A4'
  },

  // --- Alphabetical List ---
  {
    id: 'alphabetical',
    legacyId: 'alphabetical',
    group: 'alphabetical',
    title: 'Alphabetical Voter List',
    hindiTitle: 'वर्णमाला मतदाता सूची',
    badge: '40 Entry / Page',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Dense 40-voter indexed sheet sorted by Hindi alphabet for quick counting and booth desk lookup.',
    cardsPerPage: 40,
    hasHeader: false,
    accentColor: 'from-rose-600 to-red-600',
    tag: '40 Entry / Page'
  }
];

export default function InstantPdfModal({ isOpen, onClose, activeExcelFile, title, subtitle }) {
  const [selectedFormatId, setSelectedFormatId] = useState('simple8');
  const [headerImage, setHeaderImage] = useState(null);
  const [symbolImage, setSymbolImage] = useState(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isPastingPdf, setIsPastingPdf] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState('');
  const mockupRef = useRef(null);

  if (!isOpen) return null;

  const generatedPdfs = activeExcelFile?.generatedPdfs || {};
  const currentFormat = FORMAT_DETAILS.find(f => f.id === selectedFormatId) || FORMAT_DETAILS[0];
  
  // Resolve PDF data: exact id match or fallback to legacyId (e.g. 'simple8' -> 'symbol' or 'simple', 'header6' -> 'header')
  const currentPdfData = generatedPdfs[selectedFormatId] || (currentFormat.legacyId ? generatedPdfs[currentFormat.legacyId] : null);

  // Active image for currently selected format
  const currentActiveImage = (currentFormat.hasHeader && headerImage)
    ? headerImage
    : (selectedFormatId === 'symbol' && symbolImage)
      ? symbolImage
      : null;

  const handleDownloadPdf = async (e) => {
    if (e) e.preventDefault();
    if (!currentPdfData?.fileName) return;

    const serverPdfUrl = `${API_BASE_URL}/api/download/print_slips/${currentPdfData.fileName}`;
    const safeTitle = (title || 'Voter-Slips').replace(/[^a-zA-Z0-9_-]/g, '_');

    // Case 1: An image is selected for header or symbol -> paste dynamically and download
    if (currentActiveImage) {
      try {
        setIsPastingPdf(true);
        const outputFilename = `${safeTitle}-${selectedFormatId}-With-Image.pdf`;

        await downloadPdfWithImageOverlay({
          pdfUrl: serverPdfUrl,
          imageDataUrl: currentActiveImage,
          formatId: selectedFormatId,
          outputFilename,
          onProgress: (pct, msg) => {
            setOverlayStatus(msg);
          }
        });
      } catch (err) {
        console.error('Error pasting image to PDF:', err);
        alert('Error stamping image to PDF: ' + (err.message || 'Unknown error'));
      } finally {
        setIsPastingPdf(false);
        setOverlayStatus('');
      }
      return;
    }

    // Case 2: Standard PDF direct download from server
    try {
      setIsPastingPdf(true);
      setOverlayStatus('Downloading PDF from server...');
      
      const link = document.createElement('a');
      link.href = serverPdfUrl;
      link.download = currentPdfData.fileName || `${safeTitle}-${selectedFormatId}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Direct download failed:', err);
      window.open(serverPdfUrl, '_blank');
    } finally {
      setIsPastingPdf(false);
      setOverlayStatus('');
    }
  };

  const handleDownloadMockupImage = async () => {
    if (!mockupRef.current) return;
    try {
      setIsDownloadingImage(true);
      const canvas = await html2canvas(mockupRef.current, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeTitle = (title || 'voter-slip').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeTitle}-${currentFormat.id}-preview.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting slip image:', err);
      alert('Error generating slip image preview: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Instant Pre-Generated Slip PDFs</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Ready on Server
                </span>
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                {title || 'Directory'} {subtitle ? `• ${subtitle}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer text-sm font-bold"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-slate-50/50">

          {/* Format Selection Cards Grouped by Categories */}
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
                Select Slip Layout & Format (A4 Paper)
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Tap card to preview layout & download
              </span>
            </div>

            {/* Category 1: Without Header (8, 10, 12 Slip on A4) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  📄 Without Header (बिना हेडर) — 8, 10, 12 Slip on A4
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {FORMAT_DETAILS.filter(fmt => fmt.group === 'withoutHeader').map(fmt => {
                  const pdf = generatedPdfs[fmt.id] || (fmt.legacyId ? generatedPdfs[fmt.legacyId] : null);
                  const isSelected = selectedFormatId === fmt.id;
                  const isReady = Boolean(pdf?.fileName);

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormatId(fmt.id)}
                      className={`relative rounded-2xl p-3 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-emerald-600 shadow-md ring-4 ring-emerald-500/10'
                          : 'bg-white/80 border-slate-200 hover:border-emerald-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${fmt.badgeColor}`}>
                          {fmt.badge}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {fmt.tag}
                        </span>
                      </div>

                      <div className="mb-2">
                        <h4 className="text-xs font-black text-slate-900 leading-tight">
                          {fmt.title} ({fmt.cardsPerPage} Slips)
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {fmt.hindiTitle}
                        </p>
                      </div>

                      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                        {isReady ? (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {pdf.sizeStr || 'Ready'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold">
                            Generate in Admin
                          </span>
                        )}
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-slate-400'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category 2: With Header (6, 8 Slip on A4) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200">
                  👉🏻 With Header (हेडर / बैनर सहित) — 6, 8 Slip on A4
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FORMAT_DETAILS.filter(fmt => fmt.group === 'withHeader').map(fmt => {
                  const pdf = generatedPdfs[fmt.id] || (fmt.legacyId ? generatedPdfs[fmt.legacyId] : null);
                  const isSelected = selectedFormatId === fmt.id;
                  const isReady = Boolean(pdf?.fileName);

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormatId(fmt.id)}
                      className={`relative rounded-2xl p-3 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-purple-600 shadow-md ring-4 ring-purple-500/10'
                          : 'bg-white/80 border-slate-200 hover:border-purple-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${fmt.badgeColor}`}>
                          {fmt.badge}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          {fmt.tag}
                        </span>
                      </div>

                      <div className="mb-2">
                        <h4 className="text-xs font-black text-slate-900 leading-tight">
                          {fmt.title} ({fmt.cardsPerPage} Slips)
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {fmt.hindiTitle}
                        </p>
                      </div>

                      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                        {isReady ? (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {pdf.sizeStr || 'Ready'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold">
                            Generate in Admin
                          </span>
                        )}
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-purple-600 text-white' : 'border border-slate-300 text-slate-400'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category 3: Alphabetical 40 Entry / Page */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200">
                  📋 Alphabetical: 40 Entry / Page (वर्णमाला मतदाता सूची)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {FORMAT_DETAILS.filter(fmt => fmt.group === 'alphabetical').map(fmt => {
                  const pdf = generatedPdfs[fmt.id] || (fmt.legacyId ? generatedPdfs[fmt.legacyId] : null);
                  const isSelected = selectedFormatId === fmt.id;
                  const isReady = Boolean(pdf?.fileName);

                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormatId(fmt.id)}
                      className={`relative rounded-2xl p-3 border-2 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-white border-rose-600 shadow-md ring-4 ring-rose-500/10'
                          : 'bg-white/80 border-slate-200 hover:border-rose-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border ${fmt.badgeColor} shrink-0`}>
                          {fmt.badge}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight">
                            {fmt.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {fmt.hindiTitle} • 40 मतदाता प्रति A4 पेज (वर्णमाला अनुसार अनुक्रमित)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {isReady ? (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {pdf.sizeStr || 'Ready'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold">
                            Generate in Admin
                          </span>
                        )}
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-rose-600 text-white' : 'border border-slate-300 text-slate-400'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Layout Visual Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {currentFormat.title} ({currentFormat.hindiTitle})
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentFormat.badgeColor}`}>
                    {currentFormat.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentFormat.description}
                </p>
              </div>

              {/* Action buttons at preview header */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadMockupImage}
                  disabled={isDownloadingImage}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-slate-800 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer disabled:opacity-50"
                  title="Download current slip layout preview as high-resolution PNG image"
                >
                  <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{isDownloadingImage ? 'Generating Image...' : 'Download Slip Image (PNG)'}</span>
                </button>

                {currentPdfData?.fileName && (
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isPastingPdf}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-white bg-gradient-to-r ${currentFormat.accentColor} shadow-md shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>
                      {isPastingPdf
                        ? (overlayStatus || 'Pasting Image on PDF...')
                        : currentActiveImage
                          ? `Download PDF with Image (${currentPdfData.pages} pgs)`
                          : `Download Complete PDF (${currentPdfData.pages} pgs • ${currentPdfData.sizeStr})`}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Prominently Highlighted Option to Add Image for formats with Header */}
            {currentFormat.hasHeader && (
              <div className="mb-4 p-4 sm:p-5 bg-gradient-to-r from-purple-100 via-violet-50 to-indigo-50 border-2 border-purple-400 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-purple-950 flex items-center gap-2">
                      <span>Add Candidate Banner / Header Image</span>
                      <span className="text-[10px] uppercase font-extrabold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                        Recommended
                      </span>
                    </h4>
                    <p className="text-xs text-purple-800 font-medium mt-0.5">
                      हेडर बैनर फोटो चुनें (यह फोटो हर मतदाता पर्ची के ऊपर आटोमेटिक प्रिंट होगी)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/25 active:scale-95 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>{headerImage ? 'Change Image / फोटो बदलें' : 'Choose Header Image / फोटो चुनें'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setHeaderImage(ev.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {headerImage && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                      <img src={headerImage} alt="Preview" className="w-8 h-6 object-cover rounded border border-purple-200" />
                      <span className="text-emerald-700 font-black text-xs">✓ Ready</span>
                      <button
                        type="button"
                        onClick={() => setHeaderImage(null)}
                        className="text-xs text-rose-600 font-bold hover:underline ml-1 cursor-pointer"
                        title="Remove attached image"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* A4 Sheet Mockup Simulation */}
            <div className="w-full flex justify-center py-2">
              <div
                ref={mockupRef}
                className="w-full max-w-[480px] bg-white border-2 border-slate-400 rounded-lg shadow-xl p-3 sm:p-4 aspect-[1/1.414] flex flex-col justify-between overflow-hidden text-black font-sans"
              >
                {/* Real A4 Sheet Top Header */}
                <div className="border-b-2 border-black pb-1 mb-2 flex items-center justify-between text-[9px] sm:text-[10px] font-black text-black">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-black">{title || 'अजमेर'}</span>
                    <span className="font-bold text-slate-700">वार्ड: -</span>
                    <span className="font-bold text-slate-700">भाग / बूथ: -</span>
                  </div>
                  <span className="font-bold">Page 1 of {currentPdfData?.pages || 584}</span>
                </div>

                {/* Dynamic Slip Grid Preview */}
                {currentFormat.id === 'alphabetical' ? (
                  <div className="flex-1 border border-black rounded overflow-hidden flex flex-col">
                    <div className="bg-slate-100 font-black text-[7px] grid grid-cols-6 p-1 border-b border-black text-black">
                      <span>क्र०</span>
                      <span className="col-span-2">मतदाता नाम</span>
                      <span>संबंधी</span>
                      <span>आयु/लिंग</span>
                      <span className="text-right">पहचान पत्र</span>
                    </div>
                    <div className="divide-y divide-slate-200 text-[6.5px] text-black flex-1 overflow-hidden">
                      {['अनिल कुमार', 'अशोक शर्मा', 'कमलेश देवी', 'दिनेश जाट', 'पूजा कुमारी', 'राकेश वर्मा', 'सुरेश सिंह', 'सुनीता बाई'].map((name, idx) => (
                        <div key={idx} className="grid grid-cols-6 p-1 items-center font-medium">
                          <span className="font-black text-black">{idx + 1}</span>
                          <span className="col-span-2 font-black text-black">{name}</span>
                          <span className="truncate">रामेश्वर</span>
                          <span>34 / पु०</span>
                          <span className="text-right font-mono font-black text-black">RJ/02/10{idx}</span>
                        </div>
                      ))}
                      <div className="p-1.5 text-center text-slate-400 font-semibold italic text-[6px]">
                        + 32 more voters on this A4 sheet (Total 40 / page)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`grid grid-cols-2 flex-1 ${
                    currentFormat.cardsPerPage >= 12
                      ? 'gap-1'
                      : currentFormat.cardsPerPage >= 10
                        ? 'gap-1.5'
                        : 'gap-2'
                  }`}>
                    {[...Array(currentFormat.cardsPerPage || 8)].map((_, i) => (
                      <div 
                        key={i} 
                        className="border-[1.5px] border-black bg-white flex flex-col justify-between overflow-hidden shadow-2xs"
                        style={{ fontSize: currentFormat.cardsPerPage >= 12 ? '6.5px' : currentFormat.cardsPerPage >= 10 ? '7.5px' : '8.5px' }}
                      >
                        {/* Header Banner if format has header */}
                        {currentFormat.hasHeader && (
                          headerImage ? (
                            <div className="flex flex-col border-b border-black shrink-0 w-full">
                              <div className="h-14 sm:h-16 w-full overflow-hidden bg-white flex items-center justify-center">
                                <img src={headerImage} alt="Header" className="w-full h-full object-fill block" />
                              </div>
                              <div className="w-full text-center text-[5px] sm:text-[6px] font-black text-black bg-white border-t border-black py-0.5 tracking-tight shrink-0">
                                मतदान केंद्र जाने से पहले ऊपर वाले इस भाग को काट दे
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col border-b border-black shrink-0 w-full">
                              <div className="h-14 sm:h-16 w-full bg-slate-50 flex items-center justify-center text-[7px] text-slate-500 font-bold border-b border-dashed border-slate-300">
                                [उम्मीदवार हेडर बैनर फोटो]
                              </div>
                              <div className="w-full text-center text-[5px] sm:text-[6px] font-black text-black bg-white py-0.5 tracking-tight shrink-0">
                                मतदान केंद्र जाने से पहले ऊपर वाले इस भाग को काट दे
                              </div>
                            </div>
                          )
                        )}

                        {/* Real Electoral Slip Body */}
                        <div className="p-1 sm:p-2 flex-1 flex flex-col justify-between text-black leading-tight min-h-0 bg-white">
                          {/* Row 1: Ward & Part */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 font-bold">
                              <span>वार्ड नं० :</span>
                              <span className="border border-black px-2 py-0.5 font-black text-[1.1em] min-w-[24px] text-center inline-block">{i + 1}</span>
                            </div>
                            <div className="flex items-center gap-1 font-bold">
                              <span>भाग नं० :</span>
                              <span className="border border-black px-2 py-0.5 font-black text-[1.1em] min-w-[24px] text-center inline-block">26</span>
                            </div>
                          </div>

                          {/* Row 2: Serial & EPIC */}
                          <div className="flex justify-between items-center my-0.5">
                            <div className="flex items-center gap-1 font-bold">
                              <span>क्रम संख्या :</span>
                              <span className="border border-black px-2 py-0.5 font-black text-[1.1em] min-w-[28px] text-center inline-block">{13 + i}</span>
                            </div>
                            <span className="font-black font-mono tracking-wider text-[1.05em]">UCW09351{14 + i}</span>
                          </div>

                          {/* Row 3: Elector Name */}
                          <div className="font-medium truncate my-0.5">
                            <span className="font-bold mr-1">मतदाता का नाम :</span>
                            <span className="font-black text-[1.05em]">{['NYALA', 'RODU', 'LILI', 'GORULAL', 'RAMRAJ', 'KISHAN', 'KAILASH', 'SHANTI'][i % 8]}</span>
                          </div>

                          {/* Row 4: Father/Husband Name */}
                          <div className="font-medium truncate my-0.5">
                            <span className="font-bold mr-1">पिता / पति का नाम :</span>
                            <span className="font-bold">{['RAMRAJ', 'IRA', 'SITARAM', 'JIWAN', 'RUPA', 'NARAYAN', 'GOPAL', 'BHANWAR'][i % 8]}</span>
                          </div>

                          {/* Row 5: House, Gender, Age */}
                          <div className="flex justify-between items-center text-[0.95em] pt-0.5">
                            <div><span className="font-bold">मकान नं० : </span><span className="font-black">87 क</span></div>
                            <div><span className="font-bold">लिंग: </span><span className="font-bold">{i % 2 === 0 ? 'महिला' : 'पुरुष'}</span></div>
                            <div><span className="font-bold">आयु: </span><span className="font-black">{30 + i}</span></div>
                          </div>

                          {/* Row 6: Polling Station */}
                          <div className="text-[0.82em] font-medium truncate text-slate-800 pt-0.5 border-t border-slate-100">
                            <span className="font-bold text-black">मतदान केंद्र: </span>
                            <span>26 - राज० उच्च माध्यमिक विद्यालय, अकोडिया कमरा न० 22</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulated Footer */}
                <div className="border-t border-slate-300 pt-1 mt-1 text-[7px] text-slate-500 flex justify-between font-medium">
                  <span>Election 2026 Voter Slip Format</span>
                  <span>100% Vector Print Quality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="text-xs text-slate-600">
              Selected: <strong className="text-slate-900">{currentFormat.title}</strong> • 
              Status: {currentPdfData?.fileName ? (
                <span className="text-emerald-700 font-bold ml-1">
                  ✓ Available ({currentPdfData.pages} pages, {currentPdfData.sizeStr})
                </span>
              ) : (
                <span className="text-amber-700 font-bold ml-1">
                  ⚠️ Generate in Admin to download
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadMockupImage}
                disabled={isDownloadingImage}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                title="Download current slip layout preview image"
              >
                <svg className="w-3.5 h-3.5 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{isDownloadingImage ? 'Exporting...' : 'Download Slip Image'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              {currentPdfData?.fileName ? (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isPastingPdf}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-white bg-gradient-to-r ${currentFormat.accentColor} shadow-md shadow-violet-500/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-50`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>
                    {isPastingPdf
                      ? (overlayStatus || 'Pasting Image...')
                      : currentActiveImage
                        ? 'Download PDF with Image'
                        : 'Download Now'}
                  </span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
                >
                  Not Available
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
