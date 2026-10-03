const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/pages/AdminAddExcelAssembly.jsx',
  'src/pages/AdminAddExcelNagarNigam.jsx',
  'src/pages/AdminAddExcelPanchayat.jsx'
];

targetFiles.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import
  if (!content.includes('import { State, City } from \'country-state-city\'')) {
    content = content.replace(
      /import FileEditModal from '\.\.\/components\/FileEditModal';/,
      "import { State, City } from 'country-state-city';\nimport FileEditModal from '../components/FileEditModal';"
    );
  }

  // Add variable declarations
  if (!content.includes('const allStates = State.getStatesOfCountry')) {
    content = content.replace(
      /const \[editingFile, setEditingFile\] = useState\(null\);/,
      "const allStates = State.getStatesOfCountry('IN');\n  const selectedStateObj = allStates.find(s => s.name === state);\n  const allDistricts = selectedStateObj ? City.getCitiesOfState('IN', selectedStateObj.isoCode) : [];\n\n  const [editingFile, setEditingFile] = useState(null);"
    );
  }

  // Replace state dropdown
  const stateRegex = /<select value=\{state\} onChange=\{\(e\) => setState\(e\.target\.value\)\} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500\/20 transition-all duration-200">[\s\S]*?<option value="West Bengal">West Bengal<\/option>\s*<\/select>/;
  
  const stateReplacement = `<select value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200">\n                    <option value="">Select State</option>\n                    {allStates.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}\n                  </select>`;
  
  content = content.replace(stateRegex, stateReplacement);

  // Replace district dropdown
  const districtRegex = /<select value=\{district\} onChange=\{\(e\) => setDistrict\(e\.target\.value\)\} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500\/20 transition-all duration-200">[\s\S]*?<option value="Other">Other<\/option>\s*<\/select>/;

  const districtReplacement = `<select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">\n                    <option value="">Select District</option>\n                    {allDistricts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}\n                  </select>`;
  
  content = content.replace(districtRegex, districtReplacement);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${relPath}`);
});
