import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { State, City } from 'country-state-city';
import FileEditModal from '../components/FileEditModal';

function AdminAddExcelPanchayat() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState(''); // Panchayat Samiti / City
  const [panchayat, setPanchayat] = useState('');
  const [village, setVillage] = useState('');
  const [ward, setWard] = useState('');
  const [booth, setBooth] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [editingFile, setEditingFile] = useState(null);

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/excel-files/panchayat`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to completely delete this file? This cannot be undone.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/excel-files/${fileId}`, {
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
      const defaultName = `Panchayat_Data_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
      setFileName(defaultName);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('Please select an Excel file first.');
    if (!fileName) return alert('Please enter a file name.');
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('excelFile', selectedFile);
    formData.append('fileName', fileName);
    formData.append('category', 'panchayat');
    if (state) formData.append('state', state);
    if (district) formData.append('district', district);
    if (city) formData.append('city', city);
    if (panchayat) formData.append('panchayat', panchayat);
    if (village) formData.append('village', village);
    if (ward) formData.append('ward', ward);
    if (booth) formData.append('booth', booth);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-excel`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('Excel file uploaded and all parameters (Wards, Booths, Samiti, Zilla Parishad) automatically extracted!');
        setSelectedFile(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchFiles();
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed due to network error.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative mb-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-purple-600"></div>
        <div className="p-6 md:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Panel
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Auto-Ward Splitting Enabled
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
                Upload Gram Panchayat Excel
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Upload a single Excel file for your city or block. The system will automatically extract all Wards (e.g. Ward 1, 2, 3, 4, 5...), Booths, Villages, Panchayat Names, Samiti No, and Zilla Parishad Name & No!
              </p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 shadow-inner shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>

          <div 
            className="border-2 border-dashed border-violet-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-violet-500 hover:bg-violet-50/40 transition-colors duration-300 group cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
          >
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx, .xls, .csv" />
             <div className="w-16 h-16 bg-slate-100 group-hover:bg-violet-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-violet-600 mb-3 transition-colors duration-300 shadow-inner">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <h3 className="text-base font-bold text-slate-700">
               {selectedFile ? selectedFile.name : 'Click to select or drop Panchayat Excel File'}
             </h3>
             <p className="text-slate-500 text-xs mt-1">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB selected` : 'Supports (.xlsx, .xls, .csv) with multiple wards in single file'}</p>
          </div>

          {selectedFile && (
            <div className="mt-6 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">File Name to Save As:</label>
                <input 
                  type="text" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" 
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span><strong>Auto-Detection Notice:</strong> The fields below are optional. If your Excel file already has columns for Zilla Parishad, Panchayat Samiti, Panchayat Name, Villages, Wards, and Booths, they will all be extracted automatically!</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">State (Optional):</label>
                  <select value={state} onChange={handleStateChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-500">
                    <option value="">Auto-Detect from Excel / All</option>
                    {allStates.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">District / Zilla Parishad (Optional):</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-500 disabled:opacity-50">
                    <option value="">Auto-Detect from Excel</option>
                    {allDistricts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">City / Panchayat Samiti (Optional):</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800" placeholder="e.g. Raisinghnagar" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Panchayat Name (Optional override):</label>
                  <input type="text" value={panchayat} onChange={(e) => setPanchayat(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800" placeholder="Auto-detected from file" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Village (Optional override):</label>
                  <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800" placeholder="Auto-detected from file" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Ward No (Optional override):</label>
                  <input type="text" value={ward} onChange={(e) => setWard(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800" placeholder="Auto-extracts all wards (e.g. 1 to 10)" />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 flex justify-end">
             <button 
               onClick={handleUpload}
               disabled={!selectedFile || isUploading}
               className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-sm ${!selectedFile || isUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-violet-500/25'}`}
             >
               {isUploading ? 'Extracting & Uploading...' : 'Upload & Process Excel'}
             </button>
          </div>
        </div>
      </div>

      {/* Previously Uploaded Files Section */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Previously Uploaded Panchayat Files</h3>
            <p className="text-xs text-slate-500 mt-0.5">All wards and parameters detected in each file are displayed below</p>
          </div>
          <span className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full">
            {files.length} Files
          </span>
        </div>

        {files.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No Panchayat data uploaded yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {files.map(file => (
              <li key={file.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:justify-between items-start lg:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 text-base">{file.fileName}</p>
                    {file.stats?.totalVoters && (
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {file.stats.totalVoters.toLocaleString()} Voters
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700">Zilla Parishad:</span>{' '}
                      {file.zillaParishad || file.district || 'N/A'}{' '}
                      {file.zillaParishadNo ? `(No. ${file.zillaParishadNo})` : ''}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Panchayat Samiti:</span>{' '}
                      {file.panchayatSamitis?.length > 2 
                        ? `${file.panchayatSamitis.length} Samitis (${file.panchayatSamitis.slice(0, 2).join(', ')}...)`
                        : (file.panchayatSamiti || file.city || 'N/A')}{' '}
                      {file.panchayatSamitiNo ? `(No. ${file.panchayatSamitiNo})` : ''}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Gram Panchayat:</span>{' '}
                      {file.panchayats?.length > 3 
                        ? `${file.panchayats.length} Panchayats (${file.panchayats.slice(0, 3).join(', ')}...)` 
                        : (file.panchayats?.length > 0 ? file.panchayats.join(', ') : (file.panchayat || 'N/A'))}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Villages:</span>{' '}
                      {file.villages?.length ? `${file.villages.length} Villages` : (file.village || 'N/A')}
                    </div>
                  </div>

                  {/* Wards and Booths details */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-700">Wards Extracted:</span>
                      {file.wards && file.wards.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            {file.wards.length > 15 
                              ? `${file.wards.length} Wards (${file.wards[0]} to ${file.wards[file.wards.length - 1]})`
                              : `${file.wards.length} Wards: ${file.wards.join(', ')}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Ward {file.ward || '1'}</span>
                      )}
                    </div>

                    {file.booths && file.booths.length > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        <span className="font-bold text-slate-700">Booths:</span>
                        <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {file.booths.length > 10 ? `${file.booths.length} Booths` : file.booths.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">Uploaded at: {new Date(file.timestamp).toLocaleString()}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button 
                    onClick={() => setEditingFile(file)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                  <a 
                    href={`${import.meta.env.VITE_API_URL}/api/uploads/${file.fileName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 px-3 py-1.5 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
                  >
                    Open
                  </a>
                  <a 
                    href={`${import.meta.env.VITE_API_URL}/api/download/${file.fileName}`}
                    className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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

      <Link to="/admin/add-excel" className="text-violet-600 font-medium hover:text-violet-800 flex items-center gap-2 transition-colors duration-200 text-sm">
        &larr; Back to Upload Options
      </Link>
    </div>
  );
}

export default AdminAddExcelPanchayat;
