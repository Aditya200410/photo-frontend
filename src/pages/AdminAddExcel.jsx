import { Link } from 'react-router-dom';

function AdminAddExcel() {
  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-6 font-sans">
      <div className="w-full bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-5 sm:p-8 md:p-12 relative overflow-hidden">
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>

        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-4 shadow-inner">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
            Upload Excel Electoral Data
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 max-w-lg mx-auto">
            Choose the administrative category to upload and index electors data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Link 
            to="/admin/add-excel/assembly" 
            className="group relative flex flex-col items-center text-center p-6 sm:p-8 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 sm:mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">Assembly</h2>
            <p className="text-xs text-slate-500 mb-4">Constituency & booth voters</p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              Upload Files &rarr;
            </span>
          </Link>

          <Link 
            to="/admin/add-excel/nagar-nigam" 
            className="group relative flex flex-col items-center text-center p-6 sm:p-8 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 sm:mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">Nagar Nigam</h2>
            <p className="text-xs text-slate-500 mb-4">Urban local body & ward rosters</p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              Upload Files &rarr;
            </span>
          </Link>

          <Link 
            to="/admin/add-excel/panchayat" 
            className="group relative flex flex-col items-center text-center p-6 sm:p-8 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 sm:col-span-2 md:col-span-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 sm:mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 group-hover:text-amber-700 transition-colors">Gram Panchayat</h2>
            <p className="text-xs text-slate-500 mb-4">Village, tehsil & parishad lists</p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              Upload Files &rarr;
            </span>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            &larr; Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminAddExcel;
