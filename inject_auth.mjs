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
  
  // Replace: headers: { 'Content-Type': 'application/json' },
  // With:    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },
  
  if (content.includes("headers: { 'Content-Type': 'application/json' }")) {
    content = content.replace(
      /headers: \{ 'Content-Type': 'application\/json' \}/g,
      "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken') || 'DUMMY'}` }"
    );
    fs.writeFileSync(filePath, content);
    console.log('Updated', path.basename(filePath));
  } else if (content.includes('headers: { "Content-Type": "application/json" }')) {
    content = content.replace(
      /headers: \{ "Content-Type": "application\/json" \}/g,
      "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken') || 'DUMMY'}` }"
    );
    fs.writeFileSync(filePath, content);
    console.log('Updated', path.basename(filePath));
  }
});
