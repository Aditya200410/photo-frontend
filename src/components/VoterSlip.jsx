import React, { forwardRef } from 'react';

const cleanVal = (val, fallback = '-') => {
  if (val === undefined || val === null) return fallback;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'all' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return fallback;
  }
  return str;
};

const VoterSlip = forwardRef(({ data = {}, style = {} }, ref) => {
  const wardNo = cleanVal(
    data.wardNo || data.WARDNO || data.WARD_NO || data['WARD NO'] || data['PANCHAYAT WARD NO'] || data.WARD || data.ward
  );
  const partNo = cleanVal(
    data.partNo || data.PART_NO || data.BOOTH_NO || data.PARTNO || data['PART NO'] || data.PART || data.booth
  );
  const serialNo = cleanVal(data.serialNo, '1');
  const idNumber = cleanVal(data.idNumber);
  const voterName = data.voterName || '-';
  const fatherHusbandName = data.fatherHusbandName || '-';
  const houseNo = data.houseNo || '0';
  const gender = data.gender || '-';
  const age = data.age ? `${String(data.age).replace(/वर्ष/g, '').trim()}` : '-';
  const pollingStation = data.pollingStation || '-';
  const hasTopImage = Boolean(data.topImage);

  return (
    <div 
      ref={ref}
      style={{ 
        width: style.width || '380px', 
        height: style.height || 'auto',
        minHeight: hasTopImage ? '280px' : '205px',
        maxWidth: '100%',
        backgroundColor: '#ffffff', 
        color: '#000000', 
        fontFamily: "'Noto Sans Devanagari', 'Segoe UI', 'Arial', sans-serif", 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid #000000',
        borderRadius: '0px',
        overflow: 'hidden',
        position: 'relative',
        padding: '0px',
        ...style
      }}
    >
      {/* 1. Header: Candidate Banner Image if provided */}
      {hasTopImage && (
        <div style={{ 
          width: '100%', 
          height: '62px',
          flexShrink: 0,
          backgroundColor: '#ffffff', 
          borderBottom: '1.5px solid #000000',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src={data.topImage} 
            alt="Candidate Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} 
          />
        </div>
      )}

      {/* 2. Cut Instruction Line (shown when topImage exists) */}
      {hasTopImage && (
        <div style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '8.5px',
          fontWeight: '900',
          color: '#000000',
          padding: '1.5px 0',
          borderBottom: '1.5px solid #000000',
          backgroundColor: '#ffffff',
          letterSpacing: '0.2px',
          flexShrink: 0
        }}>
          मतदान केंद्र जाने से पहले ऊपर वाले इस भाग को काट दे
        </div>
      )}

      {/* 3. Main Slip Body */}
      <div style={{
        padding: '5px 7px 4px 7px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
        fontSize: '11px',
        lineHeight: 1.35,
        color: '#000000',
        boxSizing: 'border-box'
      }}>
        {/* Row 1: वार्ड नं० and भाग नं० */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11.5px' }}>वार्ड नं० :</span>
            <div style={{
              border: '1.5px solid #000000',
              minWidth: '55px',
              padding: '0px 8px',
              height: '19px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '12px'
            }}>
              {wardNo}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11.5px' }}>भाग नं० :</span>
            <div style={{
              border: '1.5px solid #000000',
              minWidth: '45px',
              padding: '0px 8px',
              height: '19px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '12px'
            }}>
              {partNo}
            </div>
          </div>
        </div>

        {/* Row 2: क्रम संख्या and EPIC Number */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11.5px' }}>क्रम संख्या :</span>
            <div style={{
              border: '1.5px solid #000000',
              minWidth: '65px',
              padding: '0px 8px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '13.5px'
            }}>
              {serialNo}
            </div>
          </div>

          <div style={{
            fontWeight: '900',
            fontSize: '12.5px',
            fontFamily: "'Segoe UI', Roboto, monospace",
            letterSpacing: '0.4px',
            color: '#000000'
          }}>
            {idNumber}
          </div>
        </div>

        {/* Row 3: मतदाता का नाम */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '2px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '11.5px', whiteSpace: 'nowrap', marginRight: '5px' }}>
            मतदाता का नाम :
          </span>
          <span style={{ fontWeight: '900', fontSize: '13.5px', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {voterName}
          </span>
        </div>

        {/* Row 4: पिता / पति का नाम */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '1px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap', marginRight: '5px' }}>
            पिता / पति का नाम :
          </span>
          <span style={{ fontWeight: '700', fontSize: '12px', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fatherHusbandName}
          </span>
        </div>

        {/* Row 5: मकान नं०, लिंग, आयु */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1px' }}>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>मकान नं० : </span>
            <span style={{ fontWeight: '800', fontSize: '11.5px' }}>{houseNo}</span>
          </div>

          <div>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>लिंग: </span>
            <span style={{ fontWeight: '700', fontSize: '11.5px' }}>{gender}</span>
          </div>

          <div>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>आयु: </span>
            <span style={{ fontWeight: '800', fontSize: '11.5px' }}>{age}</span>
          </div>
        </div>

        {/* Row 6: मतदान केंद्र */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '1px', lineHeight: 1.25 }}>
          <span style={{ fontWeight: 'bold', fontSize: '10.5px', whiteSpace: 'nowrap', marginRight: '4px', flexShrink: 0 }}>
            मतदान केंद्र :
          </span>
          <span style={{ fontWeight: '700', fontSize: '10.5px', color: '#000000', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {pollingStation}
          </span>
        </div>
      </div>
    </div>
  );
});

export default VoterSlip;
