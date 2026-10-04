import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminPrintDataAssembly() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prints`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecords(data.filter(r => {
            if (!r.option_type) return false;
            const type = r.option_type.toLowerCase();
            return type.includes('assembly') || type.includes('option');
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-3 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="p-4 sm:p-8 md:p-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Assembly Print Records</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">View all directory and slip generation activities for this category</p>
            </div>
            <div className="self-start sm:self-auto bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs sm:text-sm font-bold shadow-sm whitespace-nowrap">
              {records.length} Records
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner">
            <table className="w-full min-w-[680px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  <th className="p-3 sm:p-4 rounded-tl-lg">ID / Type</th>
                  <th className="p-3 sm:p-4">Account</th>
                  <th className="p-3 sm:p-4">Location Info</th>
                  <th className="p-3 sm:p-4">Voter Name / Head</th>
                  <th className="p-3 sm:p-4">Pages</th>
                  <th className="p-3 sm:p-4">Timestamp</th>
                  <th className="p-3 sm:p-4 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-100 bg-white text-xs sm:text-sm">
                {loading ? (
                  <tr><td colSpan="7" className="p-6 text-center text-slate-500">Loading records...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan="7" className="p-6 text-center text-slate-500">No records found.</td></tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="font-semibold text-slate-700">{r.id}</div>
                        <div className="text-[11px] font-bold text-blue-600 uppercase mt-0.5">{r.option_type?.includes('Option') ? 'Slip Print' : 'Directory'}</div>
                      </td>
                      <td className="p-3 sm:p-4 max-w-[200px]">
                        {r.accountName ? (
                          <div>
                            <div className="font-semibold text-slate-800 truncate">{r.accountName}</div>
                            <div className="text-xs text-purple-700 font-medium truncate">{r.account}</div>
                            {r.accountPhone && <div className="text-[11px] text-slate-400 font-mono mt-0.5">{r.accountPhone}</div>}
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.account === 'Guest User' ? 'bg-slate-100 text-slate-800' : 'bg-purple-100 text-purple-800'}`}>
                            {r.account || 'Guest User'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <div>
                          {r.ward_no && r.ward_no !== '-' ? <span className="mr-2">Ward {r.ward_no}</span> : null}
                          {r.part_no && r.part_no !== '-' ? <span>Booth {r.part_no}</span> : null}
                          {(!r.ward_no || r.ward_no === '-') && (!r.part_no || r.part_no === '-') ? <span className="text-slate-400">N/A</span> : null}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 font-medium max-w-[160px] truncate">{r.voter_name || 'N/A'}</td>
                      <td className="p-3 sm:p-4 text-slate-600 font-semibold">{r.pages_count || 1}</td>
                      <td className="p-3 sm:p-4 text-slate-500 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                      <td className="p-3 sm:p-4">
                        <button 
                          onClick={() => setSelectedRecord(r)}
                          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 px-2.5 sm:px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                        >
                          View More
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-5 border-t border-slate-100">
          <Link to="/admin/print-data" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-2 transition-colors duration-200 w-fit">
            &larr; Back to Print Data Options
          </Link>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-slate-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center shrink-0">
              <div className="pr-3">
                <h3 className="text-lg sm:text-xl font-bold text-white">Print Record Details</h3>
                <p className="text-blue-200 text-xs mt-0.5 break-all">ID: {selectedRecord.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl p-2 transition shrink-0"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm">

              {/* Account Details */}
              <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-3.5 sm:p-4">
                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2.5 sm:mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Account Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold mb-0.5">Full Name</span>
                    <span className="font-semibold text-slate-800 break-words">{selectedRecord.accountName || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold mb-0.5">Email</span>
                    <span className="font-semibold text-slate-800 break-all">{selectedRecord.account || 'Guest User'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold mb-0.5">Phone</span>
                    <span className="font-semibold text-slate-800 break-words">{selectedRecord.accountPhone || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold mb-0.5">UTR / Payment Ref</span>
                    <span className="font-semibold text-slate-800 font-mono break-all">{selectedRecord.accountUtr || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Record Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="block text-slate-400 text-xs font-semibold mb-0.5">Timestamp</span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">{new Date(selectedRecord.timestamp).toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="block text-slate-400 text-xs font-semibold mb-0.5">Print Type</span>
                  <span className="font-bold text-blue-600 uppercase text-xs">{selectedRecord.option_type?.includes('Option') ? 'Slip Print' : 'Directory'}</span>
                </div>
              </div>

              {/* Location Data */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location Data</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {selectedRecord.state && <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><span className="block text-slate-400 text-xs font-semibold mb-0.5">State</span><span className="font-semibold text-slate-800 break-words">{selectedRecord.state}</span></div>}
                  {selectedRecord.district && <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><span className="block text-slate-400 text-xs font-semibold mb-0.5">District</span><span className="font-semibold text-slate-800 break-words">{selectedRecord.district}</span></div>}
                  {selectedRecord.assembly && <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><span className="block text-slate-400 text-xs font-semibold mb-0.5">Assembly</span><span className="font-semibold text-slate-800 break-words">{selectedRecord.assembly}</span></div>}
                  {selectedRecord.city && <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><span className="block text-slate-400 text-xs font-semibold mb-0.5">City</span><span className="font-semibold text-slate-800 break-words">{selectedRecord.city}</span></div>}
                  {selectedRecord.panchayat && <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><span className="block text-slate-400 text-xs font-semibold mb-0.5">Panchayat</span><span className="font-semibold text-slate-800 break-words">{selectedRecord.panchayat}</span></div>}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><span className="block text-slate-400 text-xs font-semibold mb-0.5">Ward Number</span><span className="font-semibold text-slate-800">{selectedRecord.ward_no || '—'}</span></div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><span className="block text-slate-400 text-xs font-semibold mb-0.5">Booth / Part No</span><span className="font-semibold text-slate-800">{selectedRecord.part_no || '—'}</span></div>
                </div>
              </div>

              {/* Target Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 sm:col-span-1">
                    <span className="block text-slate-400 text-xs font-semibold mb-0.5">Target Name</span>
                    <span className="font-semibold text-slate-800 break-words">{selectedRecord.voter_name || 'Batch Print'}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="block text-slate-400 text-xs font-semibold mb-0.5">Serial No</span>
                    <span className="font-semibold text-slate-800 break-words">{selectedRecord.serial_no || 'ALL'}</span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="block text-emerald-600 text-xs font-semibold mb-0.5">Pages Generated</span>
                    <span className="font-bold text-emerald-700 text-base sm:text-lg">{selectedRecord.pages_count} Pages</span>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedRecord(null)}
                className="w-full sm:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPrintDataAssembly;
