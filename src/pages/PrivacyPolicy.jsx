import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PrivacyPolicy() {
  const [content, setContent] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.privacyPolicyText) {
          setContent(data.privacyPolicyText);
        } else {
          setContent('No privacy policy available.');
        }
      })
      .catch(err => {
        console.error('Failed to load privacy policy:', err);
        setContent('Failed to load privacy policy.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-slate lg:prose-lg text-slate-700 whitespace-pre-wrap">
          {content}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
