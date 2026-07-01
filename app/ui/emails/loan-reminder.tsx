export const LoanReminderEmail = ({ 
  firstName, 
  loanAmount, 
  interestRate,     // Added: monthly rate (e.g., 15)
  requestDate,      // Added: to calculate months elapsed
  amountPaid = 0,   // Added: to show remaining balance
}: { 
  firstName: string; 
  loanAmount: number | string; 
  interestRate: number | string;
  requestDate: string;
  amountPaid?: number;
}) => {
  // 1. Parse Inputs
  const principal = Number(typeof loanAmount === 'string' ? loanAmount.replace(/[^0-9.]/g, '') : loanAmount) || 0;
  const rate = Number(typeof interestRate === 'string' ? interestRate.replace(/[^0-9.]/g, '') : interestRate) || 0;
  const paidSoFar = Number(amountPaid) || 0;

  // 2. Calculate Months Elapsed (Matching your Table Logic)
  const requestDateObj = new Date(requestDate);
  const today = new Date();
  const diffTime = Math.max(0, today.getTime() - requestDateObj.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const monthsElapsed = Math.ceil(diffDays / 30) || 1;

  // 3. Formula: Principal + (Interest * Months)
  const totalInterestAccrued = (principal * (rate / 100)) * monthsElapsed;
  const totalDebt = principal + totalInterestAccrued;
  const remainingBalance = totalDebt - paidSoFar;

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
        Loan Repayment Update
      </h2>
      
      <p>Hello <strong>{firstName}</strong>,</p>
      
      <p>This is a summary of your outstanding loan balance as of today.</p>

      <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '8px', margin: '20px 0', borderLeft: '5px solid #dc2626' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 0' }}>Original Principal:</td>
              <td style={{ textAlign: 'right' }}>₦{principal.toLocaleString('en-NG')}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0' }}>Accrued Interest ({monthsElapsed === 1 ? 'Month 1' : `${monthsElapsed} months`}):</td>
              <td style={{ textAlign: 'right' }}>₦{totalInterestAccrued.toLocaleString('en-NG')}</td>
            </tr>
            <tr style={{ color: '#059669' }}>
              <td style={{ padding: '5px 0' }}>Total Paid to Date:</td>
              <td style={{ textAlign: 'right' }}>-₦{paidSoFar.toLocaleString('en-NG')}</td>
            </tr>
            <tr style={{ fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #fca5a5' }}>
              <td style={{ padding: '10px 0' }}>Current Balance Owed:</td>
              <td style={{ textAlign: 'right', padding: '10px 0', color: '#b91c1c' }}>
                 ₦{Math.max(0, remainingBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>Payment Account:</p>
        <p style={{ margin: '0' }}><strong>ZENITH BANK</strong> | 1310073650</p>
        <p style={{ margin: '0' }}>SHH- MULTIPURPOSE COOPERATIVE SOC LTD</p>
      </div>

      <p style={{ marginTop: '25px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
        Interest accrues every 30 days based on your contract terms.
      </p>
    </div>
  );
};