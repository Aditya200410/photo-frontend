import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import PrintModal from './PrintModal';
import A4PrintLayout from './A4PrintLayout';
import VoterSlip from './VoterSlip';
import VoterSlipOption3 from './VoterSlipOption3';

function SlipPrintManager({ isOpen, onClose, optionNumber, voterData }) {
  const [pagesCount, setPagesCount] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printState, setPrintState] = useState({ active: false, currentPage: 1 });
  const [localVoterData, setLocalVoterData] = useState(voterData);
  
  React.useEffect(() => {
    setLocalVoterData(voterData);
  }, [voterData]);
  
  const printLayoutRef = useRef([]);
  
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePrintGenerate = async () => {
    if (!pagesCount || pagesCount < 1) return;
    setIsGenerating(true);
    setProgress(0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    setPrintState({ active: true });
    await delay(100); 

    for (let i = 0; i < pagesCount; i++) {
      const pageEl = printLayoutRef.current[i];
      if (pageEl) {
        const canvas = await html2canvas(pageEl, {
          scale: 1.5,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 1240,
          windowHeight: 1754,
          width: 1240,
          height: 1754
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.75);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        setProgress(((i + 1) / pagesCount) * 100);
      }
    }

    const hasImage = Boolean((optionNumber === 1 && voterData?.topImage) || (optionNumber === 3 && voterData?.symbolImage));
    const totalSlips = pagesCount * cardsPerPage;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/prints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token') || 'DUMMY'}` },
        body: JSON.stringify({
          optionType: `Option ${optionNumber}`,
          wardNo: voterData.wardNo || '-',
          partNo: voterData.partNo || '-',
          serialNo: voterData.serialNo || '1',
          voterName: voterData.voterName || '-',
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

    pdf.save(`voter-slip-${optionNumber}-${pagesCount}-pages.pdf`);
    
    setIsGenerating(false);
    setPrintState({ active: false, currentPage: 1 });
    onClose();
  };

  if (!isOpen) return null;

  const SlipComp = optionNumber === 3 ? VoterSlipOption3 : VoterSlip;

  return (
    <>
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -10, width: '1240px', pointerEvents: 'none', opacity: 0, overflow: 'hidden' }}>
        {printState.active && (
          Array.from({ length: pagesCount }).map((_, i) => (
            <A4PrintLayout 
              key={i}
              ref={el => {
                if (!printLayoutRef.current) printLayoutRef.current = [];
                printLayoutRef.current[i] = el;
              }}
              baseData={localVoterData}
              pageNumber={i + 1}
              totalPages={pagesCount}
              startSerialNo={parseInt(voterData.serialNo || 1) + (i * cardsPerPage)}
              cardsPerPage={cardsPerPage}
              SlipComponent={SlipComp}
            />
          ))
        )}
      </div>

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
