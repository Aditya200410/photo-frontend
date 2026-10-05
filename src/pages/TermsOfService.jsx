import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function TermsOfService() {
  const [content, setContent] = useState('Loading...');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.termsOfServiceText) {
          setContent(data.termsOfServiceText);
        } else {
          setContent('No terms of service available.');
        }
      })
      .catch(err => {
        console.error('Failed to load terms of service:', err);
        setContent('Failed to load terms of service.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
        <div className="prose prose-slate lg:prose-lg text-slate-700 whitespace-pre-wrap">
          {content}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TermsOfService;
