import React, { forwardRef } from 'react';
import VoterSlip from './VoterSlip';

const BatchA4PrintLayout = forwardRef(({ slipsData, pageNumber, totalPages, SlipComponent = VoterSlip, headerData, cardsPerPage = 8 }, ref) => {
  let gridTemplateColumns = '1fr 1fr';
  let rowsCount = 4;
  let scale = 1.12; // 8 cards scale to fill space proportionally
  let verticalGap = 15;
  let horizontalGap = 20;

  if (cardsPerPage === 4) {
    rowsCount = 2;
    verticalGap = 20;
    horizontalGap = 20;
    scale = 1.25;
  } else if (cardsPerPage === 10) {
    gridTemplateColumns = '1fr 1fr';
    rowsCount = 5;
    verticalGap = 15;
    horizontalGap = 20;
    scale = 0.95;
  } else if (cardsPerPage === 12) {
    gridTemplateColumns = '1fr 1fr';
    rowsCount = 6;
    verticalGap = 15;
    horizontalGap = 20;
    scale = 0.85;
  }

  // Available dimensions for the grid
  const availableWidth = 1220; // 1240 - 20 (padding)
  const availableHeight = 1650; // 1754 - 30 (padding) - 74 (header + margins)

  // Calculate original grid dimensions before scale
  const gridWidth = availableWidth / scale;
  const gridHeight = availableHeight / scale;
  
  // Calculate exact pixel height for a single row to force html2canvas to stretch it
  const rowHeight = (gridHeight - (rowsCount - 1) * verticalGap) / rowsCount;

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
        marginBottom: '15px',
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

      {/* Grid Wrapper to handle scaling perfectly to fit A4 */}
      <div style={{
        width: `${availableWidth}px`,
        height: `${availableHeight}px`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Actual Scaled Grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
          display: 'grid',
          gridTemplateColumns,
          gridTemplateRows: `repeat(${rowsCount}, ${rowHeight}px)`,
          gap: `${verticalGap}px ${horizontalGap}px`,
          justifyItems: 'stretch',
          alignItems: 'stretch',
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}>
          {slipsData.map((slipData, index) => (
            <div key={index} style={{ display: 'flex', width: '100%', height: `${rowHeight}px` }}>
              <SlipComponent data={slipData} style={{ width: '100%', height: `${rowHeight}px` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default BatchA4PrintLayout;
