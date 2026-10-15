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
  const wardNo = cleanVal(data.wardNo);
  const partNo = cleanVal(data.partNo);
  const serialNo = cleanVal(data.serialNo, '1');
  const idNumber = cleanVal(data.idNumber);
  const voterName = data.voterName || '-';
  const fatherHusbandName = data.fatherHusbandName || '-';
  const houseNo = data.houseNo || '0';
  const gender = data.gender || '-';
  const age = data.age ? `${data.age} वर्ष` : '-';
  const pollingStation = data.pollingStation || '-';
  const hasTopImage = Boolean(data.topImage);

  return (
    <div 
      ref={ref}
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: '#ffffff', 
        color: '#0f172a', 
        fontFamily: "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, 'Noto Sans Devanagari', Arial, sans-serif", 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: '1.5px solid #0f172a',
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
    >
      {/* 1. Header: Either Candidate/Party Image Banner OR Official Voter Slip Header */}
      {hasTopImage ? (
        <div style={{ 
          width: '100%', 
          height: '56px',
          flexShrink: 0,
          backgroundColor: '#f1f5f9', 
          borderBottom: '1.5px solid #0f172a',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src={data.topImage} 
            alt="Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
        </div>
      ) : (
        <div style={{
          width: '100%',
          height: '22px',
          flexShrink: 0,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          boxSizing: 'border-box',
          borderBottom: '1.5px solid #0f172a'
        }}>
          <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>मतदाता सूचना पर्ची</span>
            <span style={{ fontSize: '8.5px', color: '#94a3b8', fontWeight: '600' }}>(VOTER SLIP)</span>
          </span>
          <span style={{ fontSize: '9px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase' }}>
            {data.assemblyName || data.cityName || 'निर्वाचन'}
          </span>
        </div>
      )}

      {/* 2. Key Metrics Bar: Ward, Part, Serial No, EPIC ID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '0.85fr 0.95fr 1.25fr 1.55fr', 
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #0f172a',
        alignItems: 'stretch',
        flexShrink: 0,
        height: hasTopImage ? '36px' : '42px',
        boxSizing: 'border-box'
      }}>
        {/* Ward No */}
        <div style={{ 
          borderRight: '1px solid #cbd5e1', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '1px 2px'
        }}>
          <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '700', lineHeight: 1 }}>वार्ड न०</span>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', lineHeight: 1.15, marginTop: '1px' }}>{wardNo}</span>
        </div>

        {/* Part No */}
        <div style={{ 
          borderRight: '1px solid #cbd5e1', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '1px 2px'
        }}>
          <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '700', lineHeight: 1 }}>भाग संख्या</span>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', lineHeight: 1.15, marginTop: '1px' }}>{partNo}</span>
        </div>

        {/* Serial No (Large, bold, prominent highlight) */}
        <div style={{ 
          borderRight: '1px solid #cbd5e1', 
          backgroundColor: '#eff6ff',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '1px 2px'
        }}>
          <span style={{ fontSize: '8px', color: '#1d4ed8', fontWeight: '800', lineHeight: 1 }}>क्रम संख्या</span>
          <span style={{ fontSize: '15px', fontWeight: '900', color: '#1d4ed8', lineHeight: 1.1, marginTop: '1px' }}>
            {serialNo}
          </span>
        </div>

        {/* EPIC ID */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '1px 4px'
        }}>
          <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '700', lineHeight: 1 }}>पहचान पत्र क्र०</span>
          <span style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', fontFamily: 'monospace', letterSpacing: '0.4px', lineHeight: 1.15, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {idNumber}
          </span>
        </div>
      </div>

      {/* 3. Elector Details (Structured table rows) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1, 
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        {/* Row 1: Elector's Name */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '4px 8px', 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}>
          <span style={{ fontSize: '10.5px', color: '#475569', width: '92px', flexShrink: 0, fontWeight: '700' }}>
            मतदाता का नाम :
          </span>
          <span style={{ fontSize: hasTopImage ? '13.5px' : '15px', fontWeight: '900', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {voterName}
          </span>
        </div>

        {/* Row 2: Relative's Name */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '3.5px 8px', 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}>
          <span style={{ fontSize: '10px', color: '#475569', width: '92px', flexShrink: 0, fontWeight: '700' }}>
            पिता / पति :
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fatherHusbandName}
          </span>
        </div>

        {/* Row 3: House No, Gender, Age */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1fr 1fr', 
          borderBottom: '1px solid #0f172a',
          backgroundColor: '#f8fafc',
          padding: '3px 8px',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontWeight: '700', marginRight: '3px', fontSize: '9.5px' }}>मकान:</span>
            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '11.5px' }}>{houseNo}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '6px' }}>
            <span style={{ color: '#64748b', fontWeight: '700', marginRight: '3px', fontSize: '9.5px' }}>लिंग:</span>
            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '11.5px' }}>{gender}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '6px' }}>
            <span style={{ color: '#64748b', fontWeight: '700', marginRight: '3px', fontSize: '9.5px' }}>आयु:</span>
            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '11.5px' }}>{age}</span>
          </div>
        </div>

        {/* Row 4: Polling Station */}
        <div style={{ 
          backgroundColor: '#f1f5f9', 
          padding: '4px 8px', 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: '4px',
          flex: 1,
          minHeight: '26px',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '9px', color: '#475569', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '1px' }}>
            मतदान केंद्र :
          </span>
          <span style={{ fontSize: '10.5px', lineHeight: '1.2', fontWeight: '700', color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {pollingStation}
          </span>
        </div>
      </div>
    </div>
  );
});

export default VoterSlip;
