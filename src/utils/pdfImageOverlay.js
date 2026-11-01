import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Exact layout boxes for:
 * 1) 'header' / 'header6': 6 per page (2 cols x 3 rows) top banner image
 * 2) 'header8': 8 per page (2 cols x 4 rows) top banner image
 * 3) 'symbol': 8 per page (2 cols x 4 rows) symbol icon box
 *
 * Measurements matching both legacy PDFs (with orange banner) and newly generated PDFs.
 * In pdf-lib, (0, 0) is the bottom-left corner of the page.
 */

// Format: 6 per page Header Banner boxes (width: 276.75pt)
// Expanded height to give generous space to the candidate image without covering the cut notice or voter details.
// Card top is at y=795.5; cut line starts at y=745.5.
// Box height: 49.0pt (a ~31% increase over 37.5pt) starting at y=746.5.
export const HEADER_SLIP_BOXES = [
  // Row 1 (top): col 0, col 1
  { x: 15.75, y: 746.5, width: 276.75, height: 49.0 },
  { x: 302.75, y: 746.5, width: 276.75, height: 49.0 },
  // Row 2 (middle): col 0, col 1
  { x: 15.75, y: 484.0, width: 276.75, height: 49.0 },
  { x: 302.75, y: 484.0, width: 276.75, height: 49.0 },
  // Row 3 (bottom): col 0, col 1
  { x: 15.75, y: 221.5, width: 276.75, height: 49.0 },
  { x: 302.75, y: 221.5, width: 276.75, height: 49.0 },
];

// Format: 8 per page Header Banner boxes (width: 278.8pt)
// Expanded height to maximize candidate image visibility without covering serial/ward numbers below.
// Box height: 35.0pt (expanded up from 27.0pt) starting at y=758.0.
export const HEADER8_SLIP_BOXES = [
  // Row 1 (top): col 0, col 1
  { x: 14.9, y: 758.0, width: 278.8, height: 35.0 },
  { x: 301.4, y: 758.0, width: 278.8, height: 35.0 },
  // Row 2: col 0, col 1
  { x: 14.9, y: 561.5, width: 278.8, height: 35.0 },
  { x: 301.4, y: 561.5, width: 278.8, height: 35.0 },
  // Row 3: col 0, col 1
  { x: 14.9, y: 365.4, width: 278.8, height: 35.0 },
  { x: 301.4, y: 365.4, width: 278.8, height: 35.0 },
  // Row 4 (bottom): col 0, col 1
  { x: 14.9, y: 169.3, width: 278.8, height: 35.0 },
  { x: 301.4, y: 169.3, width: 278.8, height: 35.0 },
];

// Format: 8 per page Symbol boxes (width: ~33pt, height: ~33pt)
export const SYMBOL_SLIP_BOXES = [
  // Row 1: col 0, col 1
  { x: 253.25, y: 731.84, width: 33.0, height: 33.0 },
  { x: 540.31, y: 731.84, width: 33.0, height: 33.0 },
  // Row 2: col 0, col 1
  { x: 253.25, y: 535.64, width: 33.0, height: 33.0 },
  { x: 540.31, y: 535.64, width: 33.0, height: 33.0 },
  // Row 3: col 0, col 1
  { x: 253.25, y: 339.44, width: 33.0, height: 33.0 },
  { x: 540.31, y: 339.44, width: 33.0, height: 33.0 },
  // Row 4: col 0, col 1
  { x: 253.25, y: 143.24, width: 33.0, height: 33.0 },
  { x: 540.31, y: 143.24, width: 33.0, height: 33.0 },
];

function convertImageToPngDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Downloads a pre-generated server PDF, pastes the candidate banner/symbol
 * image onto each slip across all pages using pdf-lib in milliseconds,
 * and triggers immediate download.
 */
export async function downloadPdfWithImageOverlay({
  pdfUrl,
  imageDataUrl,
  formatId,
  outputFilename,
  onProgress = () => {}
}) {
  onProgress(15, 'Fetching pre-generated PDF from server...');
  const res = await fetch(pdfUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch PDF from server (${res.status} ${res.statusText})`);
  }
  const existingPdfBytes = await res.arrayBuffer();

  onProgress(40, 'Loading PDF document...');
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  onProgress(55, 'Embedding candidate image...');
  let embeddedImage;
  
  // Standardize any image (png, webp, jpeg) to a clean PNG data URL via canvas in browser
  try {
    const pngDataUrl = await convertImageToPngDataUrl(imageDataUrl);
    const cleanBase64 = pngDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
    embeddedImage = await pdfDoc.embedPng(imageBytes);
  } catch (convErr) {
    console.warn('Canvas conversion failed, fallback to direct embedding:', convErr);
    const isPng = imageDataUrl.startsWith('data:image/png');
    const cleanBase64 = imageDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    }
  }

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  let boxes = HEADER_SLIP_BOXES;
  if (formatId === 'header' || formatId === 'header6') {
    boxes = HEADER_SLIP_BOXES;
  } else if (formatId === 'header8') {
    boxes = HEADER8_SLIP_BOXES;
  } else if (formatId === 'symbol') {
    boxes = SYMBOL_SLIP_BOXES;
  }

  onProgress(70, `Pasting image on ${totalPages} pages...`);

  const isHeaderMode = formatId === 'header' || formatId === 'header6' || formatId === 'header8';

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    for (const box of boxes) {
      // 1. Wipe out any pre-existing background / orange banner / default text in the header box
      if (isHeaderMode) {
        page.drawRectangle({
          x: box.x - 0.75,
          y: box.y - 0.75,
          width: box.width + 1.5,
          height: box.height + 1.5,
          color: rgb(1, 1, 1)
        });
      }

      // 2. Paste the user's uploaded banner image cleanly into the box
      page.drawImage(embeddedImage, {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      });
    }

    if (i % 25 === 0) {
      onProgress(70 + Math.round((i / totalPages) * 20), `Stamping page ${i + 1} of ${totalPages}...`);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  onProgress(92, 'Generating final stamped PDF file...');
  const modifiedPdfBytes = await pdfDoc.save();

  onProgress(100, 'Download complete!');
  const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = outputFilename || `Voter-Slips-With-Image-${formatId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 15000);

  return true;
}
