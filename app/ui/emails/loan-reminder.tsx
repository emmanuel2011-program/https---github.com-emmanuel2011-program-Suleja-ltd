import * as React from 'react';

export const LoanReminderEmail = ({ firstName, loanAmount, repaymentDate }: any) => {
  let formattedDueDate = 'the scheduled date';
  let formattedReminderDate = 'Today';

  if (repaymentDate && typeof repaymentDate === 'string') {
    try {
      const datePart = repaymentDate.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      
      const actualDueDate = new Date(year, month - 1, day);
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
      formattedDueDate = repaymentDate;
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333', lineHeight: '1.5', maxWidth: '600px', margin: '0 auto', border: '1px solid #eee' }}>
      <h1 style={{ color: '#dc2626', borderBottom: '2px solid #dc2626', paddingBottom: '10px' }}>Repayment Reminder</h1>
      
      <p>Hi <strong>{firstName}</strong>,</p>
      <p>This is a reminder that your loan is due <strong>tomorrow, {formattedDueDate}</strong>.</p>
      
      <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <p style={{ margin: '0' }}><strong>Amount:</strong> ₦{loanAmount}</p>
        <p style={{ margin: '5px 0' }}><strong>Due Date:</strong> {formattedDueDate}</p>
        <p style={{ margin: '0', fontSize: '12px', color: '#991b1b' }}>Reminder Date: {formattedReminderDate}</p>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Bank Details:</p>
        <p style={{ margin: '0' }}>Zenith Bank | 1310073650</p>
        <p style={{ margin: '0' }}>SHH- MULTIPURPOSE COOPERATIVE SOC LTD</p>
      </div>

      <p style={{ fontSize: '12px', color: '#777', marginTop: '30px' }}>SulejaHH Automated System</p>
    </div>
  );
};