import fs from 'fs';
import path from 'path';

const basePath = 'c:/Users/adity/Desktop/photo id/photo-frontend/src/pages';

const configs = [
  { name: 'AdminPrintDataAssembly', title: 'Assembly Print Records', type: 'assembly' },
  { name: 'AdminPrintDataNagarNigam', title: 'Nagar Nigam Print Records', type: 'nagar-nigam' },
  { name: 'AdminPrintDataPanchayat', title: 'Gram Panchayat Print Records', type: 'panchayat' }
];

configs.forEach(conf => {
  const code = `import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ${conf.name}() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prints\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter dynamically based on type, case-insensitive, AND include 'option' (Slip Prints)
          setRecords(data.filter(r => {
            if (!r.option_type) return false;
            const type = r.option_type.toLowerCase();
            return type.includes('${conf.type.split('-')[0]}') || type.includes('option');
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
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">${conf.title}</h2>
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
                  <th className="p-4 rounded-tr-lg">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr><td colSpan="6" className="p-4 text-center">Loading records...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan="6" className="p-4 text-center text-slate-500">No records found.</td></tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="text-sm font-semibold text-slate-700">{r.id}</div>
                        <div className="text-xs font-bold text-blue-600 uppercase mt-1">{r.option_type === 'Option 1' ? 'Slip Print' : 'Directory'}</div>
                      </td>
                      <td className="p-4">
                        <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${r.account === 'Guest User' ? 'bg-slate-100 text-slate-800' : 'bg-purple-100 text-purple-800'}\`}>
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
    </div>
  );
}

export default ${conf.name};
`;

  fs.writeFileSync(path.join(basePath, conf.name + '.jsx'), code);
  console.log('Written', conf.name);
});
