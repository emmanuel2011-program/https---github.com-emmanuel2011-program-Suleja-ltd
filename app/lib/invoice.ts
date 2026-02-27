// app/lib/invoice.ts
export type InvoicePayload = { invoiceFor: string; amount: number; customerName?: string; origin: 'coop'; metadata?: Record<string,string> };

export function parseFormData(formData: FormData): InvoicePayload {
  const invoiceFor = (formData.get('invoiceFor')?.toString() ?? '').toLowerCase();
  const amount = Number(formData.get('amount')?.toString() ?? 0);
  const customerName = formData.get('customerName')?.toString() ?? '';
  const metadata: Record<string,string> = {};
  for (const [k, v] of formData.entries()) {
    if (!['invoiceFor','amount','customerName'].includes(k)) metadata[k] = String(v);
  }
  return { invoiceFor, amount: isNaN(amount) ? 0 : amount, customerName, origin: 'coop', metadata };
}

export async function createInvoiceRecord(payload: InvoicePayload) {
  // persist to DB or call external billing API
  return { id: `inv_${Date.now()}`, ...payload, status: 'created', createdAt: new Date().toISOString() };
}
