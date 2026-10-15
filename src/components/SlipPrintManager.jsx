import API_BASE_URL from '../config';
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import PrintModal from './PrintModal';
import A4PrintLayout from './A4PrintLayout';
import VoterSlip from './VoterSlip';
import VoterSlipOption3 from './VoterSlipOption3';

import { printViaWindowPrint, generatePdfFromHtml, logPrintTransaction } from '../utils/printService';

function SlipPrintManager({ isOpen, onClose, optionNumber, voterData }) {
  const [pagesCount, setPagesCount] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localVoterData, setLocalVoterData] = useState(voterData);
  
  React.useEffect(() => {
    setLocalVoterData(voterData);
  }, [voterData]);

  React.useEffect(() => {
    if (isOpen && optionNumber === 1 && cardsPerPage > 8) {
      setCardsPerPage(8);
    }
  }, [isOpen, optionNumber, cardsPerPage]);

  const handlePrintGenerate = async (mode = 'print') => {
    const isDownloadOnly = mode === 'download';
    const numPages = Number(pagesCount) || 1;
    if (numPages < 1) return;

    setIsGenerating(true);
    setProgress(0);

    const ReactDOMServer = await import('react-dom/server');
    const SlipComp = optionNumber === 3 ? VoterSlipOption3 : VoterSlip;

    const pagesHtml = [];
    for (let i = 0; i < numPages; i++) {
      pagesHtml.push(
        ReactDOMServer.renderToString(
          <A4PrintLayout 
            baseData={localVoterData}
            pageNumber={i + 1}
            totalPages={numPages}
            startSerialNo={parseInt(voterData.serialNo || 1, 10) + (i * cardsPerPage)}
            cardsPerPage={cardsPerPage}
            SlipComponent={SlipComp}
          />
        )
      );
    }

    const hasImage = Boolean((optionNumber === 1 && voterData?.topImage) || (optionNumber === 3 && voterData?.symbolImage));
    const totalSlips = numPages * cardsPerPage;

    if (isDownloadOnly) {
      // Direct PDF download with optimized html2canvas & jsPDF
      await generatePdfFromHtml({
        pagesHtml,
        filename: `voter-slips-${numPages}-pages.pdf`,
        onProgress: (p) => setProgress(p),
        scale: 1.4,
        quality: 0.85
      });
    } else {
      // Instant window.print popup
      await printViaWindowPrint({
        htmlContent: pagesHtml.join(''),
        title: `voter-slips-${numPages}-pages`
      });
    }

    // Record transaction & deduct credits
    await logPrintTransaction({
      optionType: `Option ${optionNumber}`,
      wardNo: voterData.wardNo || '-',
      partNo: voterData.partNo || '-',
      serialNo: voterData.serialNo || '1',
      voterName: voterData.voterName || '-',
      pagesCount: numPages,
      cardsPerPage: cardsPerPage,
      slipsCount: totalSlips,
      hasImage: hasImage
    });

    setIsGenerating(false);
    onClose();
  };

  if (!isOpen) return null;

  const SlipComp = optionNumber === 3 ? VoterSlipOption3 : VoterSlip;

  return (
    <>
      <PrintModal 
        isOpen={isOpen}
        onClose={onClose}
        onGenerate={handlePrintGenerate}
        isGenerating={isGenerating}
        progress={progress}
        pagesCount={pagesCount}
        setPagesCount={setPagesCount}
        optionNumber={optionNumber}
        voterData={localVoterData}
        setVoterData={setLocalVoterData}
        cardsPerPage={cardsPerPage}
        setCardsPerPage={setCardsPerPage}
        previewNode={
          <A4PrintLayout 
            baseData={localVoterData}
            pageNumber={1}
            totalPages={pagesCount}
            startSerialNo={parseInt(voterData.serialNo || 1)}
            cardsPerPage={cardsPerPage}
            SlipComponent={SlipComp}
          />
        }
      />
    </>
  );
}

export default SlipPrintManager;
