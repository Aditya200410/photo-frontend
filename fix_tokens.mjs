import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'Option1.jsx',
  'Option2.jsx',
  'Option3.jsx'
].map(f => path.join('c:/Users/adity/Desktop/photo id/photo-frontend/src/pages', f));

filesToUpdate.push(
  path.join('c:/Users/adity/Desktop/photo id/photo-frontend/src/components', 'BatchSlipPrintManager.jsx'),
  path.join('c:/Users/adity/Desktop/photo id/photo-frontend/src/components', 'SlipPrintManager.jsx')
);

filesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes("\`Bearer \${localStorage.getItem('userToken') || 'DUMMY'}\`")) {
    content = content.replace(
      /\`Bearer \$\{localStorage\.getItem\('userToken'\) \|\| 'DUMMY'\}\`/g,
      "\`Bearer \${localStorage.getItem('userToken') || localStorage.getItem('token') || 'DUMMY'}\`"
    );
    fs.writeFileSync(filePath, content);
    console.log('Fixed token logic in', path.basename(filePath));
  }
});
