import React, { forwardRef } from 'react';

const VoterSlip = forwardRef(({ data, style = {} }, ref) => {
  return (
    <div 
      ref={ref}
      style={{ 
        width: '600px', 
        backgroundColor: '#ffffff', 
        color: '#000000', 
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", 
        fontSize: '18px', 
        boxSizing: 'border-box',
        lineHeight: '1.3',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {/* Optional Top Image */}
      {data.topImage && (
        <div style={{ width: '100%', marginBottom: '8px' }}>
          <img src={data.topImage} alt="Banner" style={{ width: '100%', maxHeight: '125px', objectFit: 'contain', display: 'block', border: '1px solid black' }} />
          <div style={{ 
            width: '100%', 
            textAlign: 'center', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            paddingTop: '6px', 
            paddingBottom: '2px', 
            borderBottom: '2px solid black' 
          }}>
            मतदान केंद्र जाने से पहले उपर वाले इस भाग को काट दे
          </div>
        </div>
      )}

      {/* Main Slip Box */}
      <div style={{ border: '3px solid black', padding: '6px 10px', display: 'flex', flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-evenly' }}>
        {/* Row 1: Ward No & Part No */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>वार्ड न० :</span>
            <div style={{ border: '2px solid black', minWidth: '120px', textAlign: 'center', fontWeight: 'bold', padding: '2px 8px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.wardNo || ' '}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>भाग न० :</span>
            <div style={{ border: '2px solid black', minWidth: '120px', textAlign: 'center', fontWeight: 'bold', padding: '2px 8px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.partNo || ' '}
            </div>
          </div>
        </div>
        
        {/* Row 2: Serial No & ID Number */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>क्रम संख्या :</span>
            <div style={{ border: '2px solid black', minWidth: '150px', textAlign: 'center', fontWeight: 'bold', padding: '2px 8px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.serialNo || ' '}
            </div>
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '22px', letterSpacing: '1px' }}>
            {data.idNumber || ' '}
          </div>
        </div>

        {/* Row 3: Voter Name */}
        <div style={{ marginBottom: '4px' }}>
          <span style={{ marginRight: '8px' }}>मतदाता का नाम :</span>
          <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{data.voterName}</span>
        </div>

        {/* Row 4: Father/Husband Name */}
        <div style={{ marginBottom: '6px' }}>
          <span style={{ marginRight: '8px' }}>पिता / पति का नाम :</span>
          <span>{data.fatherHusbandName}</span>
        </div>

        {/* Row 5: House No, Gender, Age */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', paddingRight: '20px' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ marginRight: '6px' }}>मकान न० :</span>
            <span>{data.houseNo}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ marginRight: '6px' }}>लिंग :</span>
            <span>{data.gender}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ marginRight: '6px' }}>आयु :</span>
            <span>{data.age}</span>
          </div>
        </div>

        {/* Row 6: Polling Station */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ marginRight: '8px', whiteSpace: 'nowrap' }}>मतदान केंद्र :</span>
          <span style={{ lineHeight: '1.3' }}>{data.pollingStation}</span>
        </div>
      </div>
    </div>
  );
});

export default VoterSlip;
