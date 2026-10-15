import React, { forwardRef } from 'react';

const cleanVal = (val, fallback = '-') => {
  if (val === undefined || val === null) return fallback;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'all' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return fallback;
  }
  return str;
};

const VoterSlipOption3 = forwardRef(({ data = {}, style = {} }, ref) => {
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

  return (
    <div 
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        fontFamily: "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, 'Noto Sans Devanagari', Arial, sans-serif",
        color: '#0f172a',
        border: '1.5px solid #0f172a',
        borderRadius: '3px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Left Box (Voter Details) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Header Bar */}
        <div style={{
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
          <span style={{ fontSize: '9.5px', fontWeight: '800', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>मतदाता सूचना पर्ची</span>
            <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '600' }}>(VOTER SLIP)</span>
          </span>
          <span style={{ fontSize: '8.5px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase' }}>
            {data.assemblyName || data.cityName || 'निर्वाचन'}
          </span>
        </div>

        {/* Key Metrics Bar: Ward, Part, Serial No, EPIC ID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '0.8fr 0.9fr 1.2fr 1.4fr', 
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #0f172a',
          alignItems: 'stretch',
          flexShrink: 0,
          height: '42px',
          boxSizing: 'border-box'
        }}>
          <div style={{ borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1px 2px' }}>
            <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: '700', lineHeight: 1 }}>वार्ड</span>
            <span style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', lineHeight: 1.15, marginTop: '1px' }}>{wardNo}</span>
          </div>

          <div style={{ borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1px 2px' }}>
            <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: '700', lineHeight: 1 }}>भाग</span>
            <span style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', lineHeight: 1.15, marginTop: '1px' }}>{partNo}</span>
          </div>

          <div style={{ borderRight: '1px solid #cbd5e1', backgroundColor: '#eff6ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1px 2px' }}>
            <span style={{ fontSize: '7.5px', color: '#1d4ed8', fontWeight: '800', lineHeight: 1 }}>क्रम संख्या</span>
            <span style={{ fontSize: '14.5px', fontWeight: '900', color: '#1d4ed8', lineHeight: 1.1, marginTop: '1px' }}>
              {serialNo}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1px 2px' }}>
            <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: '700', lineHeight: 1 }}>पहचान पत्र</span>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a', fontFamily: 'monospace', lineHeight: 1.15, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {idNumber}
            </span>
          </div>
        </div>

        {/* Elector Details */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          {/* Elector's Name */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '3.5px 6px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '10px', color: '#475569', width: '78px', flexShrink: 0, fontWeight: '700' }}>मतदाता :</span>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {voterName}
            </span>
          </div>

          {/* Relative's Name */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '3px 6px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '9.5px', color: '#475569', width: '78px', flexShrink: 0, fontWeight: '700' }}>पिता / पति :</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fatherHusbandName}
            </span>
          </div>

          {/* House No, Gender, Age */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.1fr 1fr 1fr', 
            borderBottom: '1px solid #0f172a',
            backgroundColor: '#f8fafc',
            padding: '2.5px 6px',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: '700', marginRight: '2px', fontSize: '9px' }}>मकान:</span>
              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '11px' }}>{houseNo}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '4px' }}>
              <span style={{ color: '#64748b', fontWeight: '700', marginRight: '2px', fontSize: '9px' }}>लिंग:</span>
              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '11px' }}>{gender}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '4px' }}>
              <span style={{ color: '#64748b', fontWeight: '700', marginRight: '2px', fontSize: '9px' }}>आयु:</span>
              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '11px' }}>{age}</span>
            </div>
          </div>

          {/* Polling Station */}
          <div style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '3px 6px', 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: '3px',
            flex: 1,
            minHeight: '26px',
            boxSizing: 'border-box'
          }}>
            <span style={{ fontSize: '8.5px', color: '#475569', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '1px' }}>
              मतदान केंद्र :
            </span>
            <span style={{ fontSize: '10px', lineHeight: '1.2', fontWeight: '700', color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {pollingStation}
            </span>
          </div>
        </div>
      </div>

      {/* Right Box (Candidate Symbol / Image) */}
      <div style={{
        width: '84px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 3px',
        boxSizing: 'border-box',
        height: '100%',
        backgroundColor: '#f8fafc',
        borderLeft: '1.5px solid #0f172a'
      }}>
        <div style={{ fontSize: '8.5px', color: '#0f172a', fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
          चुनाव चिन्ह
        </div>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          padding: '2px 0', 
          minHeight: 0 
        }}>
          {data.symbolImage ? (
            <div style={{
              width: '62px',
              height: '62px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '3px',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={data.symbolImage} 
                alt="Symbol" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
              />
            </div>
          ) : (
            <div style={{ 
              width: '62px', 
              height: '62px', 
              border: '1px dashed #94a3b8', 
              borderRadius: '3px', 
              backgroundColor: '#ffffff',
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '2px',
              color: '#64748b'
            }}>
              <svg style={{ width: '22px', height: '22px', strokeWidth: 1.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ fontSize: '7.5px', marginTop: '2px', fontWeight: '700' }}>चिन्ह</span>
            </div>
          )}
        </div>

        <div style={{ 
          fontSize: '9.5px', 
          fontWeight: '900', 
          color: '#0f172a', 
          textAlign: 'center', 
          lineHeight: '1.15', 
          maxHeight: '26px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          width: '100%',
          paddingTop: '2px',
          borderTop: '1px solid #cbd5e1'
        }}>
          {data.symbolName || 'कमल'}
        </div>
      </div>
    </div>
  );
});

export default VoterSlipOption3;
