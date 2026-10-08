import React, { useState, useEffect } from 'react';

function AdminSettings() {
  const [settings, setSettings] = useState({
    assemblyImage: '',
    nagarNigamImage: '',
    gramPanchayatImage: '',
    qrCodeImage: '',
    upiId: '',
    rateWithoutImage: 0.10,
    rateWithImage: 0.12
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  const handleImageUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', key);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings/upload-image`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setSettings(prev => ({ ...prev, [key]: data.imageUrl }));
        alert(`${key} updated successfully!`);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during upload');
    }
  };

  const saveUrlSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Site Settings</h1>
        
        <div className="space-y-8">
          {/* Assembly Image */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Assembly Image</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2">
                <img src={settings.assemblyImage} alt="Assembly" className="w-full h-48 object-cover rounded-xl border border-slate-300" />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Upload New Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'assemblyImage')}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Or enter Image URL</label>
                  <input 
                    type="text" 
                    value={settings.assemblyImage} 
                    onChange={(e) => setSettings({...settings, assemblyImage: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nagar Nigam Image */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Nagar Nigam Image</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2">
                <img src={settings.nagarNigamImage} alt="Nagar Nigam" className="w-full h-48 object-cover rounded-xl border border-slate-300" />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Upload New Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'nagarNigamImage')}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Or enter Image URL</label>
                  <input 
                    type="text" 
                    value={settings.nagarNigamImage} 
                    onChange={(e) => setSettings({...settings, nagarNigamImage: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gram Panchayat Image */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Gram Panchayat Image</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2">
                <img src={settings.gramPanchayatImage} alt="Gram Panchayat" className="w-full h-48 object-cover rounded-xl border border-slate-300" />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Upload New Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'gramPanchayatImage')}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Or enter Image URL</label>
                  <input 
                    type="text" 
                    value={settings.gramPanchayatImage} 
                    onChange={(e) => setSettings({...settings, gramPanchayatImage: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* UPI Payment & QR Code Settings */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-700 mb-2">UPI Recharge QR & Payment Settings</h2>
            <p className="text-xs text-slate-500 mb-4">Set the UPI ID and QR code shown to users when they request a credit recharge or payment.</p>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2 flex flex-col items-center p-4 bg-white rounded-xl border border-slate-200">
                <img src={settings.qrCodeImage || 'https://via.placeholder.com/200?text=Scan+QR+Code'} alt="UPI QR Code" className="w-48 h-48 object-contain rounded-lg border border-slate-200" />
                <span className="text-xs text-slate-400 mt-2">Active QR Code Preview</span>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">UPI ID (e.g. mobile@upi or name@bank)</label>
                  <input 
                    type="text" 
                    value={settings.upiId || ''} 
                    onChange={(e) => setSettings({...settings, upiId: e.target.value})}
                    placeholder="e.g. yourname@upi"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-sm outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Upload Custom QR Code Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'qrCodeImage')}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Slip Printing Rates Settings */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-700 mb-2">Slip Printing Rates</h2>
            <p className="text-xs text-slate-500 mb-4">Set the cost per page (in Rupees) for printing slips.</p>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Rate without Photo (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={settings.rateWithoutImage ?? 0.10} 
                  onChange={(e) => setSettings({...settings, rateWithoutImage: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none bg-white"
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Rate with Photo (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={settings.rateWithImage ?? 0.12} 
                  onChange={(e) => setSettings({...settings, rateWithImage: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none bg-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button 
              onClick={saveUrlSettings}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-200"
            >
              Save URL Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
