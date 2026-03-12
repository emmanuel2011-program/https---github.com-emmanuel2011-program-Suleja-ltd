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
  // Logic to calculate the reminder date (1 day before) safely
  let formattedDueDate = '';
  let formattedReminderDate = '';

  if (repaymentDate) {
    // Split the date to avoid the "Midnight UTC to WAT" jump
    const [year, month, day] = repaymentDate.split('T')[0].split('-').map(Number);
    const actualDate = new Date(year, month - 1, day);
    
    // Create the reminder date by subtracting 1 day
    const reminderDate = new Date(actualDate);
    reminderDate.setDate(actualDate.getDate() - 1);

    // Format both dates for the Nigerian locale
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
  }

  return (
    <Html>
      <Body style={{ backgroundColor: '#f6f9fc', padding: '20px', fontFamily: 'sans-serif' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e1e1e1',
            padding: '40px',
            borderRadius: '10px',
          }}
        >
          <Heading
            style={{ 
              color: status === 'approved' ? '#166534' : '#991b1b',
              fontSize: '24px',
              marginBottom: '20px'
            }}
          >
            Loan Application {status === 'approved' ? 'Approved' : 'Update'}
          </Heading>
          
          <Text style={{ fontSize: '16px', color: '#333' }}>Hello {firstName},</Text> 
          
          <Section>
            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '24px' }}>
              Your loan application with <strong>SulejaHH Cooperative</strong> has
              been <strong>{status}</strong>.
            </Text>

            {status === 'approved' && amount && (
              <Section style={{ 
                backgroundColor: '#f9fafb', 
                padding: '20px', 
                borderRadius: '8px', 
                margin: '24px 0',
                border: '1px solid #edf2f7'
              }}>
                <Text style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#4a5568' }}>Loan Details:</Text>
                
                {/* Fixed Amount with ₦ Symbol */}
                <Text style={{ margin: '0', color: '#2d3748' }}>
                  Approved Amount: <strong>₦{Number(amount).toLocaleString('en-NG')}</strong>
                </Text>

                {repaymentDate && (
                  <>
                    <Text style={{ margin: '8px 0 0 0', color: '#2d3748' }}>
                      Repayment Due: <strong>{formattedDueDate}</strong>
                    </Text>
                    {/* The "Day Before" Reminder Notice */}
                    <Text style={{ margin: '8px 0 0 0', color: '#166534', fontSize: '14px', fontStyle: 'italic' }}>
                      * An automated reminder will be sent to you on {formattedReminderDate}.
                    </Text>
                  </>
                )}
              </Section>
            )}

            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '24px' }}>
              {status === 'approved' ? (
                'The funds will be disbursed to your registered bank account within 1-3 business days. Please ensure your account details are up to date.'
              ) : (
                'We regret to inform you that we cannot fulfill your request at this time. Please visit the cooperative office or contact support for further details regarding this decision.'
              )}
            </Text>
          </Section>

          <Section style={{ marginTop: '32px' }}>
              <Text style={{ fontSize: '14px', color: '#718096' }}>
                  Questions? <Link href="mailto:support@shhmcsoc.me" style={{ color: '#3182ce', textDecoration: 'underline' }}>Contact our support team</Link>
              </Text>
          </Section>
          
          <Hr style={{ margin: '30px 0', borderColor: '#e1e1e1' }} />
          
          <Section style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', color: '#a0aec0', margin: '0' }}>
                  SulejaHH Multi-Purpose Co-operative Society
              </Text>
              <Text style={{ fontSize: '12px', color: '#a0aec0', margin: '4px 0' }}>
                  Suleja, Niger State, Nigeria
              </Text>
              <Text style={{ fontSize: '11px', color: '#cbd5e0', marginTop: '12px' }}>
                  This is an automated transactional email regarding your membership.
              </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LoanStatusEmail;