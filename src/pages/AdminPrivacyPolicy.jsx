import React, { useState, useEffect } from 'react';

function AdminPrivacyPolicy() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        setText(data.privacyPolicyText || '');
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load privacy policy:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacyPolicyText: text })
      });
      if (res.ok) {
        alert('Privacy Policy saved successfully!');
      } else {
        alert('Failed to save Privacy Policy.');
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
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Privacy Policy</h1>
        <p className="text-slate-500 mt-2">Update the text that appears on the public Privacy Policy page.</p>
      </div>

      <div className="mb-6">
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          rows="15"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="Enter Privacy Policy text here..."
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Privacy Policy'}
        </button>
      </div>
    </div>
  );
}

export default AdminPrivacyPolicy;
