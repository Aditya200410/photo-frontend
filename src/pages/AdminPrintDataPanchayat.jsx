import { Link } from 'react-router-dom';

function AdminPrintDataPanchayat() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-violet-700"></div>
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gram Panchayat Print Records</h2>
              <p className="text-slate-500 mt-2">View all directory generation activities for Gram Panchayat</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 rounded-tl-lg">ID</th>
                  <th className="p-4">Booth/Ward</th>
                  <th className="p-4">Voter Name</th>
                  <th className="p-4">Pages</th>
                  <th className="p-4 rounded-tr-lg">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-100 bg-white">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-500">10025</td>
                  <td className="p-4">Ward 2, Booth 3</td>
                  <td className="p-4 font-medium">Sunita Devi</td>
                  <td className="p-4 text-slate-500">4</td>
                  <td className="p-4 text-slate-500 text-sm">2026-09-24 16:00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100">
          <Link to="/admin/print-data" className="text-violet-600 font-medium hover:text-violet-800 flex items-center gap-2 transition-colors duration-200 w-fit">
            &larr; Back to Print Data Options
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminPrintDataPanchayat;
