const fs = require('fs');
const path = require('path');

const files = [
  'AdminAddExcelAssembly.jsx',
  'AdminAddExcelNagarNigam.jsx',
  'AdminAddExcelPanchayat.jsx'
];

files.forEach(file => {
  const filePath = path.join('c:/Users/adity/Desktop/photo id/photo-frontend/src/pages', file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Insert handleDeleteFile after fetchFiles
  if (!content.includes('const handleDeleteFile =')) {
    content = content.replace(
      /const fetchFiles = async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?console\.error\('Error fetching files:', err\);[\s\S]*?\}[\s\S]*?\};/,
      match => match + `\n\n  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to completely delete this file? This cannot be undone.')) return;
    try {
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/excel-files/\${fileId}\`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchFiles();
      } else {
        alert('Failed to delete file.');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Delete failed due to network error.');
    }
  };`
    );
  }

  // Insert Delete button after Edit button
  if (!content.includes('Delete</button>')) {
    content = content.replace(
      /<button[\s\S]*?onClick=\{\(\) => setEditingFile\(file\)\}[\s\S]*?>[\s\S]*?Edit[\s\S]*?<\/button>/,
      match => match + `\n                  <button 
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>`
    );
  }

  fs.writeFileSync(filePath, content);
  console.log('Updated', file);
});
