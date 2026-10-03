import { useState, useEffect, useRef } from 'react';
import { State, City } from 'country-state-city';

export default function FileEditModal({ isOpen, onClose, file, onSave }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    state: '', district: '', city: '', ward: '', booth: '', assembly: '', panchayat: '', village: ''
  });

  useEffect(() => {
    setStates(State.getStatesOfCountry('IN'));
  }, []);

  useEffect(() => {
    if (file) {
      setFormData({
        state: file.state || '',
        district: file.district || '',
        city: file.city || '',
        ward: file.ward || '',
        booth: file.booth || '',
        assembly: file.assembly || '',
        panchayat: file.panchayat || '',
        village: file.village || ''
      });
      if (file.state) setDistricts(City.getCitiesOfState('IN', file.state));
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') {
      const selectedStateObj = states.find(s => s.name === value);
      if (selectedStateObj) {
        setDistricts(City.getCitiesOfState('IN', selectedStateObj.isoCode));
      } else {
        setDistricts([]);
      }
      setFormData(prev => ({ ...prev, district: '' }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (selectedFile) {
        data.append('excelFile', selectedFile);
        // The backend expects fileName if we want a custom name, otherwise it uses originalName
        // If we want to preserve the old pattern, we can send fileName
        data.append('fileName', file.fileName);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/excel-files/${file.id}`, {
        method: 'PUT',
        body: data // FormData handles multipart/form-data implicitly
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
        alert('Failed to update');
      }
    } catch (e) {
      alert('Error updating file');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Edit Metadata: {file.fileName}</h3>
        </div>
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 mb-2">
            <label className="text-sm font-semibold text-slate-700 block mb-1">Replace File (Optional)</label>
            <div className="flex items-center gap-3">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 rounded-xl" accept=".xlsx, .xls, .csv" />
            </div>
            {selectedFile && <p className="text-xs text-emerald-600 mt-1 font-medium">New file selected: {selectedFile.name}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">State</label>
            <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              <option value="">Select State</option>
              {states.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">District</label>
            <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.state} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 disabled:opacity-50">
              <option value="">Select District</option>
              {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          {file.category === 'nagar-nigam' && (
            <>
              <div><label className="text-sm font-semibold text-slate-700 block mb-1">City</label><input name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
              <div><label className="text-sm font-semibold text-slate-700 block mb-1">Ward</label><input name="ward" value={formData.ward} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            </>
          )}
          {file.category === 'panchayat' && (
            <>
              <div><label className="text-sm font-semibold text-slate-700 block mb-1">Panchayat</label><input name="panchayat" value={formData.panchayat} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
              <div><label className="text-sm font-semibold text-slate-700 block mb-1">Village</label><input name="village" value={formData.village} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
              <div><label className="text-sm font-semibold text-slate-700 block mb-1">Ward</label><input name="ward" value={formData.ward} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            </>
          )}
          {file.category === 'assembly' && (
            <>
              <div><label className="text-sm font-semibold text-slate-700 block mb-1">Assembly</label><input name="assembly" value={formData.assembly} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
            </>
          )}
          <div><label className="text-sm font-semibold text-slate-700 block mb-1">Booth</label><input name="booth" value={formData.booth} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" /></div>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} disabled={isUpdating} className="px-6 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={isUpdating} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-white disabled:opacity-50">
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

