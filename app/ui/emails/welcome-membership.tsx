import * as React from 'react';

export const WelcomeMembershipEmail = ({ firstName, surname }: any) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333', border: '1px solid #eee', borderRadius: '10px' }}>
    <h1 style={{ color: '#16a34a' }}>Welcome to the Cooperative!</h1>
    <p>Hi {firstName} {surname},</p>
    <p>Your membership registration has been successfully processed. We are excited to have you with us!</p>
    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Log in to your dashboard to view your status.</li>
        <li>Complete your initial savings deposit.</li>
        <li>Browse available loan products.</li>
      </ul>
    </div>
    <p>If you didn't perform this registration, please contact our support team immediately.</p>
    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
    <p style={{ fontSize: '12px', color: '#666' }}>&copy; 2026 Cooperative Management System</p>
  </div>
);