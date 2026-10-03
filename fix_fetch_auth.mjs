import fs from 'fs';
import path from 'path';

const basePath = 'c:/Users/adity/Desktop/photo id/photo-frontend/src/pages';
const files = ['PhotoAssembly.jsx', 'PhotoNagarNigam.jsx', 'PhotoGramPanchayat.jsx'];

files.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace: const res = await fetch(url);
    // With: const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token') || 'DUMMY'}` } });
    
    if (content.includes('const res = await fetch(url);')) {
      content = content.replace(
        /const res = await fetch\(url\);/g,
        "const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token') || 'DUMMY'}` } });"
      );
      fs.writeFileSync(filePath, content);
      console.log('Fixed fetch auth in', file);
    }
  }
});
