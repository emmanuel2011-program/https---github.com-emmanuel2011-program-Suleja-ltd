'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function ExportActiveLoans({ data }: { data: any[] }) {
  const exportToCSV = () => {
    if (data.length === 0) return;

    // 1. Define the headers (The first row of the Excel sheet)
    const headers = [
      "ID", "First Name", "Surname", "Email", "Phone", "TIN", 
      "Loan Amount", "Interest Rate", "Calculated Interest", "Total Due",
      "Request Date", "Repayment Date", "Bank Name", "Account Number", "Status"
    ];

    // 2. Map the data into rows
    const rows = data.map(loan => [
      loan.id,
      loan.first_name,
      loan.surname,
      loan.email,
      loan.mobile_phone,
      loan.tin,
      loan.loan_amount,
      `${loan.interest}%`,
      loan.calculated_interest,
      Number(loan.loan_amount) + Number(loan.calculated_interest),
      new Date(loan.requested_date).toLocaleDateString(),
      new Date(loan.repayment_date).toLocaleDateString(),
      loan.bank_name,
      `'${loan.account_number}`, // The ' prevents Excel from cutting off leading zeros
      loan.status
    ]);

    // 3. Combine headers and rows into a CSV string
    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    // 4. Create the download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `active_loans_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all"
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      Export to Excel
    </button>
  );
}