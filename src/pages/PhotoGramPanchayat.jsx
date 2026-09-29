import { useState, useEffect } from 'react';
import { State, City } from 'country-state-city';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import SlipPrintManager from '../components/SlipPrintManager';
import BatchSlipPrintManager from '../components/BatchSlipPrintManager';

function PhotoGramPanchayat({ onBack }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [panchayatName, setPanchayatName] = useState('');
  const [villageName, setVillageName] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [boothNumber, setBoothNumber] = useState('');

  const [voters, setVoters] = useState([]);
  const [displayedVoters, setDisplayedVoters] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const itemsPerPage = 10;

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [availableFiles, setAvailableFiles] = useState([]);

  useEffect(() => {
    setStates(State.getStatesOfCountry('IN'));
    fetch('http://localhost:5000/api/excel-files/panchayat')
      .then(res => res.json())
      .then(data => setAvailableFiles(data))
      .catch(err => console.error(err));
  }, []);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    if (stateCode) {
      setDistricts(City.getCitiesOfState('IN', stateCode));
    } else {
      setDistricts([]);
    }
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
  const validFiles = availableFiles.filter(f => f.state === selectedState && f.district === selectedDistrict);
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
    if (voters.length === 0) return;
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
      const url = new URL('http://localhost:5000/api/voters');
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
        setDisplayedVoters((data.voters || []).slice(0, itemsPerPage));
        setPageCount(1);
        if (data.voters.length === 0) setError('No voters found for this location');
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
    setDisplayedVoters(voters.slice(0, nextPage * itemsPerPage));
    setPageCount(nextPage);
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 w-full">
        <div className="w-full max-w-2xl lg:max-w-6xl xl:max-w-7xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-purple-500"></div>
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gram Panchayat Details</h2>
                <p className="text-slate-500 mt-2">Generate PDF based on Booth Number</p>
              </div>
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 shadow-inner">
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
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
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
                      disabled={!selectedState}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district.name} value={district.name}>{district.name}</option>
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

              <div className="pt-2 lg:pt-4 flex justify-center lg:justify-end gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={fetchVoters}
                  disabled={isLoading}
                  className="w-full lg:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl px-10 py-4 font-bold shadow-lg shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
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

                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                      const XLSX = await import('xlsx');
                      const response = await fetch('/FinalDetailsofVoter_ENGLISH.xlsx');
                      if (!response.ok) throw new Error('Failed to load FinalDetailsofVoter_ENGLISH.xlsx');
                      const arrayBuffer = await response.arrayBuffer();
                      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                      const mappedData = rawData.map(row => ({
                        ...row,
                        IDCARD: row.IDCARD || row.VID || '-',
                        V_FNAME_EN: row.V_FNAME_EN || row.EFVNAME || '-',
                        V_LNAME_EN: row.V_LNAME_EN || '',
                        V_FNAME_HI: row.V_FNAME_HI || row.FVNAME || '-',
                        V_LNAME_HI: row.V_LNAME_HI || '',
                        VR_FNAME_EN: row.VR_FNAME_EN || row.EFRNAME || '-',
                        VR_LNAME_EN: row.VR_LNAME_EN || '',
                        VR_FNAME_HI: row.VR_FNAME_HI || row.FRNAME || '-',
                        VR_LNAME_HI: row.VR_LNAME_HI || '',
                        AGE: row.AGE || row.MAGE || row.FAGE || '-',
                        SEX: row.SEX || row.MSEX || row.FGENDER || '-',
                        HOUSE_NO: row.HOUSE_NO || row.MHOUSENO || row.FHOUSENO || '-'
                      }));
                      setVoters(mappedData || []);
                      setDisplayedVoters((mappedData || []).slice(0, itemsPerPage));
                      setPageCount(1);
                      if (mappedData.length === 0) setError('No voters found in test data');
                      setPanchayatName('TEST PANCHAYAT');
                      setVillageName('TEST VILLAGE');
                      setWardNumber('1');
                      setBoothNumber('001');
                    } catch (err) {
                      console.error(err);
                      setError('Failed to load local test data: ' + err.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full lg:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-10 py-4 font-bold shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  Load Local Test Data
                </button>
              </div>
            </form>

            {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

            {voters.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Panchayat Voters ({voters.length} entries)</h3>
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-xl font-bold shadow-md shadow-violet-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isGenerating ? 'Generating...' : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Generate PDF
                      </>
                    )}
                  </button>
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
                {voters.length > displayedVoters.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={loadMore}
                      className="bg-white border border-slate-200 text-violet-600 hover:bg-violet-50 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      Load More Entries
                    </button>
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
        voters={voters}
        assemblyName={panchayatName}
        wardNo={wardNumber}
        boothNumber={boothNumber}
      />
    </>
  );
}

export default PhotoGramPanchayat;
