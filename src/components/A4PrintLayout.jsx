import React, { forwardRef } from 'react';
import VoterSlip from './VoterSlip';

const A4PrintLayout = forwardRef(({ baseData, pageNumber, totalPages, startSerialNo, SlipComponent = VoterSlip, cardsPerPage = 8 }, ref) => {
  // We need `cardsPerPage` slips for one A4 page
  const slips = Array.from({ length: cardsPerPage }, (_, i) => ({
    ...baseData,
    serialNo: baseData.serialNo // Typically startSerialNo + i if dynamic
  }));

  // Determine grid layout
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
        padding: '15px 10px', // Reduced top/bottom padding to maximize vertical space
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
        marginBottom: '10px', // Reduced margin
        marginLeft: '10px',
        marginRight: '10px',
        fontSize: '22px',
        fontWeight: 'bold',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
      }}>
        <span>अजमेर नगर निगम</span>
        <span>वार्ड न०: {baseData.wardNo}</span>
        <span>भाग न०: {baseData.partNo}</span>
        <span>Page {pageNumber} of {totalPages}</span>
      </div>

      {/* Grid of slips */}
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
        {slips.map((slipData, index) => (
          <div key={index}>
            <SlipComponent data={slipData} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default A4PrintLayout;
