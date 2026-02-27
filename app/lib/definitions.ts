export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type MonthlyLoan = {
  month: string;
  loan_amount: number;
};

// Represents a Member of the Cooperative
export type Membership = {
  id: string;
  title: string;
  firstName: string; // Changed to camelCase
  surname: string;
  email: string;
  mobilePhone: string; // Changed to camelCase
  gender: string;
  dateOfBirth: string; // Changed to camelCase
  nationality: string;
  residentialAddress: string; // Changed to camelCase
  tin: string | null;
};

// For the LatestLoans component on the Dashboard
export type LatestLoan = {
  id: string;
  firstName: string; // Changed to camelCase
  surname: string;
  email: string;
  loanAmount: number; // Changed to camelCase
  requestDate: string; // Changed to camelCase
};

// Raw data from the database before formatting
export type LatestLoanRaw = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  loanAmount: number;
};

export type LoanApplication = {
  id: string;
  memberId: string; // Changed to camelCase
  loanAmount: number; // Changed to camelCase
  duration: string;
  interest: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestDate: string; // Changed to camelCase
  purposeOfLoan: string; // Added this
};

export type Revenue = {
  month: string;
  revenue: number;
};

// Summary Data for Dashboard Cards
export type CardData = {
  numberOfMembers: number;
  numberOfLoans: number;
  totalLoanAmount: number;
};

// Keep these to satisfy the leftover tutorial UI components
export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};