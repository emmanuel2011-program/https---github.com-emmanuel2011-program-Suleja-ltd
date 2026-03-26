import {
  Html,
  Body,
  Container,
  Text,
  Section,
  Heading,
  Hr,
} from '@react-email/components';
import * as React from 'react';

export const GuarantorConfirmationEmail = ({
  guarantorName,
  applicantName,
  loanAmount,
}: {
  guarantorName: string;
  applicantName: string;
  loanAmount: string | number;
}) => {
  // Safe formatting: if it's already a string with commas, use it. 
  // If it's a number, format it.
  const displayAmount = typeof loanAmount === 'number' 
    ? loanAmount.toLocaleString('en-NG') 
    : loanAmount;

  return (
  <Html>
    <Body style={{ backgroundColor: '#f6f9fc', padding: '20px', fontFamily: 'sans-serif' }}>
      <Container style={{ backgroundColor: '#ffffff', border: '1px solid #e1e1e1', padding: '40px', borderRadius: '10px' }}>
        <Heading style={{ color: '#1e40af', fontSize: '22px' }}>
          Guarantor Acknowledgment
        </Heading>
        <Text>Hello <strong>{guarantorName}</strong>,</Text>
        <Text>
          This is to confirm that you have been successfully registered as a guarantor for 
          <strong> {applicantName}</strong> regarding their loan application of 
          <strong> ₦{Number(loanAmount).toLocaleString('en-NG')}</strong>.
        </Text>
        <Section style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <Text style={{ fontSize: '14px', color: '#4b5563' }}>
            By submitting the form, you acknowledge your responsibility as a guarantor for this facility. 
            If you did not authorize this, please contact our support team immediately.
          </Text>
        </Section>
        <Hr style={{ marginTop: '30px', borderColor: '#e5e7eb' }} />
        <Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
          SHHMCSOC Support • Powered by Resend
        </Text>
      </Container>
    </Body>
  </Html>
);  
};