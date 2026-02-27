import * as React from 'react';

export const LoanConfirmationEmail = ({ firstName, loanAmount, duration }: any) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#16a34a' }}>Loan Application Received!</h1>
    <p>Hi {firstName},</p>
    <p>Thank you for applying for a loan with us. Here are your application details:</p>
    <ul>
      <li><strong>Amount:</strong> ₦{loanAmount}</li>
      <li><strong>Duration:</strong> {duration}</li>
      <li><strong>Status:</strong> Processing</li>
    </ul>
    <p>We will review your documents and get back to you shortly.</p>
    <hr />
    <p style={{ fontSize: '12px', color: '#666' }}>This is an automated message, please do not reply.</p>
  </div>
);