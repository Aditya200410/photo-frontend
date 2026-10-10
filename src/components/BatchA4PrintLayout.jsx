import React, { forwardRef } from 'react';
import VoterSlip from './VoterSlip';

const BatchA4PrintLayout = forwardRef(({ slipsData, pageNumber, totalPages, SlipComponent = VoterSlip, headerData, cardsPerPage = 8 }, ref) => {
  let gridTemplateColumns = '1fr 1fr';
  let rowsCount = 4;
  let verticalGap = 15;
  let horizontalGap = 20;

  if (cardsPerPage === 4) {
    rowsCount = 2;
    verticalGap = 20;
    horizontalGap = 20;
  } else if (cardsPerPage === 10) {
    gridTemplateColumns = '1fr 1fr';
    rowsCount = 5;
    verticalGap = 15;
    horizontalGap = 20;
  } else if (cardsPerPage === 12) {
    gridTemplateColumns = '1fr 1fr';
    rowsCount = 6;
    verticalGap = 15;
    horizontalGap = 20;
  }

  return (
    <div 
      ref={ref}
      style={{
        width: '210mm',
        height: '296.5mm', // slightly less than 297mm to prevent accidental extra pages
        backgroundColor: '#ffffff',
        padding: '5mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pageBreakAfter: 'always',
        margin: 0
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '2mm',
        borderBottom: '2px solid black',
        marginBottom: '4mm',
        fontSize: '14pt',
        fontWeight: 'bold',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        flexShrink: 0
      }}>
        <span>{headerData.title || 'अजमेर नगर निगम'}</span>
        <span>वार्ड न०: {headerData.wardNo}</span>
        <span>भाग न०: {headerData.partNo}</span>
        <span>Page {pageNumber} of {totalPages}</span>
      </div>

      {/* Actual Grid using Flexbox instead of CSS Grid for html2canvas compatibility */}
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
              minHeight: 0 
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
