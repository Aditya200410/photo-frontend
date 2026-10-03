import { useState, useEffect, useMemo } from 'react';
import { State, City } from 'country-state-city';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import SlipPrintManager from '../components/SlipPrintManager';
import BatchSlipPrintManager from '../components/BatchSlipPrintManager';

function PhotoGramPanchayat({ onBack }) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [panchayatName, setPanchayatName] = useState('');
  const [villageName, setVillageName] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [boothNumber, setBoothNumber] = useState('');

  const [voters, setVoters] = useState([]);
  const [filters, setFilters] = useState({ id: '', name: '', houseNo: '', age: '', minAge: '', maxAge: '', sex: '' });
  const [displayedVoters, setDisplayedVoters] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const itemsPerPage = 10;

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const idMatch = !filters.id || (v.IDCARD || '').toString().toLowerCase().includes(filters.id.toLowerCase());
      const nameMatch = !filters.name || (v.V_FNAME_EN || '').toString().toLowerCase().includes(filters.name.toLowerCase()) || (v.V_FNAME_HI || '').toString().includes(filters.name) || (v.V_LNAME_EN || '').toString().toLowerCase().includes(filters.name.toLowerCase());
      const houseMatch = !filters.houseNo || (v.HOUSE_NO || '').toString().toLowerCase().includes(filters.houseNo.toLowerCase());

      const vAge = parseInt(v.AGE) || 0;
      const ageMatch = !filters.age || vAge === parseInt(filters.age);
      const minAgeMatch = !filters.minAge || vAge >= parseInt(filters.minAge);
      const maxAgeMatch = !filters.maxAge || vAge <= parseInt(filters.maxAge);
      
      let sexMatch = true;
      if (filters.sex) {
        const vSex = (v.SEX || '').toUpperCase();
        if (filters.sex === 'M') {
          sexMatch = vSex === 'M' || vSex === 'पुरुष';
        } else if (filters.sex === 'F') {
          sexMatch = vSex === 'F' || vSex === 'स्त्री';
        }
      }

      return idMatch && nameMatch && houseMatch && ageMatch && minAgeMatch && maxAgeMatch && sexMatch;
    });
  }, [voters, filters]);

  useEffect(() => {
    setDisplayedVoters(filteredVoters.slice(0, pageCount * itemsPerPage));
  }, [filteredVoters, pageCount, itemsPerPage]);

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  const [availableFiles, setAvailableFiles] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/excel-files/panchayat`)
      .then(res => res.json())
      .then(data => setAvailableFiles(data))
      .catch(err => console.error(err));
  }, []);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setPanchayatName('');
    setVillageName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setPanchayatName('');
    setVillageName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handlePanchayatChange = (e) => {
    setPanchayatName(e.target.value);
    setVillageName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handleVillageChange = (e) => {
    setVillageName(e.target.value);
    setWardNumber('');
    setBoothNumber('');
  };

  const handleWardChange = (e) => {
    setWardNumber(e.target.value);
    setBoothNumber('');
  };

  // Compute available options based on selections
  const availableStates = [...new Set(availableFiles.map(f => f.state).filter(Boolean))];

  const stateFiles = availableFiles.filter(f => f.state === selectedState);
  const availableDistricts = [...new Set(stateFiles.map(f => f.district).filter(Boolean))];

  const validFiles = stateFiles.filter(f => f.district === selectedDistrict);
  const availablePanchayats = [...new Set(validFiles.map(f => f.panchayat).filter(Boolean))];

  const villageFiles = validFiles.filter(f => f.panchayat === panchayatName);
  const availableVillages = [...new Set(villageFiles.map(f => f.village).filter(Boolean))];

  const wardFiles = villageFiles.filter(f => f.village === villageName);
  const availableWards = [...new Set(wardFiles.map(f => f.ward).filter(Boolean))];

  const boothFiles = wardFiles.filter(f => f.ward === wardNumber);
  const availableBooths = [...new Set(boothFiles.map(f => f.booth).filter(Boolean))];

  // Modal State for Slip Printing
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState(false);
  const [selectedOptionTemplate, setSelectedOptionTemplate] = useState(1);
  const [mappedVoterData, setMappedVoterData] = useState({});

  const handlePrintSlip = (voter) => {
    setSelectedVoter(voter);
    setIsTemplateModalOpen(true);
  };

  const handleTemplateSelect = (optionNumber) => {
    setIsTemplateModalOpen(false);
    if (!selectedVoter) return;

    const mappedData = {
      wardNo: wardNumber,
      partNo: boothNumber,
      serialNo: selectedVoter.IDCARD || '1',
      idNumber: selectedVoter.IDCARD || '-',
      voterName: selectedVoter.V_FNAME_EN ? `${selectedVoter.V_FNAME_EN} ${selectedVoter.V_LNAME_EN || ''}` : '-',
      fatherHusbandName: selectedVoter.VR_FNAME_EN ? `${selectedVoter.VR_FNAME_EN} ${selectedVoter.VR_LNAME_EN || ''}` : '-',
      houseNo: selectedVoter.HOUSE_NO || '0',
      gender: selectedVoter.SEX === 'M' || selectedVoter.SEX === 'पुरुष' ? 'पुरुष' : (selectedVoter.SEX === 'F' || selectedVoter.SEX === 'स्त्री' ? 'स्त्री' : selectedVoter.SEX),
      age: selectedVoter.AGE || '18',
      pollingStation: `${panchayatName} - Ward ${wardNumber} - Booth ${boothNumber}`,
      topImage: null,
      symbolImage: null,
      symbolName: 'कमल का फूल'
    };

    setMappedVoterData(mappedData);
    setSelectedOptionTemplate(optionNumber);
    setIsPrintModalOpen(true);
  };

  const generatePDF = async () => {
    if (filteredVoters.length === 0) return;
    setIsBatchPrintModalOpen(true);
  };

  const fetchVoters = async () => {
    if (!selectedState || !selectedDistrict || !panchayatName || !villageName || !wardNumber || !boothNumber) {
      alert("Please fill all fields first");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/voters`);
      url.searchParams.append('category', 'panchayat');
      url.searchParams.append('state', selectedState);
      url.searchParams.append('district', selectedDistrict);
      url.searchParams.append('panchayat', panchayatName);
      url.searchParams.append('village', villageName);
      url.searchParams.append('ward', wardNumber);
      url.searchParams.append('booth', boothNumber);

      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setVoters([]);
        setDisplayedVoters([]);
      } else {
        setVoters(data.voters || []);
        setPageCount(1);
        if (data.voters.length === 0) {
          setError('No voters found for this location');
        } else {
          setFetchSuccess(true);
          setTimeout(() => setFetchSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = pageCount + 1;
    setPageCount(nextPage);
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-0 md:p-8 w-full">
        <div className="w-full max-w-2xl lg:max-w-6xl xl:max-w-7xl bg-white md:rounded-3xl shadow-xl shadow-slate-200/50 border-0 md:border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 md:h-2 bg-gradient-to-r from-violet-500 to-purple-500"></div>
          <div className="p-5 sm:p-8 md:p-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Gram Panchayat Details</h2>
                <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base">Generate PDF based on Booth Number</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 shadow-inner shrink-0">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">State</label>
                  <div className="relative">
                    <select
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 cursor-pointer"
                    >
                      <option value="">{availableStates.length === 0 ? 'No State Data Uploaded' : 'Select State'}</option>
                      {availableStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">District</label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      disabled={!selectedState || availableDistricts.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableDistricts.length === 0 && selectedState ? 'No District Data Uploaded' : 'Select District'}</option>
                      {availableDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Gram Panchayat</label>
                  <div className="relative">
                    <select
                      value={panchayatName}
                      onChange={handlePanchayatChange}
                      disabled={!selectedDistrict || availablePanchayats.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availablePanchayats.length === 0 && selectedDistrict ? 'No Panchayat Data' : 'Select Panchayat'}</option>
                      {availablePanchayats.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Village</label>
                  <div className="relative">
                    <select
                      value={villageName}
                      onChange={handleVillageChange}
                      disabled={!panchayatName || availableVillages.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableVillages.length === 0 && panchayatName ? 'No Village Data' : 'Select Village'}</option>
                      {availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Ward Number</label>
                  <div className="relative">
                    <select
                      value={wardNumber}
                      onChange={handleWardChange}
                      disabled={!villageName || availableWards.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableWards.length === 0 && villageName ? 'No Ward Data' : 'Select Ward Number'}</option>
                      {availableWards.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Booth Number</label>
                  <div className="relative">
                    <select
                      value={boothNumber}
                      onChange={(e) => setBoothNumber(e.target.value)}
                      disabled={!wardNumber || availableBooths.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableBooths.length === 0 && wardNumber ? 'No Booth Data' : 'Select Booth Number'}</option>
                      {availableBooths.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 sm:pt-6 flex justify-center lg:justify-end gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={fetchVoters}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl px-6 sm:px-10 py-3 sm:py-4 font-bold shadow-lg shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>Loading Data...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Fetch Voter Data
                    </>
                  )}
                </button>

              </div>
            </form>

            {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">{error}</div>}
            {fetchSuccess && <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-medium flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Data fetched successfully!</div>}

            {voters.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Panchayat Voters ({filteredVoters.length} entries)</h3>
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating || filteredVoters.length === 0}
                    className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-violet-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
                  >
                    {isGenerating ? 'Generating...' : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Generate PDF
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Filter Data
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID / VID</label>
                      <input 
                        type="text" 
                        placeholder="Search by ID..." 
                        value={filters.id} 
                        onChange={e => { setFilters(prev => ({...prev, id: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Voter Name</label>
                      <input 
                        type="text" 
                        placeholder="Search by Name..." 
                        value={filters.name} 
                        onChange={e => { setFilters(prev => ({...prev, name: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">House No</label>
                      <input 
                        type="text" 
                        placeholder="Search by House No..." 
                        value={filters.houseNo} 
                        onChange={e => { setFilters(prev => ({...prev, houseNo: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Exact Age</label>
                      <input 
                        type="number" 
                        placeholder="Age..." 
                        value={filters.age} 
                        onChange={e => { setFilters(prev => ({...prev, age: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Min Age</label>
                      <input 
                        type="number" 
                        placeholder="Min Age..." 
                        value={filters.minAge} 
                        onChange={e => { setFilters(prev => ({...prev, minAge: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Age</label>
                      <input 
                        type="number" 
                        placeholder="Max Age..." 
                        value={filters.maxAge} 
                        onChange={e => { setFilters(prev => ({...prev, maxAge: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sex</label>
                      <select 
                        value={filters.sex} 
                        onChange={e => { setFilters(prev => ({...prev, sex: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      >
                        <option value="">All</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                        <th className="p-4 rounded-tl-lg">IDCARD</th>
                        <th className="p-4">Name (EN/HI)</th>
                        <th className="p-4">Relation (EN/HI)</th>
                        <th className="p-4">Age / Sex</th>
                        <th className="p-4">House No</th>
                        <th className="p-4 rounded-tr-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 divide-y divide-slate-100 bg-white">
                      {displayedVoters.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-sm font-medium text-slate-800">{v.IDCARD || '-'}</td>
                          <td className="p-4 font-medium text-slate-800">
                            {v.V_FNAME_EN || ''} {v.V_LNAME_EN || ''}<br />
                            <span className="text-slate-500 text-sm font-normal">{v.V_FNAME_HI || ''} {v.V_LNAME_HI || ''}</span>
                          </td>
                          <td className="p-4">
                            {v.VR_FNAME_EN || ''} {v.VR_LNAME_EN || ''}<br />
                            <span className="text-slate-500 text-sm">{v.VR_FNAME_HI || ''} {v.VR_LNAME_HI || ''}</span>
                          </td>
                          <td className="p-4 text-slate-600">
                            {v.AGE || '-'} Y / {v.SEX === 'M' || v.SEX === 'पुरुष' ? 'Male' : (v.SEX === 'F' || v.SEX === 'स्त्री' ? 'Female' : v.SEX)}
                          </td>
                          <td className="p-4 text-slate-600">{v.HOUSE_NO || '-'}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handlePrintSlip(v)}
                              className="bg-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                              Print Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredVoters.length > displayedVoters.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMore}
                      className="bg-white border border-slate-200 text-violet-600 hover:bg-violet-50 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      Load More Entries
                    </button>
                  </div>
                )}
                {filteredVoters.length === 0 && (
                  <div className="text-center py-10 text-slate-500 font-medium">
                    No voters match the current filters.
                  </div>
                )}
              </div>
            )}

          </div>


        </div>
      </div>
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleTemplateSelect}
      />
      <SlipPrintManager
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        optionNumber={selectedOptionTemplate}
        voterData={mappedVoterData}
      />
      <BatchSlipPrintManager
        isOpen={isBatchPrintModalOpen}
        onClose={() => setIsBatchPrintModalOpen(false)}
        voters={filteredVoters}
        assemblyName={panchayatName}
        wardNo={wardNumber}
        boothNumber={boothNumber}
      />
    </>
  );
}

export default PhotoGramPanchayat;
