import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import PhotoAssembly from './PhotoAssembly';
import PhotoNagarNigam from './PhotoNagarNigam';
import PhotoGramPanchayat from './PhotoGramPanchayat';

function PhotoIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState(searchParams.get('view') || null);
  const componentRef = useRef(null);

  // Sync state with URL params if they change
  useEffect(() => {
    const view = searchParams.get('view');
    if (view && view !== activeComponent) {
      setActiveComponent(view);
      setTimeout(() => {
        if (componentRef.current) {
          componentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams]);

  const handleSelectComponent = (comp) => {
    setActiveComponent(comp);
    setSearchParams({ view: comp });
    setTimeout(() => {
      if (componentRef.current) {
        componentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      {/* Main Options */}
      <section id="directories" className="max-w-7xl mx-auto px-6 py-12 relative z-20 w-full">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
          
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Select Region Type</h2>
            <p className="text-slate-500 mt-4 text-lg">Choose the administrative level to begin filtering data and creating your localized PDF directory.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <button 
              onClick={() => handleSelectComponent('assembly')}
              className={`group flex flex-col bg-white rounded-3xl border ${activeComponent === 'assembly' ? 'border-blue-500 shadow-xl' : 'border-slate-200'} shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-2 transition-all duration-300 overflow-hidden text-left`}
            >
              <div className="h-48 overflow-hidden relative w-full">
                 <img src="https://images.unsplash.com/photo-1575517111478-7f6afd0973db?q=80&w=2070&auto=format&fit=crop" alt="Assembly" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold">Assembly</h3>
                 </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed mb-6">Generate directories mapped precisely to assembly constituencies and booths for large scale management.</p>
                <div className="flex items-center text-blue-600 font-bold group-hover:gap-2 transition-all">
                  Select <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleSelectComponent('nagar-nigam')}
              className={`group flex flex-col bg-white rounded-3xl border ${activeComponent === 'nagar-nigam' ? 'border-emerald-500 shadow-xl' : 'border-slate-200'} shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-2 transition-all duration-300 overflow-hidden text-left`}
            >
              <div className="h-48 overflow-hidden relative w-full">
                 <img src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop" alt="Nagar Nigam" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold">Nagar Nigam</h3>
                 </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed mb-6">Detailed urban directories structured by city municipalities, wards, and distinct neighborhood booths.</p>
                <div className="flex items-center text-emerald-600 font-bold group-hover:gap-2 transition-all">
                  Select <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleSelectComponent('gram-panchayat')}
              className={`group flex flex-col bg-white rounded-3xl border ${activeComponent === 'gram-panchayat' ? 'border-violet-500 shadow-xl' : 'border-slate-200'} shadow-sm hover:shadow-xl hover:border-violet-300 hover:-translate-y-2 transition-all duration-300 overflow-hidden text-left`}
            >
              <div className="h-48 overflow-hidden relative w-full">
                 <img src="https://images.unsplash.com/photo-1592659762303-90081d34b277?q=80&w=2073&auto=format&fit=crop" alt="Gram Panchayat" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold">Gram Panchayat</h3>
                 </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed mb-6">Village-level rural directories organized meticulously by local wards and community polling stations.</p>
                <div className="flex items-center text-violet-600 font-bold group-hover:gap-2 transition-all">
                  Select <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Render selected component */}
      <div ref={componentRef} className="w-full flex-1">
        {activeComponent === 'assembly' && <PhotoAssembly onBack={() => { setActiveComponent(null); setSearchParams({}); }} />}
        {activeComponent === 'nagar-nigam' && <PhotoNagarNigam onBack={() => { setActiveComponent(null); setSearchParams({}); }} />}
        {activeComponent === 'gram-panchayat' && <PhotoGramPanchayat onBack={() => { setActiveComponent(null); setSearchParams({}); }} />}
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-24 pb-32 px-6 flex items-center min-h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop" alt="Elections" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 max-w-2xl">
            <div className="inline-block bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-200 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              ✨ Seamless Electoral Management
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Digitize Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Voter Directories.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Generate structured, printable PDF directories for Assembly, Nagar Nigam, and Gram Panchayat elections in seconds. A complete solution for administrative precision.
            </p>
          </div>
          
          <div className="flex-1 hidden md:block">
            {/* Decorative Element */}
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl blur opacity-30"></div>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview" className="relative rounded-2xl border border-white/10 shadow-2xl object-cover h-[320px] w-full" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PhotoIndex;
