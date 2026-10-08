import React, { forwardRef } from 'react';

const VoterSlipOption3 = forwardRef(({ data, style = {} }, ref) => {
  return (
    <div 
      ref={ref}
      style={{
        width: '600px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: '#000000',
        padding: '5px',
        ...style
      }}
    >
      {/* Left Box (Details) */}
      <div style={{
        width: '430px',
        border: '3px solid black',
        padding: '10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        justifyContent: 'space-evenly'
      }}>
        {/* Row 1: Ward and Part */}
        <div style={{ display: 'flex', marginBottom: '8px', fontSize: '18px', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '55%' }}>
            <span style={{ marginRight: '10px' }}>वार्ड न०:</span>
            <div style={{ border: '2px solid black', padding: '2px 10px', minWidth: '100px', textAlign: 'center' }}>
              {data.wardNo || '\u00A0'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', width: '45%' }}>
            <span style={{ marginRight: '10px' }}>भाग न०:</span>
            <div style={{ border: '2px solid black', padding: '2px 10px', minWidth: '70px', textAlign: 'center' }}>
              {data.partNo || '\u00A0'}
            </div>
          </div>
        </div>

        {/* Row 2: Serial No and ID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>क्रम संख्या :</span>
            <div style={{ border: '2px solid black', padding: '2px 10px', minWidth: '80px', textAlign: 'center' }}>
              {data.serialNo || '\u00A0'}
            </div>
          </div>
          <div style={{ fontSize: '18px' }}>
            {data.idNumber || '\u00A0'}
          </div>
        </div>

        {/* Voter Details */}
        <div style={{ fontSize: '18px', lineHeight: '1.4', flex: 1 }}>
          <div style={{ marginBottom: '4px', fontSize: '20px' }}>
            <strong>मतदाता : </strong> {data.voterName || '\u00A0'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            पिता / पति का नाम : {data.fatherHusbandName || '\u00A0'}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>मकान न० : {data.houseNo || '\u00A0'}</div>
            <div style={{ display: 'flex', gap: '30px' }}>
              <span>{data.gender || '\u00A0'}</span>
              <span>{data.age || '\u00A0'}</span>
            </div>
          </div>

          <div style={{ fontWeight: 'bold' }}>
            मतदान केंद्र : {data.pollingStation || '\u00A0'}
          </div>
        </div>
      </div>

      {/* Middle Divider Text */}
      <div style={{
        width: '30px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          color: '#000000',
          fontWeight: '500',
          letterSpacing: '1px'
        }}>
          मतदान केंद्र जाने से पहले इस भाग को काट दे
        </div>
      </div>

      {/* Right Box (Symbol) */}
      <div style={{
        width: '135px',
        border: '3px solid black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 5px',
        boxSizing: 'border-box',
        height: '100%'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
          चुनाव चिन्ह
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 0' }}>
          {data.symbolImage ? (
            <img 
              src={data.symbolImage} 
              alt="Symbol" 
              style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} 
            />
          ) : (
            <div style={{ width: '100px', height: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', textAlign: 'center' }}>
              Image Placeholder
            </div>
          )}
        </div>

        <div style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
          {data.symbolName || 'कमल का फूल'}
        </div>
      </div>
    </div>
  );
});

export default VoterSlipOption3;
