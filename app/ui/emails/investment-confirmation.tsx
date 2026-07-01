import React from 'react';

export const InvestmentConfirmationEmail = ({ 
  amount, 
  duration, 
  interest 
}: { 
  amount: number; 
  duration: string; 
  interest: number; 
}) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h2 style={{ color: '#2563eb' }}>Investment Received!</h2>
    <p>Thank you for investing with <strong>SulejaHH MCoop</strong>. Your investment details are being verified.</p>
    
    <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
      {/* FIXED: Removed parseFloat because amount is already a number */}
      <p><strong>Amount:</strong> ₦{amount.toLocaleString('en-NG')}</p> 
      
      <p><strong>Duration:</strong> {duration}</p>
      <p><strong>Estimated ROI:</strong> ₦{interest.toLocaleString('en-NG')}</p>
    </div>

    <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
      This is an automated confirmation. No further action is required at this time.
    </p>
  </div>
);