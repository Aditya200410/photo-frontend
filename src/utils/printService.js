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
 * Lightning-Fast direct PDF file generator.
 * Eliminates html2canvas deep clone bottlenecks:
 * - Uses exact 794x1120 A4 96DPI virtual canvas (1:1 instant rasterization)
 * - Renders directly in an isolated offscreen node
 * - Compresses JPEG with fast hardware acceleration
 * - Downloads file immediately via blob URL
 */
export const generatePdfFromHtml = async ({
  pagesHtml = [],
  filename = 'voter-slips.pdf',
  onProgress = () => {},
  scale = 1.0,
  quality = 0.65
}) => {
  if (!pagesHtml || pagesHtml.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const total = pagesHtml.length;

  // Dedicated offscreen container with exact A4 96DPI dimensions (794px x 1123px)
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.top = '0px';
  tempContainer.style.left = '-10000px';
  tempContainer.style.width = '794px';
  tempContainer.style.minHeight = '1122px';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.zIndex = '-99999';
  tempContainer.style.opacity = '1';
  document.body.appendChild(tempContainer);

  try {
    for (let i = 0; i < total; i++) {
      tempContainer.innerHTML = pagesHtml[i];

      // Instant micro-yield for CSS application
      await new Promise(r => setTimeout(r, 4));

      const canvas = await html2canvas(tempContainer, {
        scale: 1.0,
        width: 794,
        height: 1122,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 300,
        windowWidth: 794,
        windowHeight: 1122
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.65);
      if (i > 0) pdf.addPage('a4', 'p');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Free canvas pixel data immediately
      canvas.width = 0;
      canvas.height = 0;
      tempContainer.innerHTML = '';

      onProgress(Math.round(((i + 1) / total) * 100));

      // Yield tick to keep browser UI responding at 60fps
      await new Promise(r => setTimeout(r, 0));
    }

    // Trigger instant browser download via Blob
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

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
