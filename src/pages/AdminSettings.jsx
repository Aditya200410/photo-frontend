import React, { useState, useEffect } from 'react';

function AdminSettings() {
  const [settings, setSettings] = useState({
    assemblyImage: '',
    nagarNigamImage: '',
    gramPanchayatImage: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
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
      const res = await fetch('http://localhost:5000/api/settings/upload-image', {
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
      const res = await fetch('http://localhost:5000/api/settings', {
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
