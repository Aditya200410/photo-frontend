import React, { forwardRef } from 'react';
import VoterSlip from './VoterSlip';

const BatchA4PrintLayout = forwardRef(({ slipsData = [], pageNumber, totalPages, SlipComponent = VoterSlip, headerData = {}, cardsPerPage = 8 }, ref) => {
  let rowsCount = 4;
  let verticalGap = 8;
  let horizontalGap = 10;

  if (cardsPerPage === 4) {
    rowsCount = 2;
    verticalGap = 12;
    horizontalGap = 12;
  } else if (cardsPerPage === 10) {
    rowsCount = 5;
    verticalGap = 6;
    horizontalGap = 10;
  } else if (cardsPerPage === 12) {
    rowsCount = 6;
    verticalGap = 5;
    horizontalGap = 8;
  }

  const isLastPage = Boolean(totalPages && pageNumber >= totalPages);

  // Resolve display ward and part (never show 'All')
  const pageWard = slipsData.find(s => s?.wardNo && s.wardNo !== '-' && String(s.wardNo).trim().toLowerCase() !== 'all')?.wardNo;
  const headerWardRaw = headerData.wardNo && String(headerData.wardNo).trim().toLowerCase() !== 'all' ? headerData.wardNo : null;
  const displayWard = headerWardRaw || pageWard || 'सभी';

  const pagePart = slipsData.find(s => s?.partNo && s.partNo !== '-' && String(s.partNo).trim().toLowerCase() !== 'all')?.partNo;
  const headerPartRaw = headerData.partNo && String(headerData.partNo).trim().toLowerCase() !== 'all' ? headerData.partNo : null;
  const displayPart = headerPartRaw || pagePart || 'सभी';

  return (
    <div 
      ref={ref}
      className="a4-print-sheet"
      style={{
        width: '210mm',
        height: '296.5mm', // slightly less than 297mm to prevent accidental extra pages
        backgroundColor: '#ffffff',
        padding: '4.5mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pageBreakAfter: isLastPage ? 'auto' : 'always',
        breakAfter: isLastPage ? 'auto' : 'page',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        margin: 0
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '1.5mm',
        borderBottom: '2px solid #0f172a',
        marginBottom: '2.5mm',
        fontSize: '12pt',
        fontWeight: 'bold',
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: '#0f172a',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '13pt', fontWeight: '800' }}>
          {headerData.title || 'मतदाता सूची पर्ची'}
        </span>
        <span style={{ fontSize: '11pt', fontWeight: '700' }}>वार्ड न०: {displayWard}</span>
        <span style={{ fontSize: '11pt', fontWeight: '700' }}>भाग न०: {displayPart}</span>
        <span style={{ fontSize: '10pt', color: '#475569', fontWeight: '600' }}>Page {pageNumber} of {totalPages}</span>
      </div>

      {/* Actual Grid */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        minHeight: 0
      }}>
        {slipsData.map((slipData, index) => {
          const isRightCol = index % 2 === 1;
          const isBottomRow = Math.floor(index / 2) === rowsCount - 1;
          return (
            <div key={index} style={{ 
              display: 'flex', 
              width: `calc(50% - ${horizontalGap / 2}px)`, 
              height: `calc((100% - ${(rowsCount - 1) * verticalGap}px) / ${rowsCount})`,
              marginRight: isRightCol ? 0 : `${horizontalGap}px`,
              marginBottom: isBottomRow ? 0 : `${verticalGap}px`,
              minHeight: 0,
              boxSizing: 'border-box'
            }}>
              <SlipComponent data={slipData} style={{ width: '100%', height: '100%' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default BatchA4PrintLayout;
