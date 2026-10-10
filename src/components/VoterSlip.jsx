import React, { forwardRef } from 'react';

const VoterSlip = forwardRef(({ data, style = {} }, ref) => {
  return (
    <div 
      ref={ref}
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: '#ffffff', 
        color: '#1e293b', 
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif", 
        fontSize: '18px', 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid #cbd5e1', // Cleaner outer border
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        ...style
      }}
    >
      {/* Optional Top Image */}
      {data.topImage && (
        <div style={{ 
          width: '100%', 
          backgroundColor: '#f8fafc', 
          borderBottom: '2px solid #e2e8f0',
          flex: 1,
          minHeight: '25px', // Guarantee at least a minimal strip of the image is shown
          maxHeight: '140px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img src={data.topImage} alt="Banner" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Main Slip Box */}
      <div style={{ 
        padding: data.topImage ? '6px 12px' : '12px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        flex: data.topImage ? '0 0 auto' : 1, 
        justifyContent: 'space-between' 
      }}>
        
        {/* Top Header Row: Ward, Part, S.No, ID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '4px', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>वार्ड न०</div>
            <div style={{ fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>{data.wardNo || ' '}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>भाग न०</div>
            <div style={{ fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>{data.partNo || ' '}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>क्रम संख्या</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb', lineHeight: 1 }}>{data.serialNo || ' '}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '0.5px' }}>
              {data.idNumber || ' '}
            </div>
          </div>
        </div>

        {/* Middle Section: Voter Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '11px', color: '#64748b', width: '110px', fontWeight: '600' }}>मतदाता का नाम :</span>
            <span style={{ fontWeight: '800', fontSize: '14px' }}>{data.voterName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '11px', color: '#64748b', width: '110px', fontWeight: '600' }}>पिता / पति का नाम :</span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.fatherHusbandName}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '4px', marginTop: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginRight: '4px' }}>मकान न० :</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.houseNo}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginRight: '4px' }}>लिंग :</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.gender}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginRight: '4px' }}>आयु :</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.age}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Polling Station */}
        <div style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'baseline' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', marginRight: '6px', whiteSpace: 'nowrap' }}>मतदान केंद्र :</div>
          <div style={{ fontSize: '12px', lineHeight: '1.1', fontWeight: '600' }}>{data.pollingStation}</div>
        </div>
      </div>
    </div>
  );
});

export default VoterSlip;
