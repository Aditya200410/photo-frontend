import { useState, useEffect, useMemo } from 'react';
import { State, City } from 'country-state-city';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import SlipPrintManager from '../components/SlipPrintManager';
import BatchSlipPrintManager from '../components/BatchSlipPrintManager';

function PhotoNagarNigam({ onBack }) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [cityName, setCityName] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [boothNumber, setBoothNumber] = useState('');

  const [voters, setVoters] = useState([]);
  const [filters, setFilters] = useState({ id: '', name: '', houseNo: '', age: '', minAge: '', maxAge: '', sex: '' });
  const [displayedVoters, setDisplayedVoters] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const itemsPerPage = 10;

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const idMatch = !filters.id || (v.SRNO || '').toString().toLowerCase().includes(filters.id.toLowerCase()) || (v.VID || '').toString().toLowerCase().includes(filters.id.toLowerCase());
      const nameMatch = !filters.name || (v.EFVNAME || '').toString().toLowerCase().includes(filters.name.toLowerCase()) || (v.FVNAME || '').toString().includes(filters.name);
      const houseMatch = !filters.houseNo || (v.FHOUSENO || '').toString().toLowerCase().includes(filters.houseNo.toLowerCase());
      
      const vAge = parseInt(v.FAGE) || 0;
      const ageMatch = !filters.age || vAge === parseInt(filters.age);
      const minAgeMatch = !filters.minAge || vAge >= parseInt(filters.minAge);
      const maxAgeMatch = !filters.maxAge || vAge <= parseInt(filters.maxAge);
      
      let sexMatch = true;
      if (filters.sex) {
        const vSex = (v.FGENDER || '').toUpperCase();
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
    fetch(`${(import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com')}/api/excel-files/nagar-nigam`)
      .then(res => res.json())
      .then(data => setAvailableFiles(data))
      .catch(err => console.error(err));
  }, []);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setCityName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setCityName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handleCityChange = (e) => {
    setCityName(e.target.value);
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
  const availableCities = [...new Set(validFiles.map(f => f.city).filter(Boolean))];

  const wardFiles = validFiles.filter(f => f.city === cityName);
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
      serialNo: selectedVoter.SRNO || selectedVoter.VID || '1',
      idNumber: selectedVoter.VID || '-',
      voterName: selectedVoter.EFVNAME || selectedVoter.FVNAME || '-',
      fatherHusbandName: selectedVoter.EFRNAME || selectedVoter.FRNAME || '-',
      houseNo: selectedVoter.FHOUSENO || '0',
      gender: selectedVoter.FGENDER === 'M' || selectedVoter.FGENDER === 'पुरुष' ? 'पुरुष' : (selectedVoter.FGENDER === 'F' || selectedVoter.FGENDER === 'स्त्री' ? 'स्त्री' : selectedVoter.FGENDER),
      age: selectedVoter.FAGE || '18',
      pollingStation: `${cityName} - Ward ${wardNumber} - Booth ${boothNumber}`,
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
    if (!selectedState || !selectedDistrict || !cityName || !wardNumber || !boothNumber) {
      alert("Please fill all fields first");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${(import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com')}/api/voters`);
      url.searchParams.append('category', 'nagar-nigam');
      url.searchParams.append('state', selectedState);
      url.searchParams.append('district', selectedDistrict);
      url.searchParams.append('city', cityName);
      url.searchParams.append('ward', wardNumber);
      url.searchParams.append('booth', boothNumber);

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token') || 'DUMMY'}` } });
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
      <div className="flex-1 flex items-center justify-center p-0 md:p-6 w-full">
        <div className="w-full max-w-7xl bg-white md:rounded-3xl shadow-xl shadow-slate-200/50 border-0 md:border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500"></div>
          
          <div className="p-4 sm:p-8 md:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200/60 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Nagar Nigam Directory
                  </span>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full hidden sm:inline-block">
                    Municipal Corporation Engine
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  Nagar Nigam Details & Voter Directory
                </h2>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">
                  Select parameters or upload municipal corporation Excel data to search voters by ward and booth.
                </p>
              </div>

              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>

            {/* Selection Form Deck */}
            <form className="space-y-6 bg-slate-50/70 p-4 sm:p-6 rounded-3xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Location & Ward Parameters
                </h3>
                {availableFiles.length > 0 && (
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    {availableFiles.length} Datasets Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* 1. State */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>State</span>
                    {availableStates.length > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">{availableStates.length} Available</span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-800 font-medium appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">{availableStates.length === 0 ? 'No State Data Uploaded' : 'Select State'}</option>
                      {availableStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* 2. District */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>District</span>
                    {availableDistricts.length > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">{availableDistricts.length} Available</span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      disabled={!selectedState || availableDistricts.length === 0}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-800 font-medium appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableDistricts.length === 0 && selectedState ? 'No District Data Uploaded' : 'Select District'}</option>
                      {availableDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* 3. City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>City</span>
                    {availableCities.length > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">{availableCities.length} Available</span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={cityName}
                      onChange={handleCityChange}
                      disabled={!selectedDistrict || availableCities.length === 0}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-800 font-medium appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableCities.length === 0 && selectedDistrict ? 'No City Data Uploaded' : 'Select City'}</option>
                      {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* 4. Ward Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Ward Number</span>
                    {availableWards.length > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">{availableWards.length} Available</span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={wardNumber}
                      onChange={handleWardChange}
                      disabled={!cityName || availableWards.length === 0}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-800 font-medium appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableWards.length === 0 && cityName ? 'No Ward Data Uploaded' : 'Select Ward Number'}</option>
                      {availableWards.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* 5. Booth Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Booth Number</span>
                    {availableBooths.length > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">{availableBooths.length} Available</span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value={boothNumber}
                      onChange={(e) => setBoothNumber(e.target.value)}
                      disabled={!wardNumber || availableBooths.length === 0}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-800 font-medium appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableBooths.length === 0 && wardNumber ? 'No Booth Data Uploaded' : 'Select Booth Number'}</option>
                      {availableBooths.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={fetchVoters}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl px-8 py-3.5 font-bold shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Retrieving Records...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Fetch Voter Data
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-medium flex items-center gap-2.5">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            {fetchSuccess && (
              <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 font-medium flex items-center gap-2.5">
                <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Voter records loaded successfully!
              </div>
            )}

            {voters.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <span>Nagar Nigam Voters</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {filteredVoters.length} {filteredVoters.length === 1 ? 'elector' : 'electors'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Showing electors filtered for selected ward and booth</p>
                  </div>
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating || filteredVoters.length === 0}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Print Batch Slips (PDF)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Filter Deck */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter Electors Data
                    </h4>
                    {(filters.id || filters.name || filters.houseNo || filters.age || filters.minAge || filters.maxAge || filters.sex) && (
                      <button
                        onClick={() => {
                          setFilters({ id: '', name: '', houseNo: '', age: '', minAge: '', maxAge: '', sex: '' });
                          setPageCount(1);
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        Reset All Filters ✕
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">SRNO / VID</label>
                      <input 
                        type="text" 
                        placeholder="Search ID / VID..." 
                        value={filters.id} 
                        onChange={e => { setFilters(prev => ({...prev, id: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Voter Name</label>
                      <input 
                        type="text" 
                        placeholder="Search Name (English or Hindi)..." 
                        value={filters.name} 
                        onChange={e => { setFilters(prev => ({...prev, name: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">House Number</label>
                      <input 
                        type="text" 
                        placeholder="House Number..." 
                        value={filters.houseNo} 
                        onChange={e => { setFilters(prev => ({...prev, houseNo: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-3.5 pt-3 border-t border-slate-200/70">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Exact Age</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 25" 
                        value={filters.age} 
                        onChange={e => { setFilters(prev => ({...prev, age: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Min Age</label>
                      <input 
                        type="number" 
                        placeholder="Min..." 
                        value={filters.minAge} 
                        onChange={e => { setFilters(prev => ({...prev, minAge: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Max Age</label>
                      <input 
                        type="number" 
                        placeholder="Max..." 
                        value={filters.maxAge} 
                        onChange={e => { setFilters(prev => ({...prev, maxAge: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Gender / Sex</label>
                      <select 
                        value={filters.sex} 
                        onChange={e => { setFilters(prev => ({...prev, sex: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      >
                        <option value="">All Genders</option>
                        <option value="M">Male (पुरुष)</option>
                        <option value="F">Female (महिला)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Electors Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-3.5 pl-4">SRNO / Card</th>
                        <th className="p-3.5">Name (EN / HI)</th>
                        <th className="p-3.5">Guardian / Relation</th>
                        <th className="p-3.5">Age & Gender</th>
                        <th className="p-3.5">House No</th>
                        <th className="p-3.5 pr-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 divide-y divide-slate-100 bg-white text-xs sm:text-sm">
                      {displayedVoters.map((v, i) => (
                        <tr key={i} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="p-3.5 pl-4">
                            <span className="font-bold text-slate-800 font-mono block">{v.SRNO || '-'}</span>
                            <span className="text-slate-400 text-[11px] font-mono">{v.VID || '-'}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{v.EFVNAME || '-'}</div>
                            <div className="text-slate-500 text-xs font-normal">{v.FVNAME || '-'}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-medium text-slate-700">{v.EFRNAME || '-'}</div>
                            <div className="text-slate-500 text-xs">{v.FRNAME || '-'}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800">{v.FAGE || '-'} Y</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (v.FGENDER === 'M' || v.FGENDER === 'पुरुष') 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-pink-50 text-pink-700 border border-pink-200'
                            }`}>
                              {v.FGENDER === 'M' || v.FGENDER === 'पुरुष' ? 'Male' : (v.FGENDER === 'F' || v.FGENDER === 'स्त्री' ? 'Female' : v.FGENDER || '-')}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">{v.FHOUSENO || '-'}</td>
                          <td className="p-3.5 pr-4 text-right">
                            <button
                              onClick={() => handlePrintSlip(v)}
                              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              <span>Print Slip</span>
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
                      className="bg-white border border-slate-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm cursor-pointer"
                    >
                      Load More Electors ({filteredVoters.length - displayedVoters.length} remaining)
                    </button>
                  </div>
                )}
                {filteredVoters.length === 0 && (
                  <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 font-medium">
                    No voters match the current filter criteria.
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
        assemblyName={cityName}
        wardNo={wardNumber}
        boothNumber={boothNumber}
      />
    </>
  );
}

export default PhotoNagarNigam;
