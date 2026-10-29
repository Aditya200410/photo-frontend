import React, { useState, useRef } from 'react';
import API_BASE_URL from '../config';
import html2canvas from 'html2canvas-pro';
import { downloadPdfWithImageOverlay } from '../utils/pdfImageOverlay';

const FORMAT_DETAILS = [
  {
    id: 'simple',
    title: 'Simple Voter Slip',
    hindiTitle: 'साधारण मतदाता पर्ची',
    badge: '6 Per Page',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Clean standard voter card layout with Hindi name, EPIC number, Booth & Serial details.',
    previewType: 'grid6',
    accentColor: 'from-blue-600 to-indigo-600',
    tag: 'Popular'
  },
  {
    id: 'header',
    title: 'Voter Slip with Header',
    hindiTitle: 'हेडर / बैनर मतदाता पर्ची',
    badge: '6 Per Page',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Includes candidate / party top banner with voter details for campaigning.',
    previewType: 'header6',
    accentColor: 'from-purple-600 to-violet-600',
    tag: 'Campaign'
  },
  {
    id: 'symbol',
    title: 'Voter Slip with Symbol',
    hindiTitle: 'चुनाव चिन्ह मतदाता पर्ची',
    badge: '8 Per Page',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Compact 8-slip layout highlighting election symbol, voter photo placeholder & QR serial.',
    previewType: 'symbol8',
    accentColor: 'from-emerald-600 to-teal-600',
    tag: 'Compact'
  },
  {
    id: 'appeal',
    title: 'Personal Appeal Letter',
    hindiTitle: 'व्यक्तिगत अपील पत्र',
    badge: '1 Per Page',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Full-page personalized candidate appeal addressed to individual electors with verified serial.',
    previewType: 'appeal1',
    accentColor: 'from-amber-600 to-orange-600',
    tag: 'Letter'
  },
  {
    id: 'alphabetical',
    title: 'Alphabetical Voter List',
    hindiTitle: 'वर्णमाला मतदाता सूची',
    badge: '40 Per Page',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    description: 'Dense 40-voter indexed sheet sorted by Hindi alphabet for quick counting and booth lookup.',
    previewType: 'alphabetical40',
    accentColor: 'from-rose-600 to-red-600',
    tag: 'Booth Desk'
  }
];

