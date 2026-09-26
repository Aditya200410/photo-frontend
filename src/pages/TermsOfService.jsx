import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
        <div className="prose prose-slate lg:prose-lg text-slate-700">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing or using the Voter Directory System, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. Use License</h2>
          <p className="mb-4">Permission is granted to temporarily use the materials (information or software) on Voter Directory System for personal, non-commercial transitory viewing only.</p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Disclaimer</h2>
          <p className="mb-4">The materials on the Voter Directory System are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TermsOfService;
