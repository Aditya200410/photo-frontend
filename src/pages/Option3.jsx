import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import VoterSlipOption3 from '../components/VoterSlipOption3';
import PrintModal from '../components/PrintModal';
import A4PrintLayout from '../components/A4PrintLayout';

function Option3() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    wardNo: '5',
    partNo: '1',
    serialNo: '1',
    idNumber: 'ALC1781194',
    voterName: 'शाहिद परवेज़ अंसारी',
    fatherHusbandName: 'इस्लामुद्दीन अंसारी',
    houseNo: '0',
    gender: 'पुरुष',
    age: '26',
    pollingStation: '28 - राजकीय उच्च माध्यमिक विद्यालय दायीं ओर का कमरा हाथीखेड़ा अजमेर',
    symbolImage: null,
    symbolName: 'कमल का फूल'
  });

  useEffect(() => {
    if (location.state && location.state.voterData) {
      setFormData(prev => ({ ...prev, ...location.state.voterData }));
    }
  }, [location]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagesCount, setPagesCount] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  
  const [printState, setPrintState] = useState({
    active: false,
    currentPage: 1
  });

  const slipRef = useRef(null);
  const printLayoutRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, symbolImage: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadSingle = async () => {
    if (slipRef.current) {
      try {
        const canvas = await html2canvas(slipRef.current, { 
          scale: 3, 
          backgroundColor: '#ffffff',
          logging: false
        });
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `voter-slip-${formData.idNumber || 'doc'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generating image:', err);
      }
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handlePrintGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 1; i <= pagesCount; i++) {
      // Set the state so the hidden layout renders the current page
      setPrintState({ active: true, currentPage: i });
      
      // Wait for React to re-render the layout
      await delay(500); 

      if (printLayoutRef.current) {
        const canvas = await html2canvas(printLayoutRef.current, {
          scale: 1.5, // Reduced scale for file size optimization
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 1240,
          windowHeight: 1754,
          width: 1240,
          height: 1754
        });

        // Use JPEG format with quality 0.75 for huge size reduction
        const imgData = canvas.toDataURL('image/jpeg', 0.75);
        if (i > 1) {
          pdf.addPage();
        }
        // Add image as JPEG and use 'FAST' compression in jsPDF
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        
        setProgress((i / pagesCount) * 100);
      }
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/prints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken') || 'DUMMY'}` },
        body: JSON.stringify({
          optionType: 'Option 3',
          wardNo: formData.wardNo,
          partNo: formData.partNo,
          serialNo: formData.serialNo,
          voterName: formData.voterName,
          pagesCount: pagesCount
        })
      });
    } catch (err) {
      console.error('Failed to log print to backend:', err);
    }

    pdf.save(`voter-list-${pagesCount}-pages.pdf`);
    
    // Cleanup
    setIsGenerating(false);
    setIsModalOpen(false);
    setPrintState({ active: false, currentPage: 1 });
  };

  return (
    <>
      {/* Hidden Print Layout (Outside main container to avoid overflow-x-hidden clipping) */}
      {printState.active && (
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -10, width: '1240px', height: '1754px', pointerEvents: 'none' }}>
          <A4PrintLayout 
            SlipComponent={VoterSlipOption3}
            ref={printLayoutRef}
            baseData={formData}
            pageNumber={printState.currentPage}
            totalPages={pagesCount}
            startSerialNo={parseInt(formData.serialNo || 1) + ((printState.currentPage - 1) * cardsPerPage)}
            cardsPerPage={cardsPerPage}
          />
        </div>
      )}

      {/* Print Modal - Placed outside relative wrappers to fix mobile fixed positioning */}
      <PrintModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handlePrintGenerate}
        isGenerating={isGenerating}
        progress={progress}
        pagesCount={pagesCount}
        setPagesCount={setPagesCount}
        cardsPerPage={cardsPerPage}
        setCardsPerPage={setCardsPerPage}
      />

      {/* Enlarge Preview Modal */}
      {isPreviewExpanded && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col z-[60]">
          <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Full Size Preview</h2>
            <button onClick={() => setIsPreviewExpanded(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-10">
            <div className="min-w-[700px] flex justify-center items-start pb-20">
              <div className="bg-slate-200/90 p-4 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/40">
                <VoterSlipOption3 data={formData} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 py-10 px-4 md:px-10 text-white font-sans overflow-x-hidden relative">
      <div className="max-w-7xl mx-auto">
        <Link to="/photo" className="inline-flex items-center text-indigo-300 hover:text-white mb-8 font-medium transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Home
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">
            Voter Slip Generator
          </h1>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 md:mt-0 bg-white text-indigo-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print Multi-Page PDF
          </button>
        </div>

        <p className="text-slate-400 mb-10 text-lg">Fill in the details to dynamically generate and download a voter slip.</p>

        <div className="flex flex-col xl:flex-row gap-10">
          {/* Form Section */}
          <div className="xl:w-[45%] bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-8 text-white flex items-center">
              <svg className="w-6 h-6 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Enter Details (Hindi)
            </h2>
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">चुनाव चिन्ह (Symbol Image)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 focus:outline-none transition-all cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">चिन्ह का नाम (Symbol Name)</label>
                  <input type="text" name="symbolName" value={formData.symbolName} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">वार्ड न० (Ward No)</label>
                  <input type="text" name="wardNo" value={formData.wardNo} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">भाग न० (Part No)</label>
                  <input type="text" name="partNo" value={formData.partNo} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">क्रम संख्या (Serial No)</label>
                  <input type="text" name="serialNo" value={formData.serialNo} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">ID Number</label>
                  <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">मतदाता का नाम (Voter Name)</label>
                <input type="text" name="voterName" value={formData.voterName} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">पिता / पति का नाम (Father/Husband Name)</label>
                <input type="text" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">मकान न० (House)</label>
                  <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">लिंग (Gender)</label>
                  <input type="text" name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">आयु (Age)</label>
                  <input type="text" name="age" value={formData.age} onChange={handleChange} className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">मतदान केंद्र (Polling Station)</label>
                <textarea name="pollingStation" value={formData.pollingStation} onChange={handleChange} rows="2" className="w-full rounded-xl bg-slate-800/50 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none" />
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="xl:w-[55%] flex flex-col items-center justify-start">
            <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  Live Preview
                </h2>
                <button 
                  onClick={() => setIsPreviewExpanded(true)}
                  className="bg-white/10 hover:bg-white/20 text-indigo-200 p-2 rounded-xl transition-all flex items-center text-sm font-medium border border-white/10"
                  title="Enlarge Preview"
                >
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                  Enlarge
                </button>
              </div>
              
              <div className="bg-slate-200/90 p-4 md:p-8 rounded-2xl w-full flex justify-center overflow-auto shadow-inner mb-8 border border-white/40">
                <div style={{ zoom: 'min(1, calc((100vw - 4rem) / 650))' }}>
                  <VoterSlipOption3 data={formData} ref={slipRef} />
                </div>
              </div>

              <button 
                onClick={handleDownloadSingle}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] text-lg flex justify-center items-center group"
              >
                <svg className="w-6 h-6 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Single Image
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default Option3;
