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

    const ReactDOMServer = await import('react-dom/server');
    const SlipComp = optionNumber === 3 ? VoterSlipOption3 : VoterSlip;

    let htmlContent = `
      <html>
        <head>
          <title>Voter Slip - Option ${optionNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: white;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
    `;

    for (let i = 0; i < pagesCount; i++) {
      const pageHtml = ReactDOMServer.renderToString(
        <A4PrintLayout 
          baseData={localVoterData}
          pageNumber={i + 1}
          totalPages={pagesCount}
          startSerialNo={parseInt(voterData.serialNo || 1) + (i * cardsPerPage)}
          cardsPerPage={cardsPerPage}
          SlipComponent={SlipComp}
        />
      );
      htmlContent += `<div class="page-break">${pageHtml}</div>`;
      setProgress(((i + 1) / pagesCount) * 100);
      if (i % 50 === 0) await delay(5);
    }

    htmlContent += `
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      alert("Please allow popups to use the native print feature!");
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
