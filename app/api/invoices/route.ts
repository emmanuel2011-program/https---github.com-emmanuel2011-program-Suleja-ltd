// app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { parseFormData, createInvoiceRecord } from '@/app/lib/invoice';

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = parseFormData(formData);
  if (!payload.invoiceFor || payload.amount <= 0) {
    return NextResponse.json({ success: false, error: 'Missing or invalid fields' }, { status: 400 });
  }
  const invoice = await createInvoiceRecord(payload);
  return NextResponse.json({ success: true, invoice });
}
