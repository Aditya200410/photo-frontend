import fs from 'fs';
import path from 'path';

const basePath = 'c:/Users/adity/Desktop/photo id/photo-frontend/src/pages';

const configs = [
  'AdminPrintDataAssembly.jsx',
  'AdminPrintDataNagarNigam.jsx',
  'AdminPrintDataPanchayat.jsx'
];

configs.forEach(conf => {
  const filePath = path.join(basePath, conf);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix the Type display in the table
    content = content.replace(
      /r\.option_type === 'Option 1' \? 'Slip Print' : 'Directory'/g,
      "r.option_type.includes('Option') ? 'Slip Print' : 'Directory'"
    );
    
    // Fix the Type display in the modal
    content = content.replace(
      /selectedRecord\.option_type === 'Option 1' \? 'Slip Print' : 'Directory'/g,
      "selectedRecord.option_type.includes('Option') ? 'Slip Print' : 'Directory'"
    );
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed Type display in', conf);
  }
});
