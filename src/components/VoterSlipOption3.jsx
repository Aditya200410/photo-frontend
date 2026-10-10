import React, { forwardRef } from 'react';

const VoterSlipOption3 = forwardRef(({ data, style = {} }, ref) => {
  return (
    <div 
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: '#1e293b',
        border: '2px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        ...style
      }}
    >
      {/* Left Box (Details) */}
      <div style={{
        padding: '12px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        justifyContent: 'space-between'
      }}>
        {/* Row 1: Ward and Part */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>वार्ड न०</div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>{data.wardNo || '\u00A0'}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>भाग न०</div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>{data.partNo || '\u00A0'}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>क्रम संख्या</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>{data.serialNo || '\u00A0'}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.5px' }}>{data.idNumber || '\u00A0'}</div>
          </div>
        </div>

        {/* Voter Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '14px', color: '#64748b', width: '130px', fontWeight: '600' }}>मतदाता :</span>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{data.voterName || '\u00A0'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '14px', color: '#64748b', width: '130px', fontWeight: '600' }}>पिता / पति का नाम :</span>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>{data.fatherHusbandName || '\u00A0'}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>मकान न० :</span>
              <span style={{ fontWeight: '600' }}>{data.houseNo || '\u00A0'}</span>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>लिंग :</span>
              <span style={{ fontWeight: '600' }}>{data.gender || '\u00A0'}</span>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>आयु :</span>
              <span style={{ fontWeight: '600' }}>{data.age || '\u00A0'}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>मतदान केंद्र :</div>
          <div style={{ fontSize: '14px', lineHeight: '1.4', fontWeight: '600' }}>{data.pollingStation || '\u00A0'}</div>
        </div>
      </div>

      {/* Middle Divider Text */}
      <div style={{
        width: '32px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderLeft: '1px dashed #cbd5e1',
        borderRight: '1px dashed #cbd5e1'
      }}>
        <div style={{
          position: 'absolute',
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap',
          fontSize: '12px',
          color: '#64748b',
          fontWeight: '600',
          letterSpacing: '1px'
        }}>
          मतदान केंद्र जाने से पहले इस भाग को काट दे
        </div>
      </div>

      {/* Right Box (Symbol) */}
      <div style={{
        width: '140px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 8px',
        boxSizing: 'border-box',
        height: '100%',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', textAlign: 'center' }}>
          चुनाव चिन्ह
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 0' }}>
          {data.symbolImage ? (
            <img 
              src={data.symbolImage} 
              alt="Symbol" 
              style={{ maxWidth: '100%', maxHeight: '110px', objectFit: 'contain' }} 
            />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', textAlign: 'center', border: '2px solid #e2e8f0' }}>
              No Symbol
            </div>
          )}
        </div>

        <div style={{ fontSize: '15px', fontWeight: '800', textAlign: 'center', color: '#0f172a' }}>
          {data.symbolName || 'कमल का फूल'}
        </div>
      </div>
    </div>
  );
});

export default VoterSlipOption3;
