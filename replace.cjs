const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

const files = walkSync(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    // Replace standard URL strings with the environment variable template string
    content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
    content = content.replace(/"http:\/\/localhost:5000(.*?)"/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
    // For cases where they used template strings already (e.g., `http://localhost:5000/api/${id}`)
    content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
    
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
