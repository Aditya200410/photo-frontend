const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

if (!indexHtml.includes('google_translate_element')) {
  const gTranslate = `
  <div id="google_translate_element" style="display:none;"></div>
  <script type="text/javascript">
    function googleTranslateElementInit() {
      new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
    }
  </script>
  <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
`;
  indexHtml = indexHtml.replace('<body>', '<body>\n' + gTranslate);
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('Added Google Translate to index.html');
}

const photoIndexPath = path.join(__dirname, 'src', 'pages', 'PhotoIndex.jsx');
let photoIndex = fs.readFileSync(photoIndexPath, 'utf8');

const targetContent = `<div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white text-blue-600 shadow-sm border border-slate-200">EN</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-800 transition-colors">HI</button>
            </div>`;

const replacementContent = `            <div className="flex items-center gap-2 relative group z-50">
              <select 
                className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer shadow-sm"
                onChange={(e) => {
                  const lang = e.target.value;
                  if (lang) {
                    document.cookie = \`googtrans=/en/\${lang}; path=/\`;
                    document.cookie = \`googtrans=/en/\${lang}; domain=\${window.location.hostname}; path=/\`;
                    window.location.reload();
                  } else {
                    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = \`googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=\${window.location.hostname}; path=/;\`;
                    window.location.reload();
                  }
                }}
                defaultValue={(() => {
                  const match = document.cookie.match(/googtrans=\\/en\\/([a-z]{2})/);
                  return match ? match[1] : "";
                })()}
              >
                <option value="">English (EN)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="ur">Urdu (اردو)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>`;

if (photoIndex.includes(targetContent)) {
  photoIndex = photoIndex.replace(targetContent, replacementContent);
  fs.writeFileSync(photoIndexPath, photoIndex);
  console.log('Replaced language switcher with dropdown in PhotoIndex');
} else {
  console.log('Target content not found in PhotoIndex');
}

// Add global styles to hide the google translate top banner and original widget
const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.skiptranslate')) {
  css += `\n
/* Google Translate Overrides */
body { top: 0 !important; }
.skiptranslate iframe { display: none !important; }
#goog-gt-tt { display: none !important; }
.goog-te-banner-frame { display: none !important; }
.goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
`;
  fs.writeFileSync(cssPath, css);
}
