import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PrintModal from './PrintModal';
import A4PrintLayout from './A4PrintLayout';
import VoterSlip from './VoterSlip';
import VoterSlipOption3 from './VoterSlipOption3';

function SlipPrintManager({ isOpen, onClose, optionNumber, voterData }) {
  const [pagesCount, setPagesCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printState, setPrintState] = useState({ active: false, currentPage: 1 });
  
  const printLayoutRef = useRef(null);
  
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePrintGenerate = async () => {
    if (!pagesCount || pagesCount < 1) return;
    setIsGenerating(true);
    setProgress(0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 1; i <= pagesCount; i++) {
      setPrintState({ active: true, currentPage: i });
      await delay(500); 

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
        setProgress((i / pagesCount) * 100);
      }
    }

    try {
      await fetch('http://localhost:5000/api/prints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionType: `Option ${optionNumber}`,
          wardNo: voterData.wardNo || '-',
          partNo: voterData.partNo || '-',
          serialNo: voterData.serialNo || '1',
          voterName: voterData.voterName || '-',
          pagesCount: pagesCount
        })
      });
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
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -10, width: '1240px', height: '1754px', pointerEvents: 'none', opacity: 0, overflow: 'hidden' }}>
        {printState.active && (
          <A4PrintLayout 
            ref={printLayoutRef}
            baseData={voterData}
            pageNumber={printState.currentPage}
            totalPages={pagesCount}
            startSerialNo={parseInt(voterData.serialNo || 1) + ((printState.currentPage - 1) * 8)}
            SlipComponent={SlipComp}
          />
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
      />
    </>
  );
}

export default SlipPrintManager;
