import React, { forwardRef } from 'react';
import VoterSlip from './VoterSlip';

const A4PrintLayout = forwardRef(({ baseData, pageNumber, totalPages, startSerialNo, SlipComponent = VoterSlip }, ref) => {
  // We need 8 slips for one A4 page
  const slips = Array.from({ length: 8 }, (_, i) => ({
    ...baseData,
    serialNo: (startSerialNo + i).toString()
  }));

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
        flexDirection: 'column'
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

      {/* Grid of 8 slips (2 columns, 4 rows) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'repeat(4, 1fr)', // Force 4 even rows
        gap: '8px 20px', // Minimized vertical gap
        justifyItems: 'center',
        alignItems: 'center', // Center vertically within the forced row height
        flex: 1,
        minHeight: 0
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
