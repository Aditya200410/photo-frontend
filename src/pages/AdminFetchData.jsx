import { useState, useEffect } from 'react';

function AdminFetchData() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fetches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecords(data);
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
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Fetch Records</h2>
              <p className="text-slate-500 mt-2">Log of all active users searching and fetching voter data</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 font-bold shadow-sm">
              {records.length} Total Fetches
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 rounded-tl-lg">Account</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location Info (State/District/Area)</th>
                  <th className="p-4">Ward/Booth</th>
                  <th className="p-4 rounded-tr-lg">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr><td colSpan="5" className="p-4 text-center">Loading records...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center text-slate-500">No records found.</td></tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.account === 'Guest User' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {r.account || 'Guest User'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold capitalize text-slate-700">{r.category}</td>
                      <td className="p-4 text-sm">
                        <div className="text-slate-800">{r.state !== '-' ? r.state : ''} {r.district !== '-' ? `(${r.district})` : ''}</div>
                        <div className="text-slate-500 mt-1">{r.assembly !== '-' ? r.assembly : ''}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {r.ward && r.ward !== '-' ? <span className="block font-medium">Ward {r.ward}</span> : null}
                          {r.booth && r.booth !== '-' ? <span className="block font-medium">Booth {r.booth}</span> : null}
                          {(!r.ward || r.ward === '-') && (!r.booth || r.booth === '-') ? 'N/A' : null}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">{new Date(r.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFetchData;
