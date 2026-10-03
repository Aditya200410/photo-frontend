import fs from 'fs';
import path from 'path';

const appPath = 'c:/Users/adity/Desktop/photo id/photo-frontend/src/App.jsx';
let content = fs.readFileSync(appPath, 'utf-8');

if (!content.includes('AdminFetchData')) {
  content = content.replace(
    "import AdminPrintDataPanchayat from './pages/AdminPrintDataPanchayat';",
    "import AdminPrintDataPanchayat from './pages/AdminPrintDataPanchayat';\nimport AdminFetchData from './pages/AdminFetchData';"
  );
  
  content = content.replace(
    "<Route path=\"print-data/panchayat\" element={<AdminPrintDataPanchayat />} />",
    "<Route path=\"print-data/panchayat\" element={<AdminPrintDataPanchayat />} />\n        <Route path=\"fetch-data\" element={<AdminFetchData />} />"
  );
  
  fs.writeFileSync(appPath, content);
}

const layoutPath = 'c:/Users/adity/Desktop/photo id/photo-frontend/src/components/AdminLayout.jsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf-8');

if (!layoutContent.includes('to="/admin/fetch-data"')) {
  layoutContent = layoutContent.replace(
    /<\/nav>/,
    `  <Link to="/admin/fetch-data" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Fetch Records</span>
          </Link>\n        </nav>`
  );
  fs.writeFileSync(layoutPath, layoutContent);
}
