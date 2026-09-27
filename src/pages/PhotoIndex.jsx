import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState } from 'react';
import * as XLSX from 'xlsx';

function PhotoIndex() {
  const [loadingTest, setLoadingTest] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const loadTestData = async () => {
    setLoadingTest(true);
    setTestResults(null);
    try {
      const filesToLoad = [
        { name: 'AJMER', url: '/AJMER.xlsx' },
        { name: 'FinalDetails_ENGLISH', url: '/FinalDetailsofVoter_ENGLISH.xlsx' },
        { name: 'Ward_33', url: '/Ward_33.xlsx' }
      ];

      const results = {};

      for (const file of filesToLoad) {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Failed to load ${file.name}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        results[file.name] = {
          rowCount: jsonData.length,
          preview: jsonData.slice(0, 3) // preview first 3 rows
        };
      }
      
      setTestResults(results);
    } catch (error) {
      console.error("Error loading test data:", error);
      alert("Error loading test data: " + error.message);
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

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
            <div className="flex flex-wrap gap-4">
              <a href="#directories" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all">
                Generate Directory
              </a>
            </div>
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

      {/* Main Options */}
      <section id="directories" className="max-w-7xl mx-auto px-6 py-20 -mt-16 relative z-20 w-full">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
          
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <button 
              onClick={loadTestData} 
              disabled={loadingTest}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 mb-6"
            >
              {loadingTest ? 'Loading Test Data...' : 'Load Test Data'}
            </button>
            {testResults && (
              <div className="bg-slate-100 p-6 rounded-2xl text-left shadow-inner overflow-auto max-h-96">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Test Data Loaded</h3>
                {Object.entries(testResults).map(([filename, data]) => (
                  <div key={filename} className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="text-lg font-bold text-blue-700">{filename}</h4>
                    <p className="text-slate-600 font-medium mb-2">Total Rows: {data.rowCount}</p>
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg overflow-x-auto whitespace-pre">
                      {JSON.stringify(data.preview, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Select Region Type</h2>
            <p className="text-slate-500 mt-4 text-lg">Choose the administrative level to begin filtering data and creating your localized PDF directory.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link 
              to="/photo/assembly" 
              className="group flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="h-48 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1575517111478-7f6afd0973db?q=80&w=2070&auto=format&fit=crop" alt="Assembly" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold">Assembly</h3>
                 </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed mb-6">Generate directories mapped precisely to assembly constituencies and booths for large scale management.</p>
                <div className="flex items-center text-blue-600 font-bold group-hover:gap-2 transition-all">
                  Proceed <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </Link>

            <Link 
              to="/photo/nagar-nigam" 
              className="group flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="h-48 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop" alt="Nagar Nigam" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold">Nagar Nigam</h3>
                 </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed mb-6">Detailed urban directories structured by city municipalities, wards, and distinct neighborhood booths.</p>
                <div className="flex items-center text-emerald-600 font-bold group-hover:gap-2 transition-all">
                  Proceed <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </Link>

            <Link 
              to="/photo/gram-panchayat" 
              className="group flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-300 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="h-48 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1592659762303-90081d34b277?q=80&w=2073&auto=format&fit=crop" alt="Gram Panchayat" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold">Gram Panchayat</h3>
                 </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed mb-6">Village-level rural directories organized meticulously by local wards and community polling stations.</p>
                <div className="flex items-center text-violet-600 font-bold group-hover:gap-2 transition-all">
                  Proceed <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PhotoIndex;
