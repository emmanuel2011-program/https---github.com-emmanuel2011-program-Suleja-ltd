'use client';
import { useState } from 'react';

export default function LoanForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set('invoiceFor', 'loan');

    const res = await fetch('/api/invoices', { method: 'POST', body: fd });
    const json = await res.json();
    setLoading(false);

    if (json.success) {
      setMsg('Invoice created');
      e.currentTarget.reset(); // clear DOM form
      // also reset your React form state if you use controlled inputs
    } else {
      setMsg(`Error: ${json.error}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="amount" type="number" required />
      <input name="customerName" type="text" />
      <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Invoice'}</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
