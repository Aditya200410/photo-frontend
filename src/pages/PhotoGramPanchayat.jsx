import { useState, useEffect, useMemo } from 'react';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import SlipPrintManager from '../components/SlipPrintManager';
import BatchSlipPrintManager from '../components/BatchSlipPrintManager';

function PhotoGramPanchayat({ onBack }) {
  const [availableFiles, setAvailableFiles] = useState([]);
  
  // Cascade Selection States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSamiti, setSelectedSamiti] = useState('');
  const [panchayatName, setPanchayatName] = useState('');
  const [villageName, setVillageName] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [boothNumber, setBoothNumber] = useState('');

  // Voter data & filters
  const [voters, setVoters] = useState([]);
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    relativeName: '',
    houseNo: '',
    age: '',
    minAge: '',
    maxAge: '',
    sex: '',
    ward: '',
    village: ''
  });
  const [displayedVoters, setDisplayedVoters] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const itemsPerPage = 15;

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  // Modal State for Slip Printing & Details
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [detailModalVoter, setDetailModalVoter] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState(false);
  const [selectedOptionTemplate, setSelectedOptionTemplate] = useState(1);
  const [mappedVoterData, setMappedVoterData] = useState({});

  // Fetch available Panchayat files on mount
  useEffect(() => {
    fetch(`${(import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com')}/api/excel-files/panchayat`)
      .then(res => res.json())
      .then(data => {
        setAvailableFiles(data);
        if (data.length > 0) {
          // Preselect first state if only one
          const states = [...new Set(data.map(f => f.state).filter(Boolean))];
          if (states.length === 1) setSelectedState(states[0]);
        }
      })
      .catch(err => console.error('Error fetching panchayat files:', err));
  }, []);

  // --- Dynamic Option Derivation ---
  // 1. Available States
  const availableStates = useMemo(() => {
    return [...new Set(availableFiles.map(f => f.state).filter(Boolean))];
  }, [availableFiles]);

  // 2. Files for selected state
  const stateFiles = useMemo(() => {
    if (!selectedState) return availableFiles;
    return availableFiles.filter(f => f.state === selectedState);
  }, [availableFiles, selectedState]);

  // 3. Available Districts / Zilla Parishads
  const availableDistricts = useMemo(() => {
    const list = new Set();
    stateFiles.forEach(f => {
      if (f.zillaParishad) list.add(f.zillaParishad);
      else if (f.district) list.add(f.district);
      if (f.zillaParishads) f.zillaParishads.forEach(z => list.add(z));
    });
    return Array.from(list);
  }, [stateFiles]);

  // Auto-select district if only 1
  useEffect(() => {
    if (availableDistricts.length === 1 && !selectedDistrict) {
      setSelectedDistrict(availableDistricts[0]);
    }
  }, [availableDistricts, selectedDistrict]);

  // 4. Files for selected District
  const districtFiles = useMemo(() => {
    if (!selectedDistrict) return stateFiles;
    return stateFiles.filter(f => 
      f.district === selectedDistrict || 
      f.zillaParishad === selectedDistrict || 
      (f.zillaParishads && f.zillaParishads.includes(selectedDistrict))
    );
  }, [stateFiles, selectedDistrict]);

  // 5. Available Panchayat Samitis (Blocks/Cities)
  const availableSamitis = useMemo(() => {
    const map = new Map();
    districtFiles.forEach(f => {
      const samitiName = f.panchayatSamiti || f.city;
      const samitiNo = f.panchayatSamitiNo || '';
      if (samitiName) {
        map.set(samitiName, samitiNo);
      }
      if (f.panchayatSamitis) {
        f.panchayatSamitis.forEach((s, idx) => {
          map.set(s, f.panchayatSamitiNos?.[idx] || '');
        });
      }
    });
    return Array.from(map.entries()).map(([name, no]) => ({ name, no }));
  }, [districtFiles]);

  // Auto-select samiti if only 1
  useEffect(() => {
    if (availableSamitis.length === 1 && !selectedSamiti) {
      setSelectedSamiti(availableSamitis[0].name);
    }
  }, [availableSamitis, selectedSamiti]);

  // 6. Files for selected Samiti
  const samitiFiles = useMemo(() => {
    if (!selectedSamiti) return districtFiles;
    return districtFiles.filter(f => 
      f.panchayatSamiti === selectedSamiti || 
      f.city === selectedSamiti || 
      (f.panchayatSamitis && f.panchayatSamitis.includes(selectedSamiti))
    );
  }, [districtFiles, selectedSamiti]);

  // 7. Available Gram Panchayats
  const availablePanchayats = useMemo(() => {
    const list = new Set();
    samitiFiles.forEach(f => {
      if (f.hierarchy && Object.keys(f.hierarchy).length > 0) {
        Object.entries(f.hierarchy).forEach(([pName, info]) => {
          if (!selectedSamiti || !info.samiti || info.samiti.trim().toLowerCase() === selectedSamiti.trim().toLowerCase()) {
            list.add(pName);
          }
        });
      } else if (f.panchayats && f.panchayats.length > 0) {
        f.panchayats.forEach(p => list.add(p));
      } else if (f.panchayat) {
        list.add(f.panchayat);
      }
    });
    return Array.from(list);
  }, [samitiFiles, selectedSamiti]);

  // Auto-select panchayat if only 1
  useEffect(() => {
    if (availablePanchayats.length === 1 && !panchayatName) {
      setPanchayatName(availablePanchayats[0]);
    }
  }, [availablePanchayats, panchayatName]);

  // 8. Files for selected Panchayat
  const panchayatMatchedFiles = useMemo(() => {
    if (!panchayatName) return samitiFiles;
    return samitiFiles.filter(f => 
      f.panchayat === panchayatName || 
      (f.panchayats && f.panchayats.includes(panchayatName))
    );
  }, [samitiFiles, panchayatName]);

  // 9. Available Villages (under selected Panchayat)
  const availableVillages = useMemo(() => {
    const list = new Set();
    panchayatMatchedFiles.forEach(f => {
      if (f.hierarchy && f.hierarchy[panchayatName]) {
        f.hierarchy[panchayatName].villages.forEach(v => list.add(v));
      } else if (f.villages) {
        f.villages.forEach(v => list.add(v));
      } else if (f.village) {
        list.add(f.village);
      }
    });
    return Array.from(list);
  }, [panchayatMatchedFiles, panchayatName]);

  // 10. Available Wards (Automatically extracted from Excel!)
  const availableWards = useMemo(() => {
    const set = new Set();
    panchayatMatchedFiles.forEach(f => {
      if (villageName && f.villageHierarchy && f.villageHierarchy[villageName]) {
        f.villageHierarchy[villageName].wards.forEach(w => set.add(String(w)));
      } else if (f.hierarchy && f.hierarchy[panchayatName]) {
        f.hierarchy[panchayatName].wards.forEach(w => set.add(String(w)));
      } else if (f.wards && f.wards.length > 0) {
        f.wards.forEach(w => set.add(String(w)));
      } else if (f.ward) {
        set.add(String(f.ward));
      }
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [panchayatMatchedFiles, panchayatName, villageName]);

  // 11. Available Booths (under selected ward/panchayat)
  const availableBooths = useMemo(() => {
    const set = new Set();
    panchayatMatchedFiles.forEach(f => {
      if (wardNumber && f.hierarchy && f.hierarchy[panchayatName]) {
        f.hierarchy[panchayatName].booths.forEach(b => set.add(String(b)));
      } else if (f.booths && f.booths.length > 0) {
        f.booths.forEach(b => set.add(String(b)));
      } else if (f.booth) {
        set.add(String(f.booth));
      }
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [panchayatMatchedFiles, panchayatName, wardNumber]);

  // Active Zilla & Samiti Numbers
  const currentZillaNo = useMemo(() => {
    if (panchayatName) {
      for (const f of panchayatMatchedFiles) {
        if (f.hierarchy && f.hierarchy[panchayatName]?.zillaNo) {
          return String(f.hierarchy[panchayatName].zillaNo);
        }
      }
    }
    if (selectedDistrict) {
      const file = districtFiles.find(f => f.zillaParishadNo);
      return file?.zillaParishadNo || '';
    }
    return '';
  }, [panchayatMatchedFiles, panchayatName, selectedDistrict, districtFiles]);

  const currentSamitiNo = useMemo(() => {
    if (panchayatName) {
      for (const f of panchayatMatchedFiles) {
        if (f.hierarchy && f.hierarchy[panchayatName]?.samitiNo) {
          return String(f.hierarchy[panchayatName].samitiNo);
        }
      }
    }
    const found = availableSamitis.find(s => s.name === selectedSamiti);
    return found?.no || '';
  }, [panchayatMatchedFiles, panchayatName, availableSamitis, selectedSamiti]);

  // --- Handlers for Cascade ---
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedDistrict('');
    setSelectedSamiti('');
    setPanchayatName('');
    setVillageName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedSamiti('');
    setPanchayatName('');
    setVillageName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handleSamitiChange = (e) => {
    setSelectedSamiti(e.target.value);
    setPanchayatName('');
    setVillageName('');
    setWardNumber('');
    setBoothNumber('');
  };

  const handlePanchayatChange = (e) => {
    const val = e.target.value;
    setPanchayatName(val);
    setVillageName('');
    setWardNumber('');
    setBoothNumber('');

    // If user selects a panchayat directly, auto-populate its State, Zilla, and Samiti!
    if (val) {
      for (const f of availableFiles) {
        if (f.hierarchy && f.hierarchy[val]) {
          const info = f.hierarchy[val];
          if (f.state && !selectedState) setSelectedState(f.state);
          if (info.zilla && !selectedDistrict) setSelectedDistrict(info.zilla);
          if (info.samiti && !selectedSamiti) setSelectedSamiti(info.samiti);
          break;
        } else if (f.panchayats?.includes(val) || f.panchayat === val) {
          if (f.state && !selectedState) setSelectedState(f.state);
          if ((f.zillaParishad || f.district) && !selectedDistrict) setSelectedDistrict(f.zillaParishad || f.district);
          if ((f.panchayatSamiti || f.city) && !selectedSamiti) setSelectedSamiti(f.panchayatSamiti || f.city);
          break;
        }
      }
    }
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

  // --- Fetch Voters from Backend ---
  const fetchVoters = async () => {
    if (!panchayatName && !selectedDistrict && !selectedSamiti) {
      alert("Please select Gram Panchayat to fetch data.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${(import.meta.env.VITE_API_URL || 'https://api.onlinevoterslip.com')}/api/voters`);
      url.searchParams.append('category', 'panchayat');
      if (selectedState) url.searchParams.append('state', selectedState);
      if (selectedDistrict) url.searchParams.append('district', selectedDistrict);
      if (selectedSamiti) url.searchParams.append('panchayatSamiti', selectedSamiti);
      if (panchayatName) url.searchParams.append('panchayat', panchayatName);
      if (villageName) url.searchParams.append('village', villageName);
      if (wardNumber) url.searchParams.append('ward', wardNumber);
      if (boothNumber) url.searchParams.append('booth', boothNumber);

      const res = await fetch(url, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token') || 'DUMMY'}` } 
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setVoters([]);
        setDisplayedVoters([]);
      } else {
        const fetched = data.voters || [];
        setVoters(fetched);
        setPageCount(1);
        if (fetched.length === 0) {
          setError('No voters found for the selected parameters.');
        } else {
          setFetchSuccess(true);
          setTimeout(() => setFetchSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data due to network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Client-side Filtered Voters ---
  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const idMatch = !filters.id || (v.IDCARD || '').toString().toLowerCase().includes(filters.id.toLowerCase());
      const nameMatch = !filters.name || 
        (v.V_FNAME_EN || '').toString().toLowerCase().includes(filters.name.toLowerCase()) || 
        (v.V_LNAME_EN || '').toString().toLowerCase().includes(filters.name.toLowerCase()) || 
        (v.V_FNAME_HI || '').toString().includes(filters.name) || 
        (v.V_LNAME_HI || '').toString().includes(filters.name);
      
      const relMatch = !filters.relativeName || 
        (v.VR_FNAME_EN || '').toString().toLowerCase().includes(filters.relativeName.toLowerCase()) || 
        (v.VR_LNAME_EN || '').toString().toLowerCase().includes(filters.relativeName.toLowerCase()) || 
        (v.VR_FNAME_HI || '').toString().includes(filters.relativeName) || 
        (v.VR_LNAME_HI || '').toString().includes(filters.relativeName);

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
          sexMatch = vSex === 'F' || vSex === 'स्त्री' || vSex === 'महिला';
        }
      }

      const wardMatch = !filters.ward || String(v.WARDNO || v['PANCHAYAT WARD NO'] || '').trim() === filters.ward.trim();
      const villageMatch = !filters.village || String(v.VILLAGE || '').toLowerCase().includes(filters.village.toLowerCase());

      return idMatch && nameMatch && relMatch && houseMatch && ageMatch && minAgeMatch && maxAgeMatch && sexMatch && wardMatch && villageMatch;
    });
  }, [voters, filters]);

  useEffect(() => {
    setDisplayedVoters(filteredVoters.slice(0, pageCount * itemsPerPage));
  }, [filteredVoters, pageCount]);

  const loadMore = () => {
    setPageCount(prev => prev + 1);
  };

  // --- Slip Printing Handler ---
  const handlePrintSlip = (voter) => {
    setSelectedVoter(voter);
    setIsTemplateModalOpen(true);
  };

  const handleTemplateSelect = (optionNumber) => {
    setIsTemplateModalOpen(false);
    if (!selectedVoter) return;

    const mappedData = {
      wardNo: selectedVoter.WARDNO || selectedVoter['PANCHAYAT WARD NO'] || wardNumber || '-',
      partNo: selectedVoter.BOOTH_NO || selectedVoter.PARTNO || boothNumber || '-',
      serialNo: selectedVoter.SERIAL_NO || selectedVoter.IDCARD || '1',
      idNumber: selectedVoter.IDCARD || '-',
      voterName: selectedVoter.V_FNAME_EN ? `${selectedVoter.V_FNAME_EN} ${selectedVoter.V_LNAME_EN || ''}`.trim() : (selectedVoter.V_FNAME_HI || '-'),
      fatherHusbandName: selectedVoter.VR_FNAME_EN ? `${selectedVoter.VR_FNAME_EN} ${selectedVoter.VR_LNAME_EN || ''}`.trim() : (selectedVoter.VR_FNAME_HI || '-'),
      houseNo: selectedVoter.HOUSE_NO || '0',
      gender: selectedVoter.SEX === 'M' || selectedVoter.SEX === 'पुरुष' ? 'पुरुष' : (selectedVoter.SEX === 'F' || selectedVoter.SEX === 'स्त्री' ? 'स्त्री' : selectedVoter.SEX),
      age: selectedVoter.AGE || '18',
      pollingStation: selectedVoter.PS_HI || selectedVoter.PS_EN || `${selectedVoter['PANCHAYAT NAME'] || panchayatName} - Ward ${selectedVoter.WARDNO || wardNumber}`,
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

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-0 md:p-6 w-full">
        <div className="w-full max-w-7xl bg-white md:rounded-3xl shadow-xl shadow-slate-200/50 border-0 md:border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"></div>
          
          <div className="p-4 sm:p-8 md:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-violet-200/60 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                    Gram Panchayat Directory
                  </span>
                  {currentZillaNo && (
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                      Zilla Parishad No: {currentZillaNo}
                    </span>
                  )}
                  {currentSamitiNo && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Samiti No: {currentSamitiNo}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  Gram Panchayat Details & Voter Directory
                </h2>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">
                  Select parameters or upload village Excel data to automatically separate wards and generate slips.
                </p>
              </div>

              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/25 shrink-0">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Parameter Selection Form */}
            <form className="space-y-6 bg-slate-50/70 p-4 sm:p-6 rounded-3xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Location & Panchayat Parameters
                </h3>
                {availableWards.length > 0 && (
                  <span className="text-xs bg-violet-600 text-white font-bold px-3 py-1 rounded-full shadow-sm">
                    {availableWards.length} Wards Detected in Excel
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5">
                {/* 1. State */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">State</label>
                  <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm"
                  >
                    <option value="">{availableStates.length === 0 ? 'No State Data' : 'Select State'}</option>
                    {availableStates.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>

                {/* 2. District / Zilla Parishad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block truncate">
                    Zilla Parishad {currentZillaNo ? `(No. ${currentZillaNo})` : ''}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={availableDistricts.length === 0}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">Select Zilla Parishad</option>
                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* 3. Panchayat Samiti (City / Block) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block truncate">
                    Samiti {currentSamitiNo ? `(No. ${currentSamitiNo})` : ''}
                  </label>
                  <select
                    value={selectedSamiti}
                    onChange={handleSamitiChange}
                    disabled={availableSamitis.length === 0}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">All Samitis ({availableSamitis.length})</option>
                    {availableSamitis.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} {s.no ? `(No. ${s.no})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Gram Panchayat Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block truncate">Panchayat Name</label>
                  <select
                    value={panchayatName}
                    onChange={handlePanchayatChange}
                    disabled={availablePanchayats.length === 0}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">Select Panchayat</option>
                    {availablePanchayats.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* 5. Village */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block truncate">Village</label>
                  <select
                    value={villageName}
                    onChange={handleVillageChange}
                    disabled={!panchayatName || availableVillages.length === 0}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">All Villages ({availableVillages.length})</option>
                    {availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                {/* 6. Ward Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block truncate">Ward Number</label>
                  <select
                    value={wardNumber}
                    onChange={handleWardChange}
                    disabled={!panchayatName || availableWards.length === 0}
                    className="w-full bg-white border border-violet-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/30 shadow-sm disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">All Wards ({availableWards.length})</option>
                    {availableWards.map(w => <option key={w} value={w}>Ward {w}</option>)}
                  </select>
                </div>

                {/* 7. Booth / Part Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block truncate">Booth / Part No</label>
                  <select
                    value={boothNumber}
                    onChange={(e) => setBoothNumber(e.target.value)}
                    disabled={!panchayatName || availableBooths.length === 0}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">All Booths ({availableBooths.length})</option>
                    {availableBooths.map(b => <option key={b} value={b}>Booth {b}</option>)}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {availableWards.length > 0 && (
                    <div className="flex items-center gap-1.5 font-medium flex-wrap">
                      <span className="text-slate-700 font-bold">Quick Wards:</span>
                      <div className="flex flex-wrap gap-1">
                        {availableWards.map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setWardNumber(w === wardNumber ? '' : w)}
                            className={`px-2 py-0.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              wardNumber === w 
                                ? 'bg-violet-600 text-white font-bold shadow-sm' 
                                : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={fetchVoters}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-xl px-8 py-3.5 font-bold shadow-lg shadow-violet-500/30 active:scale-[0.98] transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
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
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-medium flex items-center gap-2.5 text-sm">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            {fetchSuccess && (
              <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 font-medium flex items-center gap-2.5 text-sm">
                <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Voter records loaded successfully!
              </div>
            )}

            {/* Voter Results Section */}
            {voters.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <span>Voter Records</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                        {filteredVoters.length} {filteredVoters.length === 1 ? 'elector' : 'electors'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Displaying verified parameters from Panchayat Directory
                    </p>
                  </div>
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating || filteredVoters.length === 0}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Slips / Batch PDF ({filteredVoters.length})
                  </button>
                </div>

                {/* In-Page Quick Filters */}
                <div className="bg-slate-50/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200/80 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-200/60">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter & Search Electors
                    </span>
                    {(filters.id || filters.name || filters.relativeName || filters.houseNo || filters.ward || filters.sex || filters.minAge || filters.maxAge) && (
                      <button
                        onClick={() => {
                          setFilters({ id: '', name: '', relativeName: '', houseNo: '', ward: '', sex: '', minAge: '', maxAge: '' });
                          setPageCount(1);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID / VID Card</label>
                      <input 
                        type="text" 
                        placeholder="Search ID..." 
                        value={filters.id} 
                        onChange={e => { setFilters(prev => ({...prev, id: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Voter Name</label>
                      <input 
                        type="text" 
                        placeholder="Name (EN/HI)..." 
                        value={filters.name} 
                        onChange={e => { setFilters(prev => ({...prev, name: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Relative Name</label>
                      <input 
                        type="text" 
                        placeholder="Father/Husband..." 
                        value={filters.relativeName} 
                        onChange={e => { setFilters(prev => ({...prev, relativeName: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">House No</label>
                      <input 
                        type="text" 
                        placeholder="House No..." 
                        value={filters.houseNo} 
                        onChange={e => { setFilters(prev => ({...prev, houseNo: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filter Ward</label>
                      <input 
                        type="text" 
                        placeholder="Ward..." 
                        value={filters.ward} 
                        onChange={e => { setFilters(prev => ({...prev, ward: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                      <select 
                        value={filters.sex} 
                        onChange={e => { setFilters(prev => ({...prev, sex: e.target.value})); setPageCount(1); }} 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="">All Genders</option>
                        <option value="M">Male (पुरुष)</option>
                        <option value="F">Female (महिला)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age Range</label>
                      <div className="flex gap-1.5">
                        <input 
                          type="number" 
                          placeholder="Min" 
                          value={filters.minAge} 
                          onChange={e => { setFilters(prev => ({...prev, minAge: e.target.value})); setPageCount(1); }} 
                          className="w-1/2 bg-white border border-slate-200/90 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                        />
                        <input 
                          type="number" 
                          placeholder="Max" 
                          value={filters.maxAge} 
                          onChange={e => { setFilters(prev => ({...prev, maxAge: e.target.value})); setPageCount(1); }} 
                          className="w-1/2 bg-white border border-slate-200/90 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comprehensive All-Columns Voter Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                  <table className="w-full text-left border-collapse min-w-[1400px]">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className="p-3">S.No / Booth</th>
                        <th className="p-3">IDCARD (EPIC)</th>
                        <th className="p-3">Voter Name (EN / HI)</th>
                        <th className="p-3">Relative Name (EN / HI)</th>
                        <th className="p-3">Relation</th>
                        <th className="p-3">Age / Sex</th>
                        <th className="p-3">House No</th>
                        <th className="p-3">Ward No</th>
                        <th className="p-3">Village & Section</th>
                        <th className="p-3">Gram Panchayat</th>
                        <th className="p-3">Panchayat Samiti</th>
                        <th className="p-3">Zilla Parishad</th>
                        <th className="p-3">Polling Station (PS)</th>
                        <th className="p-3">PC Name</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 divide-y divide-slate-100 text-xs">
                      {displayedVoters.map((v, i) => (
                        <tr key={i} className="hover:bg-violet-50/40 transition-colors">
                          <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                            <span className="text-violet-700">#{v.SERIAL_NO || (i + 1)}</span>
                            <span className="block text-[11px] text-slate-400">B: {v.BOOTH_NO || v.PARTNO || '-'}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                            {v.IDCARD || '-'}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">
                              {v.V_FNAME_EN || ''} {v.V_LNAME_EN || ''}
                            </div>
                            {(v.V_FNAME_HI || v.V_LNAME_HI) && (
                              <div className="text-slate-500 font-normal mt-0.5">
                                {v.V_FNAME_HI || ''} {v.V_LNAME_HI || ''}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-700">
                              {v.VR_FNAME_EN || ''} {v.VR_LNAME_EN || ''}
                            </div>
                            {(v.VR_FNAME_HI || v.VR_LNAME_HI) && (
                              <div className="text-slate-400 text-[11px] mt-0.5">
                                {v.VR_FNAME_HI || ''} {v.VR_LNAME_HI || ''}
                              </div>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">
                              {v.RELATION || 'Relative'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-700">{v.AGE || '-'} Y</span> / {' '}
                            <span className={`font-medium ${v.SEX === 'M' || v.SEX === 'पुरुष' ? 'text-blue-600' : 'text-pink-600'}`}>
                              {v.SEX === 'M' || v.SEX === 'पुरुष' ? 'M' : (v.SEX === 'F' || v.SEX === 'स्त्री' || v.SEX === 'महिला' ? 'F' : v.SEX)}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                            {v.HOUSE_NO || '-'}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-violet-100 text-violet-800 font-bold px-2.5 py-0.5 rounded-full text-xs">
                              Ward {v.WARDNO || v['PANCHAYAT WARD NO'] || '-'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{v.VILLAGE || '-'}</div>
                            {v.SECTION && <div className="text-slate-400 text-[11px]">Sec: {v.SECTION}</div>}
                          </td>
                          <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                            {v['PANCHAYAT NAME'] || panchayatName || '-'}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">
                              {v['PANCHAYAT SAMITI NAME'] || selectedSamiti || '-'}
                            </div>
                            {v['PANCHAYAT SAMITI NO'] && (
                              <span className="text-[10px] text-emerald-700 font-bold">No. {v['PANCHAYAT SAMITI NO']}</span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">
                              {v['ZILLA PARISHAD NAME'] || selectedDistrict || '-'}
                            </div>
                            {v['ZILLA PARISHAD NO'] && (
                              <span className="text-[10px] text-blue-700 font-bold">No. {v['ZILLA PARISHAD NO']}</span>
                            )}
                          </td>
                          <td className="p-3 max-w-[200px] truncate" title={v.PS_HI || v.PS_EN}>
                            <div className="truncate text-slate-800">{v.PS_EN || v.PS_HI || '-'}</div>
                            {v.PS_HI && <div className="truncate text-slate-400 text-[11px]">{v.PS_HI}</div>}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="text-slate-600 font-medium">{v['PC NAME'] || '-'}</span>
                            {v['PC NO'] && <span className="text-[10px] text-slate-400 ml-1">({v['PC NO']})</span>}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handlePrintSlip(v)}
                                className="bg-violet-600 hover:bg-violet-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Slip
                              </button>
                              <button
                                onClick={() => setDetailModalVoter(v)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                title="View All Columns"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination load more */}
                {filteredVoters.length > displayedVoters.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMore}
                      className="bg-white border-2 border-violet-200 hover:border-violet-600 text-violet-700 hover:bg-violet-50 px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm"
                    >
                      Load More Voters ({displayedVoters.length} of {filteredVoters.length})
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Voter Full Profile Details Modal */}
      {detailModalVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="text-lg font-bold">Voter Complete Profile</h3>
                <p className="text-violet-200 text-xs">All fields matching Excel data</p>
              </div>
              <button 
                onClick={() => setDetailModalVoter(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Personal Info */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2.5 text-xs">Personal Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">IDCARD / EPIC</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">{detailModalVoter.IDCARD || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Voter Name (EN)</span>
                    <span className="font-bold text-slate-800">{detailModalVoter.V_FNAME_EN} {detailModalVoter.V_LNAME_EN}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Voter Name (HI)</span>
                    <span className="font-bold text-slate-800">{detailModalVoter.V_FNAME_HI} {detailModalVoter.V_LNAME_HI || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Relative Name (EN)</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.VR_FNAME_EN} {detailModalVoter.VR_LNAME_EN}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Relative Name (HI)</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.VR_FNAME_HI} {detailModalVoter.VR_LNAME_HI || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Relation</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.RELATION || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Age & Gender</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.AGE} Y / {detailModalVoter.SEX}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">House No</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.HOUSE_NO || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Mobile / Pincode</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.MOBILE_1 || detailModalVoter.MOBILE_NO || '—'} / {detailModalVoter.PINCODE || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Panchayat & Ward Info */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2.5 text-xs">Panchayat & Ward Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-violet-50/70 p-3 rounded-xl border border-violet-100">
                    <span className="text-violet-600 block text-[11px] font-bold">Ward Number</span>
                    <span className="font-extrabold text-violet-900 text-sm">Ward {detailModalVoter.WARDNO || detailModalVoter['PANCHAYAT WARD NO']}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Booth / Part No</span>
                    <span className="font-bold text-slate-800">Booth {detailModalVoter.BOOTH_NO || detailModalVoter.PARTNO}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Serial No</span>
                    <span className="font-bold text-slate-800">#{detailModalVoter.SERIAL_NO || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Gram Panchayat</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter['PANCHAYAT NAME'] || panchayatName}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Village</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.VILLAGE || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Section</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter.SECTION || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Panchayat Samiti</span>
                    <span className="font-semibold text-slate-800">
                      {detailModalVoter['PANCHAYAT SAMITI NAME'] || selectedSamiti}
                      {detailModalVoter['PANCHAYAT SAMITI NO'] && ` (No. ${detailModalVoter['PANCHAYAT SAMITI NO']})`}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Zilla Parishad</span>
                    <span className="font-semibold text-slate-800">
                      {detailModalVoter['ZILLA PARISHAD NAME'] || selectedDistrict}
                      {detailModalVoter['ZILLA PARISHAD NO'] && ` (No. ${detailModalVoter['ZILLA PARISHAD NO']})`}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">PC Name & No</span>
                    <span className="font-semibold text-slate-800">{detailModalVoter['PC NAME'] || '—'} ({detailModalVoter['PC NO'] || '—'})</span>
                  </div>
                </div>
              </div>

              {/* Polling Station */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-bold uppercase mb-1">Polling Station</span>
                <p className="font-bold text-slate-800">{detailModalVoter.PS_EN || '—'}</p>
                {detailModalVoter.PS_HI && <p className="text-slate-600 mt-1">{detailModalVoter.PS_HI}</p>}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  const v = detailModalVoter;
                  setDetailModalVoter(null);
                  handlePrintSlip(v);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-colors"
              >
                Print Slip for this Voter
              </button>
              <button 
                onClick={() => setDetailModalVoter(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Print Modal Elements */}
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
        wardNo={wardNumber || 'All'}
        boothNumber={boothNumber || 'All'}
      />
    </>
  );
}

export default PhotoGramPanchayat;
