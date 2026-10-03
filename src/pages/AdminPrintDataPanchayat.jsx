import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminPrintDataPanchayat() {
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
            return type.includes('panchayat') || type.includes('option');
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gram Panchayat Print Records</h2>
              <p className="text-slate-500 mt-2">View all directory and slip generation activities for this category</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 rounded-tl-lg">ID / Type</th>
                  <th className="p-4">Account</th>
                  <th className="p-4">Location Info</th>
                  <th className="p-4">Voter Name / Head</th>
                  <th className="p-4">Pages</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr><td colSpan="7" className="p-4 text-center">Loading records...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan="7" className="p-4 text-center text-slate-500">No records found.</td></tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="text-sm font-semibold text-slate-700">{r.id}</div>
                        <div className="text-xs font-bold text-blue-600 uppercase mt-1">{r.option_type.includes('Option') ? 'Slip Print' : 'Directory'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.account === 'Guest User' ? 'bg-slate-100 text-slate-800' : 'bg-purple-100 text-purple-800'}`}>
                          {r.account || 'Guest User'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {r.ward_no && r.ward_no !== '-' ? <span className="mr-2">Ward {r.ward_no}</span> : null}
                          {r.part_no && r.part_no !== '-' ? <span>Booth {r.part_no}</span> : null}
                          {(!r.ward_no || r.ward_no === '-') && (!r.part_no || r.part_no === '-') ? 'N/A' : null}
                        </div>
                      </td>
                      <td className="p-4 font-medium">{r.voter_name || 'N/A'}</td>
                      <td className="p-4 text-slate-500">{r.pages_count || 1}</td>
                      <td className="p-4 text-slate-500 text-sm">{new Date(r.timestamp).toLocaleString()}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => setSelectedRecord(r)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
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
        
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100">
          <Link to="/admin/print-data" className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-2 transition-colors duration-200 w-fit">
            &larr; Back to Print Data Options
          </Link>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Print Record Details</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div><span className="block text-slate-500 font-semibold mb-1">Record ID</span><span className="font-medium text-slate-800">{selectedRecord.id}</span></div>
                <div><span className="block text-slate-500 font-semibold mb-1">Timestamp</span><span className="font-medium text-slate-800">{new Date(selectedRecord.timestamp).toLocaleString()}</span></div>
                
                <div><span className="block text-slate-500 font-semibold mb-1">Account Info</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedRecord.account === 'Guest User' ? 'bg-slate-100 text-slate-800' : 'bg-purple-100 text-purple-800'}`}>
                    {selectedRecord.account || 'Guest User'}
                  </span>
                </div>
                <div><span className="block text-slate-500 font-semibold mb-1">Print Type</span><span className="font-medium text-blue-600 uppercase text-xs font-bold">{selectedRecord.option_type.includes('Option') ? 'Slip Print' : 'Directory'}</span></div>

                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <h4 className="text-base font-bold text-slate-800 mb-3">Location Data</h4>
                </div>
                
                {selectedRecord.state && <div><span className="block text-slate-500 font-semibold mb-1">State</span><span className="font-medium text-slate-800">{selectedRecord.state}</span></div>}
                {selectedRecord.district && <div><span className="block text-slate-500 font-semibold mb-1">District</span><span className="font-medium text-slate-800">{selectedRecord.district}</span></div>}
                {selectedRecord.assembly && <div><span className="block text-slate-500 font-semibold mb-1">Assembly</span><span className="font-medium text-slate-800">{selectedRecord.assembly}</span></div>}
                {selectedRecord.city && <div><span className="block text-slate-500 font-semibold mb-1">City</span><span className="font-medium text-slate-800">{selectedRecord.city}</span></div>}
                {selectedRecord.panchayat && <div><span className="block text-slate-500 font-semibold mb-1">Panchayat</span><span className="font-medium text-slate-800">{selectedRecord.panchayat}</span></div>}
                
                <div><span className="block text-slate-500 font-semibold mb-1">Ward Number</span><span className="font-medium text-slate-800">{selectedRecord.ward_no || 'N/A'}</span></div>
                <div><span className="block text-slate-500 font-semibold mb-1">Booth / Part No</span><span className="font-medium text-slate-800">{selectedRecord.part_no || 'N/A'}</span></div>
                
                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <h4 className="text-base font-bold text-slate-800 mb-3">Target Details</h4>
                </div>
                
                <div><span className="block text-slate-500 font-semibold mb-1">Target Name</span><span className="font-medium text-slate-800">{selectedRecord.voter_name || 'N/A'}</span></div>
                <div><span className="block text-slate-500 font-semibold mb-1">Target Serial No</span><span className="font-medium text-slate-800">{selectedRecord.serial_no || 'ALL'}</span></div>
                <div><span className="block text-slate-500 font-semibold mb-1">Pages Generated</span><span className="font-medium text-slate-800">{selectedRecord.pages_count} Pages</span></div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
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

export default AdminPrintDataPanchayat;
