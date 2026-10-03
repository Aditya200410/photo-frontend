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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/excel-files/assembly`);
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
      const defaultName = `Assembly_Data_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
      setFileName(defaultName);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('Please select a file first.');
    if (!fileName) return alert('Please enter a file name.');
    
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-excel`, {
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
      alert('Upload failed due to network error.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative mb-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="p-8 md:p-12">
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
               {isUploading ? 'Uploading...' : 'Upload Data'}
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
                    href={`${import.meta.env.VITE_API_URL}/api/uploads/${file.fileName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Open
                  </a>
                  <a 
                    href={`${import.meta.env.VITE_API_URL}/api/download/${file.fileName}`}
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
