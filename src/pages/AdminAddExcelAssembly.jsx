import API_BASE_URL from '../config';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { State, City } from 'country-state-city';
import FileEditModal from '../components/FileEditModal';

function AdminAddExcelAssembly() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [assembly, setAssembly] = useState('');
  const [booth, setBooth] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  const handleGeneratePdfs = async (fileId) => {
    try {
      setGeneratingId(fileId);
      const res = await fetch(`${API_BASE_URL}/api/excel-files/${fileId}/generate-pdfs`, {
        method: 'POST'
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('Non-JSON response from server:', text);
        alert(`Server error (${res.status}): The server returned an HTML error or timed out during PDF generation. Please check server logs or restart the backend.`);
        return;
      }

      if (res.ok && data.success) {
        if (data.generatedPdfs) {
          setFiles(prev => prev.map(f => f.id === fileId ? { ...f, generatedPdfs: data.generatedPdfs } : f));
        }
        alert('PDF slips generated successfully across all formats!');
        fetchFiles();
      } else {
        alert(data.error || 'Failed to generate PDFs.');
      }
    } catch (err) {
      console.error('Error generating PDFs:', err);
      alert('Error connecting to server for PDF generation: ' + (err.message || ''));
    } finally {
      setGeneratingId(null);
    }
  };

  useEffect(() => {
    setAllStates(State.getStatesOfCountry('IN'));
  }, []);

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setState(selectedState);
    setDistrict('');
    
    const selectedStateObj = allStates.find(s => s.name === selectedState);
    if (selectedStateObj) {
      setAllDistricts(City.getCitiesOfState('IN', selectedStateObj.isoCode));
    } else {
      setAllDistricts([]);
    }
  };



  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/excel-files/assembly`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to completely delete this file? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/excel-files/${fileId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchFiles();
      } else {
        alert('Failed to delete file.');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Delete failed due to network error.');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const defaultName = `Assembly_Data_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
      setFileName(defaultName);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('Please select a file first.');
    if (!fileName) return alert('Please enter a file name.');

    // Check file size (500MB limit)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      return alert(`Selected file (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 500MB limit. Please select a file under 500MB.`);
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('excelFile', selectedFile);
    formData.append('fileName', fileName);
    formData.append('category', 'assembly');
    if (state) formData.append('state', state);
    if (district) formData.append('district', district);
    if (assembly) formData.append('assembly', assembly);
    if (booth) formData.append('booth', booth);
    


    try {
      const res = await fetch(`${API_BASE_URL}/api/upload-excel`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('File uploaded successfully!');
        setSelectedFile(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchFiles();
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed due to network error. Large files (up to 500MB) may take several minutes to upload and process.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative mb-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="p-4 sm:p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Upload Assembly Data</h2>
              <p className="text-slate-500 mt-2">Import your assembly data via Excel</p>
            </div>
          </div>



          <div 
            className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-colors duration-300 group cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
          >
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls, .csv" />
             <div className="w-20 h-20 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 mb-4 transition-colors duration-300">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <h3 className="text-lg font-semibold text-slate-700">
               {selectedFile ? selectedFile.name : 'Click to browse your computer'}
             </h3>
             <p className="text-slate-500 mt-2 mb-2">{selectedFile ? 'File selected' : '(.xlsx, .csv)'}</p>
          </div>

          {selectedFile && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">File Name to Save As:</label>
                <input 
                  type="text" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">State:</label>
                  <select value={state} onChange={handleStateChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200">
                    <option value="">Select State</option>
                    {allStates.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">District:</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Select District</option>
                    {allDistricts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Assembly:</label>
                  <input type="text" value={assembly} onChange={(e) => setAssembly(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="e.g., Lucknow Central" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Booth No:</label>
                  <input type="text" value={booth} onChange={(e) => setBooth(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="e.g., 14" />
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 flex justify-end">
             <button 
               onClick={handleUpload}
               disabled={!selectedFile || isUploading}
               className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 ${!selectedFile || isUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'}`}
             >
               {isUploading ? 'Uploading & Processing (up to 500MB, please wait)...' : 'Upload Data'}
             </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Previously Uploaded Files</h3>
        {files.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
            No data available.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {files.map(file => (
              <li key={file.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-lg">{file.fileName}</p>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                    <div><span className="font-semibold text-slate-700">State:</span> {file.state || 'N/A'}</div>
                    <div><span className="font-semibold text-slate-700">District:</span> {file.district || 'N/A'}</div>
                    <div><span className="font-semibold text-slate-700">Assembly:</span> {file.assembly || 'N/A'}</div>
                    <div><span className="font-semibold text-slate-700">Booth:</span> {file.booth || 'N/A'}</div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Uploaded at: {new Date(file.timestamp).toLocaleString()}</p>
                  
                  {file.stats && (
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <h4 className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Data Analysis</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-medium">Total Voters</span>
                          <span className="text-emerald-700 font-bold text-sm">{file.stats.totalVoters?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-medium">Gender Split</span>
                          <span className="text-slate-700 font-semibold">{file.stats.maleVoters?.toLocaleString()} M / {file.stats.femaleVoters?.toLocaleString()} F</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-medium">Avg Age</span>
                          <span className="text-slate-700 font-semibold">{file.stats.averageAge} yrs</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-medium">Youth (18-25)</span>
                          <span className="text-slate-700 font-semibold">{file.stats.ageBrackets?.youth?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ready Voter Slip PDFs Status & Download Section */}
                  <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                          Ready Voter Slip PDFs:
                        </span>
                        {file.generatedPdfs && Object.keys(file.generatedPdfs).length > 0 ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            ✓ Generated ({Object.keys(file.generatedPdfs).length} formats)
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                            Not Generated
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleGeneratePdfs(file.id)}
                        disabled={generatingId === file.id}
                        className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {generatingId === file.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Generating (low MB)...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            <span>{file.generatedPdfs && Object.keys(file.generatedPdfs).length > 0 ? 'Regenerate PDFs' : 'Generate PDFs Now'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {file.generatedPdfs && Object.keys(file.generatedPdfs).length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {[
                          { id: 'simple8', legacyFallbackId: 'symbol', label: 'Without Header (8/page)', category: 'withoutHeader' },
                          { id: 'simple10', legacyFallbackId: null, label: 'Without Header (10/page)', category: 'withoutHeader' },
                          { id: 'simple12', legacyFallbackId: null, label: 'Without Header (12/page)', category: 'withoutHeader' },
                          { id: 'header6', legacyFallbackId: 'header', label: 'With Header (6/page)', category: 'withHeader' },
                          { id: 'header8', legacyFallbackId: 'symbol', label: 'With Header (8/page)', category: 'withHeader' },
                          { id: 'alphabetical', legacyFallbackId: 'alphabetical', label: 'Alphabetical List (40/page)', category: 'alphabetical' }
                        ].map(fmt => {
                          const item = file.generatedPdfs[fmt.id] || (fmt.legacyFallbackId ? file.generatedPdfs[fmt.legacyFallbackId] : null);
                          if (!item) return null;
                          return (
                            <a
                              key={fmt.id}
                              href={`${API_BASE_URL}/api/download/print_slips/${item.fileName}`}
                              download
                              className="p-2 bg-white rounded-lg transition-all flex items-center justify-between group shadow-2xs border hover:bg-blue-50 border-slate-200 hover:border-blue-300"
                              title={`Download ${fmt.label} (${item.pages} pages, ${item.sizeStr})`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-[11px] font-bold text-slate-800 truncate group-hover:text-blue-700 flex items-center gap-1">
                                  <span>{fmt.label}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold">{item.pages} pages • <strong className="text-emerald-700 font-bold">{item.sizeStr}</strong></div>
                              </div>
                              <span className="w-6 h-6 rounded-md bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold hidden xl:inline-block">Assembly</span>
                  <button 
                    onClick={() => setEditingFile(file)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                  <a 
                    href={`${API_BASE_URL}/api/uploads/${file.fileName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Open
                  </a>
                  <a 
                    href={`${API_BASE_URL}/api/download/${file.fileName}`}
                    className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <FileEditModal 
        isOpen={!!editingFile} 
        file={editingFile} 
        onClose={() => setEditingFile(null)} 
        onSave={() => { fetchFiles(); setEditingFile(null); }} 
      />

      <Link to="/admin/add-excel" className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-2 transition-colors duration-200">
        &larr; Back to Upload Options
      </Link>
    </div>
  );
}

export default AdminAddExcelAssembly;
