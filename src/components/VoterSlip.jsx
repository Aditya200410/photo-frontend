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
        <div style={{ width: '100%', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
          <img src={data.topImage} alt="Banner" style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', display: 'block' }} />
          <div style={{ 
            width: '100%', 
            textAlign: 'center', 
            fontSize: '14px', 
            fontWeight: '600', 
            padding: '4px 0',
            color: '#64748b'
          }}>
            मतदान केंद्र जाने से पहले उपर वाले इस भाग को काट दे
          </div>
        </div>
      )}

      {/* Main Slip Box */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        
        {/* Top Header Row: Ward, Part, S.No, ID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>वार्ड न०</div>
            <div style={{ fontSize: '20px', fontWeight: '800' }}>{data.wardNo || ' '}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>भाग न०</div>
            <div style={{ fontSize: '20px', fontWeight: '800' }}>{data.partNo || ' '}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>क्रम संख्या</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>{data.serialNo || ' '}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '0.5px' }}>
              {data.idNumber || ' '}
            </div>
          </div>
        </div>

        {/* Middle Section: Voter Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '15px', color: '#64748b', width: '140px', fontWeight: '600' }}>मतदाता का नाम :</span>
            <span style={{ fontWeight: '800', fontSize: '22px' }}>{data.voterName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '15px', color: '#64748b', width: '140px', fontWeight: '600' }}>पिता / पति का नाम :</span>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>{data.fatherHusbandName}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
            <div>
              <span style={{ fontSize: '15px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>मकान न० :</span>
              <span style={{ fontWeight: '600' }}>{data.houseNo}</span>
            </div>
            <div>
              <span style={{ fontSize: '15px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>लिंग :</span>
              <span style={{ fontWeight: '600' }}>{data.gender}</span>
            </div>
            <div>
              <span style={{ fontSize: '15px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>आयु :</span>
              <span style={{ fontWeight: '600' }}>{data.age}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Polling Station */}
        <div style={{ backgroundColor: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>मतदान केंद्र :</div>
          <div style={{ fontSize: '16px', lineHeight: '1.4', fontWeight: '600' }}>{data.pollingStation}</div>
        </div>
      </div>
    </div>
  );
});

export default VoterSlip;
