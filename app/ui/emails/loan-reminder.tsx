import * as React from 'react';

export const LoanReminderEmail = ({ firstName, loanAmount, repaymentDate }: any) => {
  // Logic to handle the "Day Before" calculation safely
  let formattedReminderDate = 'Today';
  let formattedDueDate = repaymentDate;

  if (repaymentDate) {
    try {
      // Split to avoid timezone shifting (UTC to WAT)
      const [year, month, day] = repaymentDate.split('T')[0].split('-').map(Number);
      const actualDueDate = new Date(year, month - 1, day);
      
      // Calculate Reminder Date (1 day before)
      const reminderDate = new Date(actualDueDate);
      reminderDate.setDate(actualDueDate.getDate() - 1);

      formattedDueDate = actualDueDate.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      formattedReminderDate = reminderDate.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      console.error("Date formatting error", e);
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333', lineHeight: '1.5' }}>
      <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>Repayment Reminder</h1>
      
      <p>Hi <strong>{firstName}</strong>,</p>
      
      <p>
        This is a friendly reminder from <strong>SulejaHH</strong> that your loan cycle is expiring 
        <strong> tomorrow, {formattedDueDate}</strong>.
      </p>
      
      <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px', margin: '20px 0', borderLeft: '4px solid #dc2626' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '8px' }}><strong>Amount to Repay:</strong> ₦{loanAmount}</li>
          <li style={{ marginBottom: '8px' }}><strong>Official Due Date:</strong> {formattedDueDate}</li>
          <li><small style={{ color: '#666' }}>Reminder Generated On: {formattedReminderDate}</small></li>
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
};