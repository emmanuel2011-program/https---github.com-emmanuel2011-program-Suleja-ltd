import * as React from 'react';

export const LoanReminderEmail = ({ firstName, loanAmount, repaymentDate }: any) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333', lineHeight: '1.5' }}>
    <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>Repayment Reminder</h1>
    
    <p>Hi <strong>{firstName}</strong>,</p>
    
    <p>This is a friendly reminder from <strong>SulejaHH</strong> that your loan cycle is expiring tomorrow.</p>
    
    <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px', margin: '20px 0', borderLeft: '4px solid #dc2626' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li><strong>Amount to Repay:</strong> ₦{loanAmount}</li>
        <li><strong>Due Date:</strong> {repaymentDate}</li>
      </ul>
    </div>

    <div style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', marginTop: '20px' }}>
      <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Payment Instructions:</p>
      <p style={{ margin: '0' }}>Please ensure your repayment is made to the following account:</p>
      <p style={{ margin: '10px 0 0 0', color: '#1a365d' }}>
        <strong>Bank:</strong> ZENITH BANK<br />
        <strong>Account Name:</strong> SHH- MULTIPURPOSE COOPERATIVE SOC LTD.<br />
        <strong>Account Number:</strong> 1310073650
      </p>
    </div>

    <p style={{ marginTop: '20px' }}>Please ignore this message if you have already settled your balance.</p>
    
    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0 10px 0' }} />
    <p style={{ fontSize: '12px', color: '#666' }}>SulejaHH Management System | Automated Notification</p>
  </div>
);