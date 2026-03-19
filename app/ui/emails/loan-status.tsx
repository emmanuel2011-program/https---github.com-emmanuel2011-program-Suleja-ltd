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
  interestAmount, // Added to match actions.ts
  totalRepayment, // Added to match actions.ts
  repaymentDate,
}: {
  firstName: string;
  status: string;
  amount: number | string;
  interestAmount: number | string; // Prop defined here
  totalRepayment: number | string; // Prop defined here
  repaymentDate?: any;
}) => {
  let formattedReminderDate = 'Not Set';

  // Normalize status for comparison
  const isApproved = status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'active';

  if (isApproved && repaymentDate) {
    try {
      let actualDueDate: Date;

      if (typeof repaymentDate === 'string') {
        // If it's a "Day Month Year" string from server, or ISO string
        actualDueDate = new Date(repaymentDate);
      } else {
        actualDueDate = new Date(repaymentDate);
      }

      // Calculate Reminder Date (1 day before)
      const reminderDate = new Date(actualDueDate);
      reminderDate.setDate(actualDueDate.getDate() - 1);

      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      formattedReminderDate = reminderDate.toLocaleDateString('en-NG', options);
      
    } catch (e) {
      console.error("Date calculation error", e);
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
              <Text>Interest Amount: <strong>₦{Number(interestAmount).toLocaleString('en-NG')}</strong></Text>
              
              <Hr style={{ borderColor: '#ddd' }} />
              
              <Text style={{ fontSize: '18px', color: '#1a365d' }}>
                Total Repayment: <strong>₦{Number(totalRepayment).toLocaleString('en-NG')}</strong>
              </Text>

              <Hr style={{ borderColor: '#ddd' }} />

              <Text>Due Date: <strong>{repaymentDate}</strong></Text>

              <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>
                Repayment Reminder Date: {formattedReminderDate}
              </Text>
            </Section>
          )}

          {!isApproved && status.toLowerCase() === 'rejected' && (
            <Text>We regret to inform you that your loan application was not successful at this time.</Text>
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