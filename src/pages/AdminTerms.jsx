import React, { useState, useEffect } from 'react';

function AdminTerms() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        setText(data.termsOfServiceText || '');
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load terms of service:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termsOfServiceText: text })
      });
      if (res.ok) {
        alert('Terms of Service saved successfully!');
      } else {
        alert('Failed to save Terms of Service.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Terms of Service</h1>
        <p className="text-slate-500 mt-2">Update the text that appears on the public Terms of Service page.</p>
      </div>

      <div className="mb-6">
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          rows="15"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
          placeholder="Enter Terms of Service text here..."
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Terms of Service'}
        </button>
      </div>
    </div>
  );
}

export default AdminTerms;
