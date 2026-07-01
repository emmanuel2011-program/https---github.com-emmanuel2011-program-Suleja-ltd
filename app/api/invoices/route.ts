import { NextResponse } from 'next/server';
import { parseFormData, createInvoiceRecord } from '@/app/lib/invoice';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload = parseFormData(formData);

    // 1. Validate the data
    if (!payload.invoiceFor || payload.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Member name and a valid amount are required.' }, 
        { status: 400 }
      );
    }

    // 2. Save to database
    const invoice = await createInvoiceRecord(payload);

    // 3. Return success
    return NextResponse.json({ 
      success: true, 
      invoice,
      message: 'Invoice generated successfully!' 
    });

  } catch (error) {
    console.error('DATABASE_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to the database. Please try again.' }, 
      { status: 500 }
    );
  }
}