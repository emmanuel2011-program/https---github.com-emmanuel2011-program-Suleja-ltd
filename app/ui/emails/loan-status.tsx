import {
  Html,
  Body,
  Container,
  Text,
  Section,
  Heading,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

export const LoanStatusEmail = ({
  firstName,
  status,
  amount,
  repaymentDate,
}: {
  firstName: string;
  status: 'approved' | 'rejected';
  amount?: string;
  repaymentDate?: string;
}) => {
  let formattedDueDate = '';
  let formattedReminderDate = '';
  let interestAmount = 0;
  let totalRepayment = 0;

  if (status === 'approved' && amount) {
    // Math: 15% Static Interest
    interestAmount = Number(amount) * 0.15;
    totalRepayment = Number(amount) + interestAmount;
  }

  if (status === 'approved' && repaymentDate && typeof repaymentDate === 'string') {
    try {
      const datePart = repaymentDate.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      const actualDueDate = new Date(year, month - 1, day);
      
      // Calculate the Reminder/Repay Message Date (D - 1)
      const reminderDate = new Date(actualDueDate);
      reminderDate.setDate(actualDueDate.getDate() - 1);

      formattedDueDate = actualDueDate.toLocaleDateString('en-NG', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      formattedReminderDate = reminderDate.toLocaleDateString('en-NG', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) {
      console.error("Date calculation error", e);
    }
  }

  return (
    <Html>
      <Body style={{ backgroundColor: '#f6f9fc', padding: '20px', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', border: '1px solid #e1e1e1', padding: '40px', borderRadius: '10px' }}>
          <Heading style={{ color: status === 'approved' ? '#166534' : '#991b1b', fontSize: '22px' }}>
            Loan Application Statement
          </Heading>
          
          <Text>Hello {firstName}, Your loan has been <strong>{status}</strong>.</Text>

          {status === 'approved' && (
            <Section style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <Text style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>OFFICIAL STATEMENT</Text>
              
              <Text>Principal Amount: <strong>₦{Number(amount).toLocaleString('en-NG')}</strong></Text>
              <Text>Interest Rate: <strong>15% (Static)</strong></Text>
              <Text>Interest Amount: <strong>₦{interestAmount.toLocaleString('en-NG')}</strong></Text>
              
              <Hr style={{ borderColor: '#ddd' }} />
              
              <Text style={{ fontSize: '18px', color: '#1a365d' }}>
                Total Repayment: <strong>₦{totalRepayment.toLocaleString('en-NG')}</strong>
              </Text>

              <Hr style={{ borderColor: '#ddd' }} />

              <Text>Official Due Date: {formattedDueDate}</Text>
              <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>
                Repayment Reminder Date: {formattedReminderDate}
              </Text>
            </Section>
          )}

          <Text style={{ fontSize: '13px', marginTop: '20px', color: '#666' }}>
            * Note: You will receive an automated repayment message on {formattedReminderDate}, exactly one day before your loan expires.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};