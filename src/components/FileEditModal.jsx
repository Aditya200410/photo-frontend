import { useState, useEffect } from 'react';
import { State, City } from 'country-state-city';

export default function FileEditModal({ isOpen, onClose, file, onSave }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  
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
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') {
      setDistricts(City.getCitiesOfState('IN', value));
      setFormData(prev => ({ ...prev, district: '' }));
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/excel-files/${file.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
        alert('Failed to update');
      }
    } catch (e) {
      alert('Error updating file');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Edit Metadata: {file.fileName}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">State</label>
            <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              <option value="">Select State</option>
              {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
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
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-white">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
