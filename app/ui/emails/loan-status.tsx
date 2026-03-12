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
  status: string; // Changed to general string for safety
  amount?: string | number;
  repaymentDate?: any; // Changed to any to handle Date objects or Strings
}) => {
  let formattedDueDate = 'Not Set';
  let formattedReminderDate = 'Not Set';
  let interestAmount = 0;
  let totalRepayment = 0;

  // Normalize status for comparison
  const isApproved = status?.toLowerCase() === 'approved';

  if (isApproved && amount) {
    interestAmount = Number(amount) * 0.15;
    totalRepayment = Number(amount) + interestAmount;
  }

  if (isApproved && repaymentDate) {
    try {
      let actualDueDate: Date;

      if (typeof repaymentDate === 'string') {
        // Handle ISO string from database
        const datePart = repaymentDate.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        actualDueDate = new Date(year, month - 1, day);
      } else {
        // Handle if it's already a Date object
        actualDueDate = new Date(repaymentDate);
      }

      // Calculate Reminder Date (D - 1)
      const reminderDate = new Date(actualDueDate);
      reminderDate.setDate(actualDueDate.getDate() - 1);

      // Formatting
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      formattedDueDate = actualDueDate.toLocaleDateString('en-NG', options);
      formattedReminderDate = reminderDate.toLocaleDateString('en-NG', options);
      
    } catch (e) {
      console.error("Date calculation error", e);
      formattedDueDate = "Invalid Date";
      formattedReminderDate = "Invalid Date";
    }
  }

  return (
    <Html>
      <Body style={{ backgroundColor: '#f6f9fc', padding: '20px', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', border: '1px solid #e1e1e1', padding: '40px', borderRadius: '10px' }}>
          <Heading style={{ color: isApproved ? '#166534' : '#991b1b', fontSize: '22px' }}>
            Loan Application {isApproved ? 'Statement' : 'Update'}
          </Heading>
          
          <Text>Hello {firstName}, Your loan has been <strong>{status}</strong>.</Text>

          {isApproved && (
            <Section style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <Text style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>OFFICIAL STATEMENT</Text>
              
              <Text>Principal Amount: <strong>₦{Number(amount).toLocaleString('en-NG')}</strong></Text>
              <Text>Interest Rate: <strong>15%</strong></Text>
              <Text>Interest Amount: <strong>₦{interestAmount.toLocaleString('en-NG')}</strong></Text>
              
              <Hr style={{ borderColor: '#ddd' }} />
              
              <Text style={{ fontSize: '18px', color: '#1a365d' }}>
                Total Repayment: <strong>₦{totalRepayment.toLocaleString('en-NG')}</strong>
              </Text>

              <Hr style={{ borderColor: '#ddd' }} />

              <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>
                Repayment Reminder Date: {formattedReminderDate}
              </Text>
            </Section>
          )}

          {isApproved && (
            <Text style={{ fontSize: '13px', marginTop: '20px', color: '#666' }}>
              * Note: You will receive an automated repayment message on <strong>{formattedReminderDate}</strong>, exactly one day before your loan expires.
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
};