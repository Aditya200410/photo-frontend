const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelAssembly.jsx'),
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelNagarNigam.jsx'),
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelPanchayat.jsx')
];

const stateReplacement = `<select value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200">
                    <option value="">Select State</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Punjab">Punjab</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>`;

const districtReplacement = `<select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200">
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
    
    // Replace state input
    content = content.replace(
      /<input type="text" value=\{state\} onChange=\{\(e\) => setState\(e\.target\.value\)\} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="e\.g\., Uttar Pradesh" \/>/g,
      stateReplacement
    );

    // Replace district input
    content = content.replace(
      /<input type="text" value=\{district\} onChange=\{\(e\) => setDistrict\(e\.target\.value\)\} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="e\.g\., Lucknow" \/>/g,
      districtReplacement
    );

    fs.writeFileSync(file, content);
    console.log('Fixed', path.basename(file));
  }
});
