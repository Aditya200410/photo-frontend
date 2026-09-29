import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BatchA4PrintLayout from './BatchA4PrintLayout';
import VoterSlip from './VoterSlip';

function BatchSlipPrintManager({ isOpen, onClose, voters, assemblyName, boothNumber, wardNo }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printState, setPrintState] = useState({ active: false, currentPage: 1 });
  
  const printLayoutRef = useRef(null);
  
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const maxPages = voters ? Math.ceil(voters.length / 8) : 1;
  const [pagesCount, setPagesCount] = useState(maxPages);
  
  useEffect(() => {
    if (isOpen) {
      setPagesCount(maxPages);
    }
  }, [isOpen, maxPages]);

  const handlePrintGenerate = async () => {
    if (!voters || voters.length === 0 || !pagesCount || pagesCount < 1) return;
    setIsGenerating(true);
    setProgress(0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 1; i <= pagesCount; i++) {
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
        setProgress((i / pagesCount) * 100);
      }
    }

    try {
      await fetch('http://localhost:5000/api/prints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionType: 'Batch Slips',
          wardNo: wardNo || '-',
          partNo: boothNumber || '-',
          serialNo: 'ALL',
          voterName: 'Batch Print',
          pagesCount: pagesCount
        })
      });
    } catch (err) {
      console.error('Failed to log print to backend:', err);
    }

    pdf.save(`batch-slips-${pagesCount}-pages.pdf`);
    
    setIsGenerating(false);
    setPrintState({ active: false, currentPage: 1 });
    onClose();
  };

  if (!isOpen) return null;

  const currentSlipsData = [];
  if (printState.active) {
    const startIndex = (printState.currentPage - 1) * 8;
    const endIndex = startIndex + 8;
    const pageVoters = voters.slice(startIndex, endIndex);
    
    pageVoters.forEach(voter => {
      currentSlipsData.push({
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
        topImage: null, // No image for batch by default as per request
      });
    });
  }

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -10, width: '1240px', height: '1754px', pointerEvents: 'none', opacity: 0, overflow: 'hidden' }}>
        {printState.active && (
          <BatchA4PrintLayout 
            ref={printLayoutRef}
            slipsData={currentSlipsData}
            pageNumber={printState.currentPage}
            totalPages={pagesCount}
            SlipComponent={VoterSlip}
            headerData={{
              title: assemblyName || 'Voters Directory',
              wardNo: wardNo || '-',
              partNo: boothNumber || '-'
            }}
          />
        )}
      </div>

      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Batch Generating PDF</h2>
          
          {isGenerating ? (
            <div className="space-y-6">
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
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Pages (8 entries per page)</label>
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
                <p className="text-sm text-slate-500 mt-2">Maximum available pages: {maxPages} ({voters.length} total entries)</p>
                
                {pagesCount === 0 || pagesCount === '' || pagesCount < 1 ? (
                   <p className="text-sm text-red-500 mt-2 font-medium">Please enter a valid number of pages (minimum 1).</p>
                ) : null}
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrintGenerate}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!pagesCount || pagesCount < 1}
                >
                  Start Print
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BatchSlipPrintManager;
