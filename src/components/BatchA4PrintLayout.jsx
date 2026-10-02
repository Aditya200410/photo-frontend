import React, { forwardRef } from 'react';
import VoterSlip from './VoterSlip';

const BatchA4PrintLayout = forwardRef(({ slipsData, pageNumber, totalPages, SlipComponent = VoterSlip, headerData, cardsPerPage = 8 }, ref) => {
  let gridTemplateColumns = '1fr 1fr';
  let gridTemplateRows = 'repeat(4, 1fr)';
  let transform = 'scale(1)';
  let gap = '8px 20px';

  if (cardsPerPage === 4) {
    gridTemplateRows = 'repeat(2, 1fr)';
    gap = '20px 20px';
  } else if (cardsPerPage === 12) {
    gridTemplateColumns = '1fr 1fr';
    gridTemplateRows = 'repeat(6, 1fr)';
    transform = 'scale(0.85)';
    gap = '4px 10px';
  }

  return (
    <div 
      ref={ref}
      style={{
        width: '1240px',
        height: '1754px',
        backgroundColor: '#ffffff',
        padding: '15px 10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '5px',
        borderBottom: '2px solid black',
        marginBottom: '10px',
        marginLeft: '10px',
        marginRight: '10px',
        fontSize: '22px',
        fontWeight: 'bold',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
      }}>
        <span>{headerData.title || 'अजमेर नगर निगम'}</span>
        <span>वार्ड न०: {headerData.wardNo}</span>
        <span>भाग न०: {headerData.partNo}</span>
        <span>Page {pageNumber} of {totalPages}</span>
      </div>

      {/* Grid of up to cardsPerPage slips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns,
        gridTemplateRows,
        gap,
        justifyItems: 'center',
        alignItems: 'center',
        flex: 1,
        minHeight: 0,
        transform,
        transformOrigin: 'top center'
      }}>
        {slipsData.map((slipData, index) => (
          <div key={index}>
            <SlipComponent data={slipData} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default BatchA4PrintLayout;
