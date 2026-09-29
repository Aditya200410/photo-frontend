import { useState, useEffect } from 'react';
import { State, City } from 'country-state-city';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import SlipPrintManager from '../components/SlipPrintManager';
import BatchSlipPrintManager from '../components/BatchSlipPrintManager';

function PhotoAssembly({ onBack }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');

  const [voters, setVoters] = useState([]);
  const [displayedVoters, setDisplayedVoters] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const itemsPerPage = 10;

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [assemblyName, setAssemblyName] = useState('');
  const [boothNumber, setBoothNumber] = useState('');

  const [availableFiles, setAvailableFiles] = useState([]);

  // Modal State for Slip Printing
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState(false);
  const [selectedOptionTemplate, setSelectedOptionTemplate] = useState(1);
  const [mappedVoterData, setMappedVoterData] = useState({});

  useEffect(() => {
    setStates(State.getStatesOfCountry('IN'));
    fetch('http://localhost:5000/api/excel-files/assembly')
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
    setAssemblyName('');
    setBoothNumber('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setAssemblyName('');
    setBoothNumber('');
  };

  const handleAssemblyChange = (e) => {
    setAssemblyName(e.target.value);
    setBoothNumber('');
  };

  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Compute available options based on selections
  const validFiles = availableFiles.filter(f => f.state === selectedState && f.district === selectedDistrict);
  const availableAssemblies = [...new Set(validFiles.map(f => f.assembly).filter(Boolean))];

  const boothFiles = validFiles.filter(f => f.assembly === assemblyName);
  const availableBooths = [...new Set(boothFiles.map(f => f.booth).filter(Boolean))];

  const handlePrintSlip = (voter) => {
    setSelectedVoter(voter);
    setIsTemplateModalOpen(true);
  };

  const handleTemplateSelect = (optionNumber) => {
    setIsTemplateModalOpen(false);
    if (!selectedVoter) return;

    const mappedData = {
      wardNo: '-', // Not in assembly
      partNo: boothNumber,
      serialNo: selectedVoter.ID || selectedVoter.VID || '1',
      idNumber: selectedVoter.VID || '-',
      voterName: selectedVoter.EFVNAME || selectedVoter.FVNAME || '-',
      fatherHusbandName: selectedVoter.EFRNAME || selectedVoter.FRNAME || '-',
      houseNo: selectedVoter.MHOUSENO || '0',
      gender: selectedVoter.MSEX === 'M' || selectedVoter.MSEX === 'पुरुष' ? 'पुरुष' : (selectedVoter.MSEX === 'F' || selectedVoter.MSEX === 'स्त्री' ? 'स्त्री' : selectedVoter.MSEX),
      age: selectedVoter.MAGE || '18',
      pollingStation: `${assemblyName} - ${boothNumber}`,
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
    if (!selectedState || !selectedDistrict || !assemblyName || !boothNumber) {
      alert("Please fill all fields first");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url = new URL('http://localhost:5000/api/voters');
      url.searchParams.append('category', 'assembly');
      url.searchParams.append('state', selectedState);
      url.searchParams.append('district', selectedDistrict);
      url.searchParams.append('assembly', assemblyName);
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
        <div className="w-full max-w-2xl lg:max-w-5xl xl:max-w-6xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Assembly Details</h2>
                <p className="text-slate-500 mt-2">Generate PDF based on Booth Number</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">State</label>
                  <div className="relative">
                    <select
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className="text-sm font-semibold text-slate-700 block">Assembly Name</label>
                  <div className="relative">
                    <select
                      value={assemblyName}
                      onChange={handleAssemblyChange}
                      disabled={!selectedDistrict || availableAssemblies.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableAssemblies.length === 0 && selectedDistrict ? 'No Assembly Data Uploaded' : 'Select Assembly'}</option>
                      {availableAssemblies.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Booth Number & Name</label>
                  <div className="relative">
                    <select
                      value={boothNumber}
                      onChange={(e) => setBoothNumber(e.target.value)}
                      disabled={!assemblyName || availableBooths.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableBooths.length === 0 && assemblyName ? 'No Booth Data Uploaded' : 'Select Booth Number'}</option>
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
                  className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl px-10 py-4 font-bold shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
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
                      const response = await fetch('/AJMER.xlsx');
                      if (!response.ok) throw new Error('Failed to load AJMER.xlsx');
                      const arrayBuffer = await response.arrayBuffer();
                      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                      const mappedData = rawData.map(row => ({
                        ...row,
                        VID: row.VID || row.IDCARD || '-',
                        ID: row.ID || row.SRNO || '-',
                        EFVNAME: row.EFVNAME || row.V_FNAME_EN || '-',
                        FVNAME: row.FVNAME || row.V_FNAME_HI || '-',
                        EFRNAME: row.EFRNAME || row.VR_FNAME_EN || '-',
                        FRNAME: row.FRNAME || row.VR_FNAME_HI || '-',
                        MAGE: row.MAGE || row.FAGE || row.AGE || '-',
                        MSEX: row.MSEX || row.FGENDER || row.SEX || '-',
                        MHOUSENO: row.MHOUSENO || row.FHOUSENO || row.HOUSE_NO || '-'
                      }));
                      setVoters(mappedData || []);
                      setDisplayedVoters((mappedData || []).slice(0, itemsPerPage));
                      setPageCount(1);
                      if (mappedData.length === 0) setError('No voters found in test data');
                      setAssemblyName('AJMER TEST');
                      setBoothNumber('001');
                    } catch (err) {
                      console.error(err);
                      setError('Failed to load local test data: ' + err.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-10 py-4 font-bold shadow-lg shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  Load Local Test Data
                </button>
              </div>
            </form>

            {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

            {voters.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Voters Directory ({voters.length} entries)</h3>
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
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
                        <th className="p-4 rounded-tl-lg">ID / VID</th>
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
                          <td className="p-4 text-sm font-medium text-slate-800">
                            {v.ID || '-'}<br />
                            <span className="text-slate-500 text-xs">{v.VID || '-'}</span>
                          </td>
                          <td className="p-4 font-medium text-slate-800">
                            {v.EFVNAME || '-'}<br />
                            <span className="text-slate-500 text-sm font-normal">{v.FVNAME || '-'}</span>
                          </td>
                          <td className="p-4">
                            {v.EFRNAME || '-'}<br />
                            <span className="text-slate-500 text-sm">{v.FRNAME || '-'}</span>
                          </td>
                          <td className="p-4 text-slate-600">
                            {v.MAGE || '-'} Y / {v.MSEX === 'M' || v.MSEX === 'पुरुष' ? 'Male' : (v.MSEX === 'F' || v.MSEX === 'स्त्री' ? 'Female' : v.MSEX)}
                          </td>
                          <td className="p-4 text-slate-600">{v.MHOUSENO || '-'}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handlePrintSlip(v)}
                              className="bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
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
                      className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
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
        assemblyName={assemblyName}
        boothNumber={boothNumber}
        wardNo="-"
      />
    </>
  );
}

export default PhotoAssembly;
