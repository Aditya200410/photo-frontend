import { useState, useEffect } from 'react';
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
  const [displayedVoters, setDisplayedVoters] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const itemsPerPage = 10;

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [availableFiles, setAvailableFiles] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/excel-files/nagar-nigam`)
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
  const availableStateCodes = [...new Set(availableFiles.map(f => f.state).filter(Boolean))];
  const availableStates = State.getStatesOfCountry('IN').filter(s => availableStateCodes.includes(s.isoCode));

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
    if (voters.length === 0) return;
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
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/voters`);
      url.searchParams.append('category', 'nagar-nigam');
      url.searchParams.append('state', selectedState);
      url.searchParams.append('district', selectedDistrict);
      url.searchParams.append('city', cityName);
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
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Nagar Nigam Details</h2>
                <p className="text-slate-500 mt-2">Generate PDF based on Booth Number</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">State</label>
                  <div className="relative">
                    <select
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer"
                    >
                      <option value="">{availableStates.length === 0 ? 'No State Data Uploaded' : 'Select State'}</option>
                      {availableStates.map(state => (
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
                      disabled={!selectedState || availableDistricts.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className="text-sm font-semibold text-slate-700 block">City</label>
                  <div className="relative">
                    <select
                      value={cityName}
                      onChange={handleCityChange}
                      disabled={!selectedDistrict || availableCities.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableCities.length === 0 && selectedDistrict ? 'No City Data Uploaded' : 'Select City'}</option>
                      {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
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
                      disabled={!cityName || availableWards.length === 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableWards.length === 0 && cityName ? 'No Ward Data Uploaded' : 'Select Ward Number'}</option>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{availableBooths.length === 0 && wardNumber ? 'No Booth Data Uploaded' : 'Select Booth Number'}</option>
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
                  className="w-full lg:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl px-10 py-4 font-bold shadow-lg shadow-emerald-500/30 transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
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

            {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

            {voters.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Nagar Nigam Voters ({voters.length} entries)</h3>
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
                        <th className="p-4 rounded-tl-lg">SRNO / VID</th>
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
                            {v.SRNO || '-'}<br />
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
                            {v.FAGE || '-'} Y / {v.FGENDER === 'M' || v.FGENDER === 'पुरुष' ? 'Male' : (v.FGENDER === 'F' || v.FGENDER === 'स्त्री' ? 'Female' : v.FGENDER)}
                          </td>
                          <td className="p-4 text-slate-600">{v.FHOUSENO || '-'}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handlePrintSlip(v)}
                              className="bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
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
                      className="bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
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
        assemblyName={cityName}
        wardNo={wardNumber}
        boothNumber={boothNumber}
      />
    </>
  );
}

export default PhotoNagarNigam;
