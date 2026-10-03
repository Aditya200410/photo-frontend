const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelAssembly.jsx'),
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelNagarNigam.jsx'),
  path.join(__dirname, 'src', 'pages', 'AdminAddExcelPanchayat.jsx')
];

const stateReplacement = `
                  <select value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200">
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

const districtReplacement = `
                  <input 
                    type="text" 
                    list="district-options"
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200" 
                    placeholder="Select or type district" 
                  />
                  <datalist id="district-options">
                    <option value="Lucknow" />
                    <option value="Kanpur" />
                    <option value="Varanasi" />
                    <option value="Agra" />
                    <option value="Prayagraj" />
                    <option value="Ghaziabad" />
                    <option value="Sriganganagar" />
                    <option value="Jaipur" />
                    <option value="New Delhi" />
                  </datalist>`;

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace State input
    content = content.replace(
      /<input type="text" value=\{state\}.*?placeholder="e\.g\., Uttar Pradesh" \/>/s,
      stateReplacement.trim()
    );

    // Replace District input
    content = content.replace(
      /<input type="text" value=\{district\}.*?placeholder="e\.g\., Lucknow" \/>/s,
      districtReplacement.trim()
    );

    fs.writeFileSync(file, content);
    console.log('Updated', path.basename(file));
  }
});
