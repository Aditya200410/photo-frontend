import API_BASE_URL from '../config';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import BatchA4PrintLayout from './BatchA4PrintLayout';
import VoterSlip from './VoterSlip';
import VoterSlipOption3 from './VoterSlipOption3';
import TopupModal from './TopupModal';
import html2canvas from 'html2canvas-pro';
import { generatePdfFromHtml, printViaWindowPrint, logPrintTransaction } from '../utils/printService';
import { downloadPdfWithImageOverlay } from '../utils/pdfImageOverlay';

function BatchSlipPrintManager({ isOpen, onClose, voters, assemblyName, boothNumber, wardNo, activeExcelFile }) {
  // Template format: 
  // Without Header: 'simple8' (8 slip/page), 'simple10' (10 slip/page), 'simple12' (12 slip/page)
  // With Header: 'header6' (6 slip/page), 'header8' (8 slip/page)
  // Alphabetical: 'alphabetical' (40 entry/page)
  const [selectedFormat, setSelectedFormat] = useState('simple8');

  // Cards per page settings for formats
  const [cardsPerPage, setCardsPerPage] = useState(8);

  // Extra pages toggles
  const [extraPages, setExtraPages] = useState({
    boothIndex: false,
    boothSummary: false,
    countingSheet: false,
    workCompleted: false
  });

  // Candidate image / symbol
  const [bannerImage, setBannerImage] = useState(null);
  const [symbolImage, setSymbolImage] = useState(null);
  const [isExportingImage, setIsExportingImage] = useState(false);

  // User balance & settings
  const [userBalance, setUserBalance] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const cancelProcessingRef = useRef(false);

  // Metrics for processing board
  const [processingStats, setProcessingStats] = useState({
    status: 'Ready',
    progress: 0,
    startTime: null,
    endTime: null,
    estFinishTime: null,
    timeElapsedStr: '—',
    timeRemainingStr: '—',
    speedVotersPerSec: '—',
    speedPagesPerMin: '—',
    recordsDone: 0,
    totalRecords: 0,
    boothsDone: 0,
    totalBooths: 1,
    estimatedPages: 0,
    pdfsToCreate: 1
  });

  const timerRef = useRef(null);

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

  const totalVotersCount = voters && Array.isArray(voters) ? voters.length : 0;

  // Calculate estimated pages based on template
  const effectiveCardsPerPage = useMemo(() => {
    if (selectedFormat === 'appeal') return 1;
    if (selectedFormat === 'alphabetical') return 40;
    if (selectedFormat === 'simple8' || selectedFormat === 'header8') return 8;
    if (selectedFormat === 'simple10') return 10;
    if (selectedFormat === 'simple12') return 12;
    if (selectedFormat === 'header6') return 6;
    return cardsPerPage;
  }, [selectedFormat, cardsPerPage]);

  // Page Range Selection ('all' or 'custom')
  const [pageRangeMode, setPageRangeMode] = useState('all'); // 'all' or 'custom'
  const [customStartPage, setCustomStartPage] = useState(1);
  const [customEndPage, setCustomEndPage] = useState(1);

  // Sync customEndPage whenever total slip pages change
  const totalRawSlipPages = totalVotersCount > 0 ? Math.ceil(totalVotersCount / effectiveCardsPerPage) : 1;

  useEffect(() => {
    if (pageRangeMode === 'all') {
      setCustomStartPage(1);
      setCustomEndPage(totalRawSlipPages);
    }
  }, [totalRawSlipPages, pageRangeMode]);

  // Validated range
  const validStartPage = Math.max(1, Math.min(Number(customStartPage) || 1, totalRawSlipPages));
  const validEndPage = Math.max(validStartPage, Math.min(Number(customEndPage) || totalRawSlipPages, totalRawSlipPages));

  // Determine active pages and corresponding voters slice
  const activeSlipPagesCount = pageRangeMode === 'all' 
    ? totalRawSlipPages 
    : (validEndPage - validStartPage + 1);

  const extraPagesCount = (extraPages.boothIndex ? 1 : 0) +
    (extraPages.boothSummary ? 1 : 0) +
    (extraPages.countingSheet ? 1 : 0) +
    (extraPages.workCompleted ? 1 : 0);

  const totalEstimatedPages = activeSlipPagesCount + extraPagesCount;

  // Active records to print based on page selection
  const activeRecordsCount = pageRangeMode === 'all' 
    ? totalVotersCount 
    : Math.min(totalVotersCount, activeSlipPagesCount * effectiveCardsPerPage);

  const hasHeaderFormat = selectedFormat === 'header6' || selectedFormat === 'header8' || selectedFormat === 'header';

  const hasImage = Boolean(
    (hasHeaderFormat && bannerImage) ||
    (selectedFormat === 'symbol' && symbolImage)
  );

  const ratePerPage = hasImage ? (settings?.rateWithImage ?? 0.12) : (settings?.rateWithoutImage ?? 0.10);
  const totalCost = Math.round(totalEstimatedPages * ratePerPage * 100) / 100;
  const isBalanceSufficient = isAdminUser || userBalance === null || userBalance >= totalCost;

  // Sync format changes with sensible default cards per page
  const handleSelectFormat = (fmt) => {
    setSelectedFormat(fmt);
    if (fmt === 'simple8') setCardsPerPage(8);
    else if (fmt === 'simple10') setCardsPerPage(10);
    else if (fmt === 'simple12') setCardsPerPage(12);
    else if (fmt === 'header6') setCardsPerPage(6);
    else if (fmt === 'header8') setCardsPerPage(8);
    else if (fmt === 'appeal') setCardsPerPage(1);
    else if (fmt === 'alphabetical') setCardsPerPage(40);
  };

  const toggleExtraPage = (key) => {
    setExtraPages(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStopProcessing = () => {
    if (isProcessing) {
      cancelProcessingRef.current = true;
      setProcessingStats(prev => ({
        ...prev,
        status: 'Stopped by user'
      }));
    }
  };

  const mapVoterToSlip = (voter) => {
    if (!voter) return null;
    const rawGender = voter.FGENDER || voter.MSEX || voter.GENDER || voter.SEX || '';
    const mappedGender = rawGender === 'M' || rawGender === 'पुरुष' ? 'पुरुष' : (rawGender === 'F' || rawGender === 'स्त्री' ? 'स्त्री' : rawGender);

    const vFName = voter.V_FNAME_EN ? `${voter.V_FNAME_EN} ${voter.V_LNAME_EN || ''}`.trim() : (voter.V_FNAME_HI || '');
    const fFName = voter.VR_FNAME_EN ? `${voter.VR_FNAME_EN} ${voter.VR_LNAME_EN || ''}`.trim() : (voter.VR_FNAME_HI || '');

    const rawWard = voter.WARDNO || voter.WARD_NO || voter['WARD NO'] || voter['PANCHAYAT WARD NO'] || voter.WARD || voter.NWARDNO || voter._meta_ward || voter.ward || wardNo;
    const resolvedWard = (rawWard !== undefined && rawWard !== null && String(rawWard).trim() !== '' && String(rawWard).trim().toLowerCase() !== 'all') 
      ? String(rawWard).trim() 
      : (wardNo && String(wardNo).trim().toLowerCase() !== 'all' ? String(wardNo).trim() : '-');

    const rawPart = voter.PART_NO || voter.BOOTH_NO || voter.PARTNO || voter['PART NO'] || voter.PART || voter.BOOTH || voter._meta_booth || voter.booth || boothNumber;
    const resolvedPart = (rawPart !== undefined && rawPart !== null && String(rawPart).trim() !== '' && String(rawPart).trim().toLowerCase() !== 'all') 
      ? String(rawPart).trim() 
      : (boothNumber && String(boothNumber).trim().toLowerCase() !== 'all' ? String(boothNumber).trim() : '-');

    return {
      wardNo: resolvedWard,
      partNo: resolvedPart,
      serialNo: voter.SLNOINPART || voter.SL_NO || voter.SERIAL_NO || '-',
      idNumber: voter.IDCARD_NO || voter.EPIC_NO || voter.VOTER_ID || '-',
      voterName: vFName || '-',
      fatherHusbandName: fFName || '-',
      houseNo: voter.HOUSE_NO || voter.FHOUSENO || voter.MHOUSENO || voter.HOUSENO || '0',
      gender: mappedGender,
      age: voter.AGE || voter.FAGE || voter.MAGE || '18',
      pollingStation: voter.PS_EN || voter.PS_HI || `${assemblyName || ''} ${resolvedPart !== '-' ? '- Booth ' + resolvedPart : ''}`.trim(),
      topImage: hasHeaderFormat ? bannerImage : null,
      symbolImage: selectedFormat === 'symbol' ? symbolImage : null,
    };
  };

  // Main start processing function
  const handleStartProcessing = async () => {
    if (!voters || voters.length === 0) {
      alert('No voter data available to print.');
      return;
    }

    if (!isBalanceSufficient) {
      alert(`Insufficient credit balance! Required: ₹${totalCost.toFixed(2)}, Available: ₹${userBalance?.toFixed(2)}`);
      return;
    }

    cancelProcessingRef.current = false;
    setIsProcessing(true);

    const startTime = Date.now();
    const startTimeFormatted = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setProcessingStats({
      status: 'Processing voter slips...',
      progress: 0,
      startTime: startTimeFormatted,
      endTime: null,
      estFinishTime: 'Calculating...',
      timeElapsedStr: '00:00',
      timeRemainingStr: 'Calculating...',
      speedVotersPerSec: '0.0',
      speedPagesPerMin: '0.0',
      recordsDone: 0,
      totalRecords: totalVotersCount,
      boothsDone: 0,
      totalBooths: 1,
      estimatedPages: totalEstimatedPages,
      pdfsToCreate: 1
    });

    // Start timer ticker for non-freezing time elapsed
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const m = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const s = String(elapsedSec % 60).padStart(2, '0');
      setProcessingStats(prev => ({
        ...prev,
        timeElapsedStr: `${m}:${s}`
      }));
    }, 1000);

    // Check if pre-generated PDF exists from backend for this format (or legacy fallback)
    const legacyFallbackMap = {
      simple8: 'simple',
      simple10: 'simple',
      simple12: 'simple',
      header6: 'header',
      header8: 'header',
      alphabetical: 'alphabetical'
    };
    const serverPdf = activeExcelFile?.generatedPdfs?.[selectedFormat] || 
      (legacyFallbackMap[selectedFormat] ? activeExcelFile?.generatedPdfs?.[legacyFallbackMap[selectedFormat]] : null);

    const canUseServerPdf = false && Boolean(
      serverPdf &&
      serverPdf.fileName &&
      pageRangeMode === 'all' &&
      !extraPages.boothIndex &&
      !extraPages.boothSummary &&
      !extraPages.countingSheet &&
      !extraPages.workCompleted
    );

    if (false && canUseServerPdf) {
      try {
        setProcessingStats(prev => ({
          ...prev,
          status: 'Fetching pre-generated PDF from server...',
          progress: 50,
          estimatedPages: serverPdf.pages || totalEstimatedPages
        }));

        // Trigger direct backend download or paste uploaded image if provided
        const downloadUrl = `${API_BASE_URL}/api/download/print_slips/${serverPdf.fileName}`;
        const activeImg = (hasHeaderFormat && bannerImage)
          ? bannerImage
          : (selectedFormat === 'symbol' && symbolImage)
            ? symbolImage
            : null;

        if (activeImg) {
          setProcessingStats(prev => ({
            ...prev,
            status: 'Pasting candidate image across all pages...',
            progress: 65
          }));

          const safeBooth = (boothNumber || '1').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
          const outputFilename = `Voter-Slips-Booth-${safeBooth}-${selectedFormat}-With-Image.pdf`;

          await downloadPdfWithImageOverlay({
            pdfUrl: downloadUrl,
            imageDataUrl: activeImg,
            formatId: selectedFormat,
            outputFilename,
            onProgress: (pct, msg) => {
              setProcessingStats(prev => ({
                ...prev,
                status: msg,
                progress: Math.min(90, Math.max(50, pct))
              }));
            }
          });
        } else {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', serverPdf.fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

        // Record print transaction in backend
        setProcessingStats(prev => ({
          ...prev,
          status: 'Logging print transaction...',
          progress: 90
        }));

        await logPrintTransaction({
          optionType: `Batch Slips (Server PDF) - ${selectedFormat}`,
          wardNo: wardNo || '-',
          partNo: boothNumber || '-',
          serialNo: `1-${totalVotersCount}`,
          voterName: 'Batch Print (Backend Pre-generated)',
          pagesCount: serverPdf.pages || totalEstimatedPages,
          cardsPerPage: effectiveCardsPerPage,
          slipsCount: totalVotersCount,
          hasImage: hasImage
        });

        const finishTimestamp = new Date();
        setProcessingStats(prev => ({
          ...prev,
          status: 'Downloaded directly from server!',
          progress: 100,
          recordsDone: totalVotersCount,
          timeRemainingStr: '00:00',
          endTime: finishTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));

        return;
      } catch (err) {
        console.error('Server PDF download error:', err);
        alert('Server download error: ' + (err.message || 'Failed to download pre-generated PDF'));
        setProcessingStats(prev => ({
          ...prev,
          status: 'Error downloading server PDF: ' + err.message
        }));
        return;
      } finally {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsProcessing(false);
      }
    }


    // FAST SERVER-SIDE NATIVE PDF GENERATION FOR FILTERED DATA
    // Generates high-definition PDF in seconds via Chrome backend engine
    try {
      setProcessingStats(prev => ({
        ...prev,
        status: 'Generating high-definition PDF in backend engine...',
        progress: 25
      }));

      const activeImg = (hasHeaderFormat && bannerImage)
        ? bannerImage
        : (selectedFormat === 'symbol' && symbolImage)
          ? symbolImage
          : null;

      const response = await fetch(`${API_BASE_URL}/api/generate-filtered-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voters,
          formatId: selectedFormat,
          meta: {
            assembly: assemblyName || 'मतदाता सूची पर्ची',
            ward: wardNo || '-',
            booth: boothNumber || '-'
          },
          bannerImage: activeImg,
          pageRangeMode,
          startPage: validStartPage,
          endPage: validEndPage
        })
      });

      if (response.ok) {
        setProcessingStats(prev => ({
          ...prev,
          status: 'Receiving generated PDF file...',
          progress: 85
        }));

        const blob = await response.blob();
        const rangeSuffix = pageRangeMode === 'custom' ? `-Pages-${validStartPage}-to-${validEndPage}` : '';
        const finalPdfFilename = `Voter-Slips-Booth-${boothNumber || '1'}-${selectedFormat}${rangeSuffix}.pdf`;

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', finalPdfFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);

        // Record print transaction in backend
        setProcessingStats(prev => ({
          ...prev,
          status: 'Logging print transaction...',
          progress: 95
        }));

        await logPrintTransaction({
          optionType: `Batch Slips (Filtered PDF Engine) - ${selectedFormat}${pageRangeMode === 'custom' ? ` (Pages ${validStartPage}-${validEndPage})` : ''}`,
          wardNo: wardNo || '-',
          partNo: boothNumber || '-',
          serialNo: pageRangeMode === 'custom' ? `Pages ${validStartPage}-${validEndPage}` : `1-${totalVotersCount}`,
          voterName: 'Batch Print (Filtered)',
          pagesCount: totalEstimatedPages,
          cardsPerPage: effectiveCardsPerPage,
          slipsCount: activeRecordsCount,
          hasImage: hasImage
        });

        const finishTimestamp = new Date();
        setProcessingStats(prev => ({
          ...prev,
          status: 'Completed! High-definition PDF downloaded.',
          progress: 100,
          recordsDone: activeRecordsCount,
          timeRemainingStr: '00:00',
          endTime: finishTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));

        return;
      } else {
        console.warn('Backend fast PDF generation responded with error, falling back to client-side...', response.status);
      }
    } catch (backendPdfErr) {
      console.warn('Fast backend PDF failed, falling back to client-side engine:', backendPdfErr);
    }

    try {
      // Yield to let browser render UI immediately without freezing
      await new Promise(r => setTimeout(r, 60));

      const ReactDOMServer = await import('react-dom/server');
      const SlipComp = selectedFormat === 'symbol' ? VoterSlipOption3 : VoterSlip;

      const pagesHtml = [];

      // 1. Extra page: Booth Index if selected
      if (extraPages.boothIndex) {
        pagesHtml.push(
          `<div class="a4-print-sheet" style="padding:15mm;font-family:sans-serif;">
            <div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:20px;">
              <h1 style="font-size:24px;margin:0;color:#0f172a;">Booth Index (Page Nos.)</h1>
              <p style="margin:5px 0;color:#475569;">${assemblyName || 'Voter Directory'} - Booth ${boothNumber || '1'}</p>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;text-align:left;">
                  <th style="padding:8px;">Booth No</th>
                  <th style="padding:8px;">Booth / Polling Station Name</th>
                  <th style="padding:8px;text-align:center;">Voters</th>
                  <th style="padding:8px;text-align:right;">Page Numbers</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 8px;font-weight:bold;">${boothNumber || '1'}</td>
                  <td style="padding:10px 8px;">${assemblyName || 'Polling Station'}</td>
                  <td style="padding:10px 8px;text-align:center;">${totalVotersCount}</td>
                  <td style="padding:10px 8px;text-align:right;font-weight:bold;">1 - ${slipPagesCount}</td>
                </tr>
              </tbody>
            </table>
          </div>`
        );
      }

      // 2. Extra page: Booth summary page if selected
      if (extraPages.boothSummary) {
        let maleCount = 0, femaleCount = 0;
        voters.forEach(v => {
          const g = (v.FGENDER || v.MSEX || v.GENDER || v.SEX || '').trim().toUpperCase();
          if (g === 'M' || g === 'पुरुष') maleCount++;
          else if (g === 'F' || g === 'स्त्री') femaleCount++;
        });

        pagesHtml.push(
          `<div class="a4-print-sheet" style="padding:15mm;font-family:sans-serif;">
            <div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:20px;">
              <h1 style="font-size:22px;margin:0;color:#0f172a;">Booth Summary Page</h1>
              <p style="margin:5px 0;color:#475569;">${assemblyName || 'Voter Directory'} - Booth ${boothNumber || '1'}</p>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-bottom:25px;">
              <div style="border:1px solid #cbd5e1;border-radius:10px;padding:15px;text-align:center;background:#f8fafc;">
                <div style="font-size:12px;color:#64748b;font-weight:bold;">TOTAL ELECTORS</div>
                <div style="font-size:28px;font-weight:bold;color:#0f172a;margin-top:5px;">${totalVotersCount}</div>
              </div>
              <div style="border:1px solid #cbd5e1;border-radius:10px;padding:15px;text-align:center;background:#eff6ff;">
                <div style="font-size:12px;color:#3b82f6;font-weight:bold;">MALE ELECTORS</div>
                <div style="font-size:28px;font-weight:bold;color:#1e40af;margin-top:5px;">${maleCount}</div>
              </div>
              <div style="border:1px solid #cbd5e1;border-radius:10px;padding:15px;text-align:center;background:#fdf2f8;">
                <div style="font-size:12px;color:#ec4899;font-weight:bold;">FEMALE ELECTORS</div>
                <div style="font-size:28px;font-weight:bold;color:#9d174d;margin-top:5px;">${femaleCount}</div>
              </div>
            </div>
          </div>`
        );
      }

      // 3. Render voter slips chunk by chunk with non-freezing event ticks
      let renderedVotersCount = 0;

      const startPageLoop = pageRangeMode === 'all' ? 0 : (validStartPage - 1);
      const endPageLoop = pageRangeMode === 'all' ? totalRawSlipPages : validEndPage;

      for (let p = startPageLoop; p < endPageLoop; p++) {
        if (cancelProcessingRef.current) break;

        const startIdx = p * effectiveCardsPerPage;
        const endIdx = Math.min(totalVotersCount, startIdx + effectiveCardsPerPage);
        const pageVoters = voters.slice(startIdx, endIdx);
        const slips = pageVoters.map(mapVoterToSlip).filter(Boolean);

        const currentSlipPageNumber = p + 1;

        if (selectedFormat === 'appeal') {
          // 1 per page Personal Appeal Letter format
          const slip = slips[0];
          pagesHtml.push(
            `<div class="a4-print-sheet" style="padding:15mm;font-family:sans-serif;box-sizing:border-box;">
              <div style="border:3px solid #ea580c;border-radius:12px;padding:15px;background:#ffffff;">
                <div style="background:#ea580c;color:#ffffff;padding:12px;text-align:center;border-radius:8px;margin-bottom:15px;">
                  <h2 style="margin:0;font-size:22px;font-weight:bold;">वार्ड नं. ${slip?.wardNo || '-'} से पार्षद पद हेतु</h2>
                  <h3 style="margin:5px 0 0 0;font-size:18px;">प्रत्याशी का नाम</h3>
                </div>
                <div style="padding:10px;font-size:15px;line-height:1.6;color:#1e293b;">
                  <p><strong>आदरणीय श्री/श्रीमती:</strong> ${slip?.voterName || '-'}</p>
                  <p><strong>पिता/पति का नाम:</strong> ${slip?.fatherHusbandName || '-'}</p>
                  <p><strong>मकान नंबर:</strong> ${slip?.houseNo || '-'}</p>
                  <p><strong>भाग संख्या:</strong> ${slip?.partNo || '-'} &nbsp; | &nbsp; <strong>क्रम संख्या:</strong> ${slip?.serialNo || '-'}</p>
                  <p><strong>पहचान पत्र क्रमांक:</strong> ${slip?.idNumber || '-'}</p>
                  <div style="margin-top:20px;padding:12px;background:#fff7ed;border-left:4px solid #ea580c;border-radius:4px;font-size:14px;">
                    आपसे विनम्र निवेदन है कि आगामी चुनाव में हमारे योग्य एवं कर्मठ प्रत्याशी को भारी मतों से विजयी बनाकर सेवा का अवसर प्रदान करें।
                  </div>
                </div>
              </div>
            </div>`
          );
        } else if (selectedFormat === 'alphabetical') {
          // 40 per page Alphabetical Voter List table
          pagesHtml.push(
            `<div class="a4-print-sheet" style="padding:8mm;font-family:sans-serif;box-sizing:border-box;">
              <div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:6px;margin-bottom:10px;">
                <h2 style="font-size:16px;margin:0;color:#0f172a;">मतदाता सूची (वर्णमाला अनुसार / Alphabetical List)</h2>
                <div style="font-size:11px;color:#475569;margin-top:3px;">${assemblyName || ''} - भाग संख्या: ${boothNumber || '-'} - Page ${currentSlipPageNumber} of ${totalRawSlipPages}</div>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:9.5px;">
                <thead>
                  <tr style="background:#0f172a;color:#ffffff;text-align:left;">
                    <th style="padding:4px 6px;">क्र.सं.</th>
                    <th style="padding:4px 6px;">मतदाता का नाम</th>
                    <th style="padding:4px 6px;">पिता / पति का नाम</th>
                    <th style="padding:4px 6px;text-align:center;">मकान</th>
                    <th style="padding:4px 6px;text-align:center;">लिंग</th>
                    <th style="padding:4px 6px;text-align:center;">आयु</th>
                    <th style="padding:4px 6px;text-align:right;">पहचान पत्र क्र.</th>
                  </tr>
                </thead>
                <tbody>
                  ${slips.map((s, idx) => `
                    <tr style="border-bottom:1px solid #e2e8f0;background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                      <td style="padding:3.5px 6px;font-weight:bold;">${s.serialNo}</td>
                      <td style="padding:3.5px 6px;font-weight:600;">${s.voterName}</td>
                      <td style="padding:3.5px 6px;">${s.fatherHusbandName}</td>
                      <td style="padding:3.5px 6px;text-align:center;">${s.houseNo}</td>
                      <td style="padding:3.5px 6px;text-align:center;">${s.gender}</td>
                      <td style="padding:3.5px 6px;text-align:center;">${s.age}</td>
                      <td style="padding:3.5px 6px;text-align:right;font-family:monospace;font-weight:bold;">${s.idNumber}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>`
          );
        } else {
          // Standard A4 Layout Grid (Simple, Header, Symbol)
          pagesHtml.push(
            ReactDOMServer.renderToString(
              <BatchA4PrintLayout
                slipsData={slips}
                pageNumber={currentSlipPageNumber}
                totalPages={totalRawSlipPages}
                SlipComponent={SlipComp}
                headerData={{
                  title: assemblyName || 'मतदाता सूची पर्ची',
                  wardNo: wardNo || '-',
                  partNo: boothNumber || '-'
                }}
                cardsPerPage={effectiveCardsPerPage}
              />
            )
          );
        }

        renderedVotersCount += pageVoters.length;

        // Calculate dynamic real-time speed & estimated finish time
        const now = Date.now();
        const elapsedSec = Math.max(0.1, (now - startTime) / 1000);
        const votersPerSec = (renderedVotersCount / elapsedSec).toFixed(1);
        const pagesProcessedSoFar = (p - startPageLoop + 1);
        const pagesPerMin = (pagesProcessedSoFar / (elapsedSec / 60)).toFixed(1);

        const remainingVoters = activeRecordsCount - renderedVotersCount;
        const estRemainingSec = Number(votersPerSec) > 0 ? Math.ceil(remainingVoters / Number(votersPerSec)) : 0;
        const remM = String(Math.floor(estRemainingSec / 60)).padStart(2, '0');
        const remS = String(estRemainingSec % 60).padStart(2, '0');

        const estFinishTimestamp = new Date(now + estRemainingSec * 1000);
        const estFinishTimeStr = estFinishTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const currentProgress = Math.round((pagesProcessedSoFar / totalEstimatedPages) * 70);

        setProcessingStats(prev => ({
          ...prev,
          status: `Processing page ${currentSlipPageNumber} (${pagesProcessedSoFar} of ${activeSlipPagesCount} selected)...`,
          progress: currentProgress,
          estFinishTime: estFinishTimeStr,
          timeRemainingStr: `${remM}:${remS}`,
          speedVotersPerSec: votersPerSec,
          speedPagesPerMin: pagesPerMin,
          recordsDone: renderedVotersCount,
          boothsDone: p === endPageLoop - 1 ? 1 : 0
        }));

        // Yield to browser execution cycle so UI stays fluid and non-freezing
        await new Promise(r => setTimeout(r, 20));
      }

      // 4. Extra page: Counting Sheet (OMR)
      if (extraPages.countingSheet && !cancelProcessingRef.current) {
        pagesHtml.push(
          `<div class="a4-print-sheet" style="padding:10mm;font-family:sans-serif;box-sizing:border-box;">
            <div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:8px;margin-bottom:12px;">
              <h2 style="font-size:18px;margin:0;color:#0f172a;">Counting Sheet (OMR)</h2>
              <div style="font-size:11px;color:#475569;">${assemblyName || ''} - Booth: ${boothNumber || '1'}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(10, 1fr);gap:4px;font-size:10px;text-align:center;">
              ${Array.from({ length: Math.min(1000, totalVotersCount) }, (_, i) => `
                <div style="border:1px solid #cbd5e1;padding:4px 2px;border-radius:3px;background:#ffffff;">
                  <span style="font-weight:bold;color:#475569;">${i + 1}</span>
                  <div style="width:12px;height:12px;border-radius:50%;border:1px solid #94a3b8;margin:2px auto 0 auto;"></div>
                </div>
              `).join('')}
            </div>
          </div>`
        );
      }

      // 5. Extra page: Work completed page
      if (extraPages.workCompleted && !cancelProcessingRef.current) {
        pagesHtml.push(
          `<div class="a4-print-sheet" style="padding:25mm;font-family:sans-serif;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="width:80px;height:80px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-size:40px;margin-bottom:20px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
              ✓
            </div>
            <h1 style="font-size:32px;font-weight:900;color:#0f172a;margin:0 0 10px 0;">Your Work is Completed!</h1>
            <p style="font-size:16px;color:#64748b;margin:0 0 25px 0;">
              Total <strong>${totalVotersCount}</strong> voters processed successfully from Booth <strong>${boothNumber || '1'}</strong>.
            </p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:15px 30px;font-size:13px;color:#475569;">
              Generated on ${new Date().toLocaleDateString()} • Voter Directory Pro
            </div>
          </div>`
        );
      }

      if (cancelProcessingRef.current) {
        setProcessingStats(prev => ({ ...prev, status: 'Stopped' }));
        return;
      }

      // Final step: Convert to PDF and automatically trigger download
      setProcessingStats(prev => ({
        ...prev,
        status: 'Building final PDF & downloading automatically...',
        progress: 80
      }));

      const rangeSuffix = pageRangeMode === 'custom' ? `-Pages-${validStartPage}-to-${validEndPage}` : '';
      const finalPdfFilename = `Voter-Slips-Booth-${boothNumber || '1'}-${selectedFormat}${rangeSuffix}.pdf`;

      await generatePdfFromHtml({
        pagesHtml,
        filename: finalPdfFilename,
        onProgress: (p) => {
          setProcessingStats(prev => ({
            ...prev,
            progress: 80 + Math.round(p * 0.2),
            status: `Building high-definition PDF (${p}%)...`
          }));
        },
        scale: 2.0,
        quality: 0.95
      });

      // Record print transaction in backend
      setProcessingStats(prev => ({
        ...prev,
        status: 'Logging print transaction...',
        progress: 99
      }));

      await logPrintTransaction({
        optionType: `Batch Slips - ${selectedFormat}${pageRangeMode === 'custom' ? ` (Pages ${validStartPage}-${validEndPage})` : ''}`,
        wardNo: wardNo || '-',
        partNo: boothNumber || '-',
        serialNo: pageRangeMode === 'custom' ? `Pages ${validStartPage}-${validEndPage}` : `1-${totalVotersCount}`,
        voterName: 'Batch Print',
        pagesCount: pagesHtml.length,
        cardsPerPage: effectiveCardsPerPage,
        slipsCount: activeRecordsCount,
        hasImage: hasImage
      });

      const finishTimestamp = new Date();
      setProcessingStats(prev => ({
        ...prev,
        status: 'Completed! File downloaded.',
        progress: 100,
        timeRemainingStr: '00:00',
        endTime: finishTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));

    } catch (err) {
      console.error('Batch process error:', err);
      alert('Error during processing: ' + (err.message || 'Unknown error'));
      setProcessingStats(prev => ({
        ...prev,
        status: 'Error: ' + (err.message || 'Processing failed')
      }));
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsProcessing(false);
    }
  };

  // Export current voter slip sheet / layout as PNG Image
  const handleDownloadSheetImage = async () => {
    if (!voters || voters.length === 0) {
      alert('No voter data available to export as image.');
      return;
    }

    try {
      setIsExportingImage(true);
      const ReactDOMServer = await import('react-dom/server');
      const SlipComp = selectedFormat === 'symbol' ? VoterSlipOption3 : VoterSlip;

      const startIdx = pageRangeMode === 'custom' ? (validStartPage - 1) * effectiveCardsPerPage : 0;
      const endIdx = Math.min(totalVotersCount, startIdx + effectiveCardsPerPage);
      const pageVoters = voters.slice(startIdx, endIdx);
      const slips = pageVoters.map(mapVoterToSlip).filter(Boolean);

      const pageHtml = ReactDOMServer.renderToString(
        <BatchA4PrintLayout
          slipsData={slips}
          pageNumber={pageRangeMode === 'custom' ? validStartPage : 1}
          totalPages={totalRawSlipPages}
          SlipComponent={SlipComp}
          headerData={{
            title: assemblyName || 'मतदाता सूची पर्ची',
            wardNo: wardNo || '-',
            partNo: boothNumber || '-'
          }}
          cardsPerPage={effectiveCardsPerPage}
        />
      );

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '0px';
      tempContainer.style.left = '-10000px';
      tempContainer.style.width = '794px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.zIndex = '-99999';
      tempContainer.innerHTML = pageHtml;
      document.body.appendChild(tempContainer);

      await new Promise(r => setTimeout(r, 60));

      const canvas = await html2canvas(tempContainer, {
        scale: 2.5,
        width: 794,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempContainer);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Voter-Slips-Booth-${boothNumber || '1'}-${selectedFormat}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading slip sheet image:', err);
      alert('Error generating image: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExportingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh]">

          {/* Top Modal Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Batch Slip Print & PDF Generator</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Pro Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {assemblyName || 'Constituency'} • Booth: <strong className="text-white">{boothNumber || 'All'}</strong> • Total Voters: <strong className="text-emerald-400">{totalVotersCount}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {userBalance !== null && !isAdminUser && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span>Wallet:</span>
                  <span className="font-mono text-sm text-white">₹{userBalance.toFixed(2)}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

            {/* 1. TOP CARDS: Print Formats / Design Options */}
            <div className="space-y-4">
              {/* Group 1: Without Header (8, 10, 12 Slip on A4) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                    📄 Without Header (बिना हेडर) — 8, 10, 12 Slip on A4 Paper
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'simple8', title: 'Without Header', slips: 8, badge: '8 Per Page', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', tag: '8 Slip / A4' },
                    { id: 'simple10', title: 'Without Header', slips: 10, badge: '10 Per Page', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200', tag: '10 Slip / A4' },
                    { id: 'simple12', title: 'Without Header', slips: 12, badge: '12 Per Page', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300', tag: '12 Slip / A4' }
                  ].map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectFormat(item.id)}
                      className={`relative rounded-2xl border-2 transition-all p-3 cursor-pointer flex flex-col justify-between bg-white ${
                        selectedFormat === item.id ? 'border-emerald-600 shadow-lg ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          selectedFormat === item.id ? 'bg-emerald-600 text-white font-bold' : 'border-2 border-slate-300'
                        }`}>
                          {selectedFormat === item.id && '✓'}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight">{item.title} ({item.slips} Slips)</h4>
                          <p className="text-[10px] text-slate-500 font-medium">साधारण मतदाता पर्ची</p>
                        </div>
                      </div>

                      {/* Mockup */}
                      <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden p-1.5 mb-2">
                        <div className="grid grid-cols-2 gap-1 h-full">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="border border-slate-300 bg-white rounded-[2px] p-1 flex flex-col justify-between text-[6px]">
                              <div className="border-b border-slate-200 pb-0.5 font-bold truncate text-slate-700">मतदाता पर्ची #{i + 1}</div>
                              <div className="space-y-0.5">
                                <div className="w-full h-1 bg-slate-200 rounded-xs"></div>
                                <div className="w-2/3 h-1 bg-slate-200 rounded-xs"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-center py-1 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                        {item.slips} Slips / A4 Sheet
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2: With Header (6, 8 Slip on A4) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-900 bg-purple-100/80 px-2.5 py-1 rounded-lg border border-purple-200">
                    👉🏻 With Header (हेडर / बैनर सहित) — 6, 8 Slip on A4 Paper
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'header6', title: 'With Header', slips: 6, badge: '6 Per Page', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200', tag: '6 Slip / A4' },
                    { id: 'header8', title: 'With Header', slips: 8, badge: '8 Per Page', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', tag: '8 Slip / A4' }
                  ].map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectFormat(item.id)}
                      className={`relative rounded-2xl border-2 transition-all p-3 cursor-pointer flex flex-col justify-between bg-white ${
                        selectedFormat === item.id ? 'border-purple-600 shadow-lg ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          {item.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          selectedFormat === item.id ? 'bg-purple-600 text-white font-bold' : 'border-2 border-slate-300'
                        }`}>
                          {selectedFormat === item.id && '✓'}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight">{item.title} ({item.slips} Slips)</h4>
                          <p className="text-[10px] text-slate-500 font-medium">हेडर / बैनर मतदाता पर्ची</p>
                        </div>
                      </div>

                      {/* Mockup */}
                      <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden p-1.5 mb-2">
                        <div className="grid grid-cols-2 gap-1 h-full">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="border border-purple-300 bg-white rounded-[2px] overflow-hidden flex flex-col text-[6px]">
                              {bannerImage ? (
                                <div className="h-3.5 w-full bg-white overflow-hidden flex items-center justify-center">
                                  <img src={bannerImage} alt="Header" className="w-full h-full object-fill block" />
                                </div>
                              ) : (
                                <div className="h-3.5 bg-slate-100 text-slate-500 border-b border-slate-200 flex items-center justify-center font-bold text-[5px] truncate px-0.5">
                                  [Banner Space]
                                </div>
                              )}
                              <div className="p-0.5 space-y-0.5">
                                <div className="w-full h-1 bg-slate-200 rounded-xs"></div>
                                <div className="w-2/3 h-1 bg-slate-200 rounded-xs"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-center py-1 bg-purple-50 rounded-lg border border-purple-200 text-purple-900">
                        {item.slips} Slips with Header / A4 Sheet
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3: Alphabetical (40 Entry / Page) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-900 bg-rose-100/80 px-2.5 py-1 rounded-lg border border-rose-200">
                    📋 Alphabetical: 40 Entry / Page (वर्णमाला मतदाता सूची)
                  </span>
                </div>
                <div
                  onClick={() => handleSelectFormat('alphabetical')}
                  className={`relative rounded-2xl border-2 transition-all p-3.5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white ${
                    selectedFormat === 'alphabetical' ? 'border-rose-600 shadow-lg ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      selectedFormat === 'alphabetical' ? 'bg-rose-600 text-white font-bold' : 'border-2 border-slate-300'
                    }`}>
                      {selectedFormat === 'alphabetical' && '✓'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">Alphabetical Voter List</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-rose-100 text-rose-800 border-rose-200">
                          40 Entry / Page
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        वर्णमाला मतदाता सूची • बूथ डेस्क और त्वरित खोज हेतु वर्णमाला अनुसार व्यवस्थित सूची (40 मतदाता प्रति पेज)
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-900 shrink-0 text-center">
                    40 voters / page
                  </div>
                </div>
              </div>
            </div>

            {/* Prominently Highlighted Banner/Symbol upload if applicable */}
            {(hasHeaderFormat || selectedFormat === 'symbol') && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-100 via-violet-50 to-indigo-50 rounded-2xl border-2 border-purple-400 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-purple-950 flex items-center gap-2">
                      <span>{hasHeaderFormat ? 'Candidate Header / Banner Image' : 'Election Symbol Image'}</span>
                      <span className="text-[10px] uppercase font-extrabold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                        {hasHeaderFormat ? 'Header Banner' : 'Symbol'}
                      </span>
                    </h4>
                    <p className="text-xs text-purple-800 font-medium mt-0.5">
                      {hasHeaderFormat 
                        ? 'उम्मीदवार हेडर बैनर फोटो चुनें (यह सभी पर्चियों में स्वतः पेस्ट होगी)' 
                        : 'उम्मीदवार चुनाव चिन्ह फोटो चुनें'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/25 active:scale-95 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>{(bannerImage || symbolImage) ? 'Change Image / फोटो बदलें' : 'Choose Image / फोटो चुनें'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (hasHeaderFormat) setBannerImage(ev.target.result);
                            else setSymbolImage(ev.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {(bannerImage || symbolImage) && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                      <img src={bannerImage || symbolImage} alt="Preview" className="w-8 h-6 object-cover rounded border border-purple-200" />
                      <span className="text-emerald-700 font-black text-xs">✓ Attached (+2p)</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasHeaderFormat) setBannerImage(null);
                          else setSymbolImage(null);
                        }}
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

            {/* PAGE RANGE SELECTION OPTIONS */}
            <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/20 to-indigo-50/20 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                      Page Range Selection
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Total pages available: <strong className="text-slate-800">{totalRawSlipPages}</strong> ({totalVotersCount} total voters)
                    </p>
                  </div>
                </div>

                {/* Range Mode Toggles */}
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPageRangeMode('all')}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pageRangeMode === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    All Pages ({totalRawSlipPages})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPageRangeMode('custom');
                      if (customEndPage > totalRawSlipPages) setCustomEndPage(totalRawSlipPages);
                    }}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pageRangeMode === 'custom'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>
              </div>

              {/* Custom Range Inputs */}
              {pageRangeMode === 'custom' && (
                <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">From Page:</label>
                      <input
                        type="number"
                        min="1"
                        max={totalRawSlipPages}
                        value={customStartPage}
                        disabled={isProcessing}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(totalRawSlipPages, Number(e.target.value) || 1));
                          setCustomStartPage(val);
                          if (val > customEndPage) setCustomEndPage(val);
                        }}
                        className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-center focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <span className="text-xs font-bold text-slate-400">to</span>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">To Page:</label>
                      <input
                        type="number"
                        min={customStartPage || 1}
                        max={totalRawSlipPages}
                        value={customEndPage}
                        disabled={isProcessing}
                        onChange={(e) => {
                          const val = Math.max(Number(customStartPage) || 1, Math.min(totalRawSlipPages, Number(e.target.value) || 1));
                          setCustomEndPage(val);
                        }}
                        className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-center focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      (of {totalRawSlipPages} max)
                    </span>
                  </div>

                  {/* Range summary pill */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      Printing {activeSlipPagesCount} pages (~{activeRecordsCount} voters)
                    </span>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setCustomStartPage(1);
                        setCustomEndPage(Math.min(100, totalRawSlipPages));
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      1 to 100
                    </button>
                    {totalRawSlipPages >= 200 && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => {
                          setCustomStartPage(1);
                          setCustomEndPage(200);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        1 to 200
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. SECTION 4 · PROCESSING DASHBOARD & METRICS (EXACTLY LIKE SCREENSHOT) */}
            <div className="pt-3 border-t border-slate-200 space-y-4">

              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">
                  4 · Processing
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Total Deduction: <strong className="text-indigo-600 font-mono">₹{totalCost.toFixed(2)}</strong> ({totalEstimatedPages} pages)
                </span>
              </div>

              {/* Start / Stop and Top Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {/* START PDF DOWNLOAD BUTTON */}
                <button
                  type="button"
                  onClick={handleStartProcessing}
                  disabled={isProcessing || !isBalanceSufficient}
                  className="py-3 px-3 rounded-xl font-black text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex flex-col items-center justify-center gap-0.5 text-xs sm:text-sm tracking-wide cursor-pointer"
                  title={activeExcelFile?.generatedPdfs?.[selectedFormat] ? "Direct download pre-generated PDF from server" : "Generate high-resolution PDF download"}
                >
                  <div className="flex items-center gap-1.5">
                    <span>▶</span>
                    <span>START PDF</span>
                  </div>
                </button>

                {/* STOP BUTTON */}
                <button
                  type="button"
                  onClick={handleStopProcessing}
                  disabled={!isProcessing}
                  className="py-3 px-3 rounded-xl font-bold text-rose-600 bg-white hover:bg-rose-50 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-1 text-xs sm:text-sm cursor-pointer"
                >
                  <span>■</span>
                  <span>Stop</span>
                </button>

                {/* ESTIMATED TIME */}
                <div className="p-3 bg-blue-950 text-white rounded-xl shadow-inner flex flex-col justify-between">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-blue-200">ESTIMATED TIME</span>
                  <span className="text-lg font-mono font-bold mt-1">
                    {processingStats.timeRemainingStr !== '—' && processingStats.timeRemainingStr !== '00:00' ? processingStats.timeRemainingStr : '—'}
                  </span>
                </div>

                {/* ESTIMATED PAGES */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">ESTIMATED PAGES</span>
                  <span className="text-lg font-mono font-bold text-slate-900 mt-1">
                    {totalEstimatedPages}
                  </span>
                </div>

                {/* RECORDS TO PRINT */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">RECORDS TO PRINT</span>
                  <span className="text-lg font-mono font-bold text-slate-900 mt-1">
                    {activeRecordsCount}
                  </span>
                </div>

                {/* PDFS TO CREATE */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">PDFS TO CREATE</span>
                  <span className="text-lg font-mono font-bold text-slate-900 mt-1">
                    1
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(isProcessing ? 5 : 0, Math.min(100, processingStats.progress))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span className="text-blue-700 font-bold">{processingStats.status}</span>
                  <span className="font-mono font-bold text-slate-700">{processingStats.progress}%</span>
                </div>
              </div>

              {/* 8 Stats Display Tiles (Exact 2x4 Layout from Screenshot) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {/* START TIME */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">START TIME</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.startTime || '—'}
                  </p>
                </div>

                {/* EST. FINISH / END TIME */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">EST. FINISH / END TIME</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.endTime || processingStats.estFinishTime || '—'}
                  </p>
                </div>

                {/* TIME ELAPSED */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TIME ELAPSED</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.timeElapsedStr}
                  </p>
                </div>

                {/* TIME REMAINING */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TIME REMAINING</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.timeRemainingStr}
                  </p>
                </div>

                {/* SPEED (VOTERS / SEC) */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">SPEED (VOTERS / SEC)</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.speedVotersPerSec}
                  </p>
                </div>

                {/* SPEED (PAGES / MIN) */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">SPEED (PAGES / MIN)</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.speedPagesPerMin}
                  </p>
                </div>

                {/* RECORDS DONE */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">RECORDS DONE</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.recordsDone > 0 ? `${processingStats.recordsDone} / ${activeRecordsCount}` : '—'}
                  </p>
                </div>

                {/* BOOTHS DONE */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">BOOTHS DONE</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {processingStats.boothsDone} / {processingStats.totalBooths}
                  </p>
                </div>

              </div>

              {/* Insufficient balance warning if needed */}
              {!isBalanceSufficient && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800 font-semibold">
                  <span>Insufficient balance (Need: ₹{totalCost.toFixed(2)}, Available: ₹{(userBalance || 0).toFixed(2)})</span>
                  <button
                    onClick={() => setIsTopupOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Recharge Balance
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <div>
              Auto-download triggers immediately upon completing 100% processing without page freezing.
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
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
              .catch(() => { });
          }
        }}
      />
    </>
  );
}

export default BatchSlipPrintManager;
