export const LoanReminderEmail = ({ 
  firstName, 
  loanAmount, 
  repaymentDate 
}: { 
  firstName: string; 
  loanAmount: number | string; 
  repaymentDate: string; 
}) => {
  // 1. Clean and Parse Loan Amount
  // This removes "₦", commas, and spaces so "₦ 10,000" becomes "10000"
  const cleanAmount = typeof loanAmount === 'string' 
    ? loanAmount.replace(/[^0-9.]/g, '') 
    : loanAmount;

  const principal = Number(cleanAmount) || 0; // Fallback to 0 if parsing fails
  const interest = principal * 0.15; // Static 15%
  const totalDue = principal + interest;

  // 2. Date Logic: Actual Due Date vs Reminder Date
  let formattedDueDate = 'Scheduled Date';
  let formattedReminderDate = 'Today';

  if (repaymentDate && typeof repaymentDate === 'string') {
    try {
      // Split to avoid timezone jump in Nigeria (UTC+1)
      const datePart = repaymentDate.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      
      const actualDueDate = new Date(year, month - 1, day);
      
      // Calculate Reminder Date (D - 1)
      const reminderDate = new Date(actualDueDate);
      reminderDate.setDate(actualDueDate.getDate() - 1);

      formattedDueDate = actualDueDate.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      formattedReminderDate = reminderDate.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      formattedDueDate = repaymentDate;
    }
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px', 
      color: '#333', 
      lineHeight: '1.6', 
      maxWidth: '600px', 
      margin: '0 auto', 
      border: '1px solid #e1e1e1',
      borderRadius: '8px'
    }}>
      <h2 style={{ color: '#dc2626', borderBottom: '2px solid #dc2626', paddingBottom: '10px' }}>
        Repayment Reminder
      </h2>
      
      <p>Hello <strong>{firstName}</strong>,</p>
      
      <p>
        This is an automated notification from <strong>SulejaHH Cooperative</strong>. 
        Your loan cycle is expiring <strong>tomorrow</strong>.
      </p>

      <div style={{ 
        backgroundColor: '#fef2f2', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0',
        borderLeft: '5px solid #dc2626'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '18px' }}>Repayment Statement:</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 0' }}>Principal Amount:</td>
              <td style={{ textAlign: 'right' }}>₦{principal.toLocaleString('en-NG')}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0' }}>Interest (15%):</td>
              <td style={{ textAlign: 'right' }}>₦{interest.toLocaleString('en-NG')}</td>
            </tr>
            <tr style={{ fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #fca5a5' }}>
              <td style={{ padding: '10px 0' }}>Total Due:</td>
              <td style={{ textAlign: 'right', padding: '10px 0', color: '#b91c1c' }}>
                 ₦{totalDue.toLocaleString('en-NG')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '0' }}><strong>Official Due Date:</strong> {formattedDueDate}</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
          <em>Note: This reminder was generated on {formattedReminderDate} (24 hours before deadline).</em>
        </p>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>Payment Account Details:</p>
        <p style={{ margin: '0' }}><strong>Bank:</strong> ZENITH BANK</p>
        <p style={{ margin: '0' }}><strong>Account Name:</strong> SHH- MULTIPURPOSE COOPERATIVE SOC LTD</p>
        <p style={{ margin: '0' }}><strong>Account Number:</strong> 1310073650</p>
      </div>

      <p style={{ marginTop: '25px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
        SulejaHH Management System | Automated Notification
      </p>
    </div>
  );
};