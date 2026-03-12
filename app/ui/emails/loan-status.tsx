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

  // Safety: Check if repaymentDate exists and is a string before splitting
  if (status === 'approved' && repaymentDate && typeof repaymentDate === 'string') {
    try {
      const datePart = repaymentDate.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      
      // Lock to local date to avoid UTC rollover
      const actualDate = new Date(year, month - 1, day);
      
      const reminderDate = new Date(actualDate);
      reminderDate.setDate(actualDate.getDate() - 1);

      formattedDueDate = actualDate.toLocaleDateString('en-NG', {
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
      console.error("Error formatting Status Date:", e);
    }
  }

  return (
    <Html>
      <Body style={{ backgroundColor: '#f6f9fc', padding: '20px', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', border: '1px solid #e1e1e1', padding: '40px', borderRadius: '10px' }}>
          <Heading style={{ color: status === 'approved' ? '#166534' : '#991b1b', fontSize: '24px' }}>
            Loan Application {status === 'approved' ? 'Approved' : 'Rejected'}
          </Heading>
          
          <Text style={{ fontSize: '16px', color: '#333' }}>Hello {firstName},</Text> 
          
          <Section>
            <Text style={{ fontSize: '16px', color: '#333' }}>
              Your application with <strong>SulejaHH Cooperative</strong> has been <strong>{status}</strong>.
            </Text>

            {status === 'approved' && amount && (
              <Section style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', margin: '24px 0', border: '1px solid #edf2f7' }}>
                <Text style={{ fontWeight: 'bold' }}>Loan Details:</Text>
                <Text>Amount: <strong>₦{Number(amount).toLocaleString('en-NG')}</strong></Text>
                
                {formattedDueDate && (
                  <>
                    <Text>Due Date: <strong>{formattedDueDate}</strong></Text>
                    <Text style={{ color: '#166534', fontSize: '14px', marginTop: '10px' }}>
                      * We will send you a reminder on <strong>{formattedReminderDate}</strong>.
                    </Text>
                  </>
                )}
              </Section>
            )}
          </Section>

          <Hr style={{ margin: '30px 0', borderColor: '#e1e1e1' }} />
          <Section style={{ textAlign: 'center' as const }}>
            <Text style={{ fontSize: '12px', color: '#a0aec0' }}>SulejaHH Multi-Purpose Co-operative Society</Text>
            <Text style={{ fontSize: '12px', color: '#a0aec0' }}>Suleja, Niger State, Nigeria</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};