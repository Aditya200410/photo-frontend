import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-slate lg:prose-lg text-slate-700">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information to provide better services to our users. This includes administrative election data, voter rolls, and usage logs necessary for generating accurate directories.</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Information</h2>
          <p className="mb-4">The information collected is strictly used for electoral management, slip generation, and directory structuring across administrative levels. We do not sell or share personal information with third parties.</p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">We implement industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of data.</p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">4. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us through the Support page.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
