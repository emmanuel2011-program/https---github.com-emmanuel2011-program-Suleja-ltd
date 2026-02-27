import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function CreateLoan() {
  return (
    <Link
      href="/dashboard/loans/create"
      className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
    >
      <span className="hidden md:block">Create Loan</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateLoan({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/loans/${id}/edit`}
      className="rounded-md border p-2 hover:bg-green-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteLoan({ id }: { id: string }) {
  return (
    <button
      type="submit"
      className="rounded-md border p-2 hover:bg-green-100"
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}
