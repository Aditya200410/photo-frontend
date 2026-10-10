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
        padding: '6px 12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        height: '100%',
        justifyContent: 'space-between',
        borderRight: '1px dashed #cbd5e1'
      }}>
        {/* Row 1: Ward and Part */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr 1.5fr', gap: '2px', marginBottom: '4px', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>वार्ड न०</div>
            <div style={{ fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>{data.wardNo || '\u00A0'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>भाग न०</div>
            <div style={{ fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>{data.partNo || '\u00A0'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>क्रम संख्या</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb', lineHeight: 1 }}>{data.serialNo || '\u00A0'}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '0.5px' }}>{data.idNumber || '\u00A0'}</div>
          </div>
        </div>

        {/* Voter Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '11px', color: '#64748b', width: '90px', fontWeight: '600' }}>मतदाता :</span>
            <span style={{ fontSize: '14px', fontWeight: '800' }}>{data.voterName || '\u00A0'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '11px', color: '#64748b', width: '90px', fontWeight: '600' }}>पिता/पति :</span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.fatherHusbandName || '\u00A0'}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginRight: '4px' }}>मकान:</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.houseNo || '\u00A0'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginRight: '4px' }}>लिंग:</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.gender || '\u00A0'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginRight: '4px' }}>आयु:</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{data.age || '\u00A0'}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginRight: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>मतदान केंद्र :</div>
          <div style={{ fontSize: '11px', fontWeight: '600' }}>{data.pollingStation || '\u00A0'}</div>
        </div>
      </div>

      {/* Right Box (Symbol) */}
      <div style={{
        width: '70px',
        display: 'flex',

        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 4px',
        boxSizing: 'border-box',
        height: '100%',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textAlign: 'center' }}>
          चुनाव चिन्ह
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '4px 0', overflow: 'hidden' }}>
          {data.symbolImage ? (
            <img 
              src={data.symbolImage} 
              alt="Symbol" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', display: 'block' }} 
            />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px', textAlign: 'center', border: '2px solid #e2e8f0' }}>
              No Symbol
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default VoterSlipOption3;