export default function InstantPdfModal({ isOpen, onClose, activeExcelFile, title, subtitle }) {
  const [selectedFormatId, setSelectedFormatId] = useState('simple');
  const [headerImage, setHeaderImage] = useState(null);
  const [symbolImage, setSymbolImage] = useState(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isPastingPdf, setIsPastingPdf] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState('');
  const mockupRef = useRef(null);

  if (!isOpen) return null;

  const generatedPdfs = activeExcelFile?.generatedPdfs || {};
  const currentFormat = FORMAT_DETAILS.find(f => f.id === selectedFormatId) || FORMAT_DETAILS[0];
  const currentPdfData = generatedPdfs[selectedFormatId];

  // Active image for currently selected format
  const currentActiveImage = (selectedFormatId === 'header' && headerImage)
    ? headerImage
    : (selectedFormatId === 'symbol' && symbolImage)
      ? symbolImage
      : null;

  const handleDownloadPdf = async (e) => {
    if (!currentPdfData?.fileName) return;

    // If an image is selected for header or symbol, paste it across the server PDF
    if (currentActiveImage) {
      if (e) e.preventDefault();
      try {
        setIsPastingPdf(true);
        const serverPdfUrl = `${API_BASE_URL}/api/download/print_slips/${currentPdfData.fileName}`;
        const safeTitle = (title || 'Voter-Slips').replace(/[^a-zA-Z0-9_-]/g, '_');
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

          {/* Format Selection Cards (Mobile Friendly Grid) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                1. Select Layout & Format
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Tap card to preview layout
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {FORMAT_DETAILS.map(fmt => {
                const pdf = generatedPdfs[fmt.id];
                const isSelected = selectedFormatId === fmt.id;
                const isReady = Boolean(pdf?.fileName);

                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormatId(fmt.id)}
                    className={`relative rounded-2xl p-3 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-violet-600 shadow-md ring-4 ring-violet-500/10'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {/* Top status & badge */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${fmt.badgeColor}`}>
                        {fmt.badge}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {fmt.tag}
                      </span>
                    </div>

                    {/* Titles */}
                    <div className="mb-2">
                      <h4 className="text-xs font-black text-slate-800 leading-tight">
                        {fmt.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {fmt.hindiTitle}
                      </p>
                    </div>

                    {/* Server File Status */}
                    <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                      {isReady ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {pdf.sizeStr || 'Ready'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold">
                          Not Generated
                        </span>
                      )}
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-violet-600 text-white' : 'border border-slate-300 text-slate-400'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
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

            {/* Option to Add Image for Header or Symbol format */}
            {(currentFormat.id === 'header' || currentFormat.id === 'symbol') && (
              <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                    {currentFormat.id === 'header'
                      ? 'Add Header / Banner Image (हेडर बैनर फोटो):'
                      : 'Add Election Symbol Image (चुनाव चिन्ह फोटो):'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (currentFormat.id === 'header') {
                            setHeaderImage(ev.target.result);
                          } else {
                            setSymbolImage(ev.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-800 file:font-bold hover:file:bg-violet-200 cursor-pointer"
                  />
                </div>

                {((currentFormat.id === 'header' && headerImage) || (currentFormat.id === 'symbol' && symbolImage)) && (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-black flex items-center gap-1 text-[11px] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      ✓ Image Added to Slip
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentFormat.id === 'header') setHeaderImage(null);
                        else setSymbolImage(null);
                      }}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* A4 Sheet Mockup Simulation */}
            <div className="w-full flex justify-center py-2">
              <div
                ref={mockupRef}
                className="w-full max-w-sm sm:max-w-md bg-white border-2 border-slate-300 rounded-xl shadow-lg p-3 sm:p-4 aspect-[1/1.414] flex flex-col justify-between overflow-hidden"
              >
                {/* Simulated A4 Header */}
                <div className="border-b-2 border-slate-800 pb-1.5 mb-2 flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-slate-800">
                  <span className="truncate">{title || 'मतदाता सूची पर्ची 2026'}</span>
                  <span>Page 1 of {currentPdfData?.pages || 50}</span>
                </div>

                {/* 1. Simple 6/page Grid */}
                {currentFormat.id === 'simple' && (
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 flex-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border border-slate-300 rounded p-1 sm:p-1.5 flex flex-col justify-between bg-slate-50/40 text-[7px] sm:text-[8px]">
                        <div className="border-b border-slate-200 pb-0.5 flex justify-between font-bold text-slate-700">
                          <span>मतदाता पर्ची</span>
                          <span className="text-violet-600">क्र० {i + 1}</span>
                        </div>
                        <div className="space-y-0.5 text-slate-500 py-0.5">
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-700">नाम:</span>
                            <span className="w-14 h-1.5 bg-slate-200 rounded"></span>
                          </div>
                          <div className="flex justify-between">
                            <span>पिता:</span>
                            <span className="w-10 h-1.5 bg-slate-200 rounded"></span>
                          </div>
                          <div className="flex justify-between">
                            <span>म० नं०: 1{i}</span>
                            <span>आयु: 3{i} • पुरूष</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-200 pt-0.5 text-right font-mono text-[6px] sm:text-[7px] font-extrabold text-slate-700">
                          RJ/02/10{i}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Header 6/page Grid */}
                {currentFormat.id === 'header' && (
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 flex-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border border-purple-300 rounded overflow-hidden flex flex-col justify-between bg-white text-[7px] sm:text-[8px]">
                        {headerImage ? (
                          <div className="h-5 sm:h-6 w-full border-b border-purple-300 overflow-hidden bg-slate-50 flex items-center justify-center">
                            <img src={headerImage} alt="Header" className="w-full h-full object-fill block" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[7px] text-center py-0.5 px-1 truncate">
                            ★ प्रत्याशी का नाम एवं चुनाव चिन्ह ★
                          </div>
                        )}
                        <div className="p-1 space-y-0.5 text-slate-500">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-700">मतदाता:</span>
                            <span className="w-12 h-1.5 bg-slate-200 rounded"></span>
                          </div>
                          <div className="flex justify-between">
                            <span>पिता:</span>
                            <span className="w-8 h-1.5 bg-slate-200 rounded"></span>
                          </div>
                          <div className="text-[6px] text-slate-400">कमरा नं० {i + 1}</div>
                        </div>
                        <div className="bg-slate-50 px-1 py-0.5 border-t border-slate-200 flex justify-between font-mono text-[6px] font-bold">
                          <span>क्र० {i + 1}</span>
                          <span className="text-purple-700">UCW098{i}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Symbol 8/page Grid */}
                {currentFormat.id === 'symbol' && (
                  <div className="grid grid-cols-2 gap-1 sm:gap-1.5 flex-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="border border-emerald-300 rounded p-1 flex items-center justify-between bg-white text-[6px] sm:text-[7px]">
                        <div className="space-y-0.5 flex-1 pr-1">
                          <div className="font-black text-slate-800 text-[7px]">मतदाता पर्ची #{i + 1}</div>
                          <div className="w-12 h-1 bg-slate-200 rounded"></div>
                          <div className="text-[6px] text-slate-400">वार्ड {i + 1} • म० {i + 10}</div>
                        </div>
                        <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-300 flex items-center justify-center font-bold text-emerald-700 text-[8px] shrink-0 overflow-hidden p-0.5">
                          {symbolImage ? (
                            <img src={symbolImage} alt="Symbol" className="w-full h-full object-contain block" />
                          ) : (
                            <span>कमल</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Personal Appeal Letter */}
                {currentFormat.id === 'appeal' && (
                  <div className="h-full border border-amber-300 rounded-lg p-2 sm:p-3 flex flex-col justify-between bg-amber-50/20 text-[7px] sm:text-[9px]">
                    <div className="border-b border-amber-300 pb-1.5 text-center">
                      <div className="font-black text-amber-900 text-[10px] sm:text-xs">
                        सादर प्रणाम एवं विनम्र अपील
                      </div>
                      <div className="text-[7px] text-amber-700 font-semibold">
                        आपके उज्ज्वल भविष्य व क्षेत्र के सर्वांगीण विकास हेतु
                      </div>
                    </div>
                    <div className="space-y-1.5 my-auto text-slate-600 leading-relaxed">
                      <p>
                        आदरणीय <strong className="text-slate-900 underline">राजू राम जी</strong>, आपके परिवार का बहुमूल्य मत हमारे लिए आशीर्वाद स्वरूप है।
                      </p>
                      <div className="bg-white border border-amber-200 rounded p-1 text-[7px] space-y-0.5">
                        <div>मतदाता क्रमांक: <strong>45</strong> | भाग संख्या: <strong>26</strong></div>
                        <div>मतदान केंद्र: <strong>राजकीय उच्च माध्यमिक विद्यालय</strong></div>
                      </div>
                    </div>
                    <div className="border-t border-amber-200 pt-1 flex justify-between items-center text-[7px] text-slate-500">
                      <span>निवेदक: समस्त ग्रामवासी</span>
                      <span className="font-bold text-amber-900">आपका सेवक</span>
                    </div>
                  </div>
                )}

                {/* 5. Alphabetical List (40/page) */}
                {currentFormat.id === 'alphabetical' && (
                  <div className="flex-1 border border-slate-200 rounded overflow-hidden flex flex-col">
                    <div className="bg-slate-100 font-extrabold text-[6px] sm:text-[7px] grid grid-cols-6 p-0.5 border-b border-slate-300 text-slate-700">
                      <span>क्र०</span>
                      <span className="col-span-2">मतदाता नाम</span>
                      <span>संबंधी</span>
                      <span>आयु/लिंग</span>
                      <span className="text-right">पहचान पत्र</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-[5px] sm:text-[6px] text-slate-600 flex-1 overflow-hidden">
                      {['अनिल कुमार', 'अशोक शर्मा', 'कमलेश देवी', 'दिनेश जाट', 'पूजा कुमारी', 'राकेश वर्मा', 'सुरेश सिंह', 'सुनीता बाई'].map((name, idx) => (
                        <div key={idx} className="grid grid-cols-6 p-0.5 items-center">
                          <span className="font-bold text-slate-800">{idx + 1}</span>
                          <span className="col-span-2 font-semibold text-slate-900">{name}</span>
                          <span className="truncate">रामेश्वर</span>
                          <span>34 / पु०</span>
                          <span className="text-right font-mono font-bold text-slate-700">RJ/02/10{idx}</span>
                        </div>
                      ))}
                      <div className="p-1 text-center text-slate-400 italic text-[5px]">
                        + 32 more voters on this A4 sheet
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Footer */}
                <div className="border-t border-slate-200 pt-1 mt-1 text-[7px] text-slate-400 flex justify-between">
                  <span>Election 2026</span>
                  <span>100% Vector Crystal Clear</span>
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
