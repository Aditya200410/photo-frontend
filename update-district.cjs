const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelAssembly.jsx'),
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelNagarNigam.jsx'),
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelPanchayat.jsx')
];

const districtReplacement = `
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200">
                    <option value="">Select District</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Kanpur">Kanpur</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Agra">Agra</option>
                    <option value="Prayagraj">Prayagraj</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                    <option value="Sriganganagar">Sriganganagar</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="New Delhi">New Delhi</option>
                    <option value="Patna">Patna</option>
                    <option value="Bhopal">Bhopal</option>
                    <option value="Other">Other</option>
                  </select>`;

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // We want to replace the whole input and datalist chunk.
    // Let's use a regex that matches from <input ... list="district-options" to </datalist>
    content = content.replace(
      /<input[\s\S]*?list="district-options"[\s\S]*?<\/datalist>/,
      districtReplacement.trim()
    );

    fs.writeFileSync(file, content);
    console.log('Updated District in', path.basename(file));
  }
});
