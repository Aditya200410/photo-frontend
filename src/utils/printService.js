import API_BASE_URL from '../config';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { getUserToken, getAdminToken } from './auth';

/**
 * Triggers instant browser window.print dialog for A4 slips.
 * Uses an isolated hidden iframe for fast, zero-delay rendering,
 * vector crispness, and built-in "Save as PDF" support.
 */
export const printViaWindowPrint = ({ htmlContent, title = 'Voter Slips' }) => {
  return new Promise((resolve) => {
    // 1. Remove previous print iframe if existing
    const existing = document.getElementById('print-slips-window-iframe');
    if (existing) {
      existing.remove();
    }

    // 2. Create dedicated invisible iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'print-slips-window-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-99999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="hi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            width: 210mm;
          }
          .a4-print-sheet {
            width: 210mm;
            height: 296.5mm;
            max-height: 297mm;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            box-sizing: border-box;
            overflow: hidden;
            margin: 0;
            padding: 5mm;
            background: #ffffff;
            display: flex;
            flex-direction: column;
          }
          .a4-print-sheet:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);
    doc.close();

    const executePrint = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          resolve(true);
        } catch (err) {
          console.warn('Iframe print error, falling back to in-page print:', err);
          let fallbackArea = document.getElementById('printable-slip-area');
          if (!fallbackArea) {
            fallbackArea = document.createElement('div');
            fallbackArea.id = 'printable-slip-area';
            document.body.appendChild(fallbackArea);
          }
          fallbackArea.innerHTML = htmlContent;
          window.print();
          setTimeout(() => {
            fallbackArea.innerHTML = '';
            resolve(true);
          }, 500);
        }
      }, 250);
    };

    // Ensure all images are loaded before triggering print dialog
    const images = Array.from(doc.images || []);
    if (images.length === 0) {
      executePrint();
    } else {
      let loaded = 0;
      const onDone = () => {
        loaded++;
        if (loaded >= images.length) {
          executePrint();
        }
      };
      images.forEach(img => {
        if (img.complete) {
          onDone();
        } else {
          img.onload = onDone;
          img.onerror = onDone;
        }
      });
      // Safety timeout in case an image takes too long or fails
      setTimeout(() => {
        if (loaded < images.length) {
          executePrint();
        }
      }, 1200);
    }
  });
};

/**
 * Highly optimized direct PDF file generator using html2canvas & jsPDF.
 * Optimized scale (1.4), single container reuse, reduced overhead.
 */
export const generatePdfFromHtml = async ({
  pagesHtml = [],
  filename = 'voter-slips.pdf',
  onProgress = () => {},
  scale = 1.4,
  quality = 0.85
}) => {
  if (!pagesHtml || pagesHtml.length === 0) return;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const total = pagesHtml.length;

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.top = '-9999px';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '210mm';
  tempContainer.style.height = '296.5mm';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.zIndex = '-99999';
  document.body.appendChild(tempContainer);

  try {
    for (let i = 0; i < total; i++) {
      tempContainer.innerHTML = pagesHtml[i];

      // Give browser brief tick to layout
      await new Promise(r => setTimeout(r, 20));

      const canvas = await html2canvas(tempContainer, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', quality);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Immediate cleanup of canvas and DOM to prevent memory leaks
      canvas.width = 0;
      canvas.height = 0;
      tempContainer.innerHTML = '';

      onProgress(Math.round(((i + 1) / total) * 100));
      // Yield to let browser update progress bar in UI
      await new Promise(r => setTimeout(r, 10));
    }

    pdf.save(filename);
    return pdf;
  } finally {
    if (tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};

/**
 * Deducts credit balance and records print job on backend
 */
export const logPrintTransaction = async (payload) => {
  try {
    const token = getUserToken() || getAdminToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/api/prints`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      window.dispatchEvent(new Event('user-credits-updated'));
    }
    return res;
  } catch (err) {
    console.error('Failed to log print transaction:', err);
  }
};
