import { Link } from 'react-router-dom';

function AdminPrintData() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-10 md:p-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            View Print Data
          </h1>
          <p className="text-lg text-slate-500">
            Select the category to view print records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/admin/print-data/assembly" 
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Assembly</h2>
          </Link>

          <Link 
            to="/admin/print-data/nagar-nigam" 
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Nagar Nigam</h2>
          </Link>

          <Link 
            to="/admin/print-data/panchayat" 
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-200 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Gram Panchayat</h2>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link to="/admin" className="text-emerald-600 font-medium hover:text-emerald-800 flex items-center justify-center gap-2 transition-colors duration-200 w-full">
            &larr; Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminPrintData;
