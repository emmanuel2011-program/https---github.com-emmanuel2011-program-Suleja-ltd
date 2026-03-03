'use client';

import { useState } from 'react';
import { 
  UserCircleIcon, 
  UsersIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

export default function MemberTableWrapper({ members }: { members: any[] }) {
  const [isExplored, setIsExplored] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering logic for the search bar
  const filteredMembers = members.filter((member) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(searchStr) ||
      member.surname?.toLowerCase().includes(searchStr) ||
      member.email?.toLowerCase().includes(searchStr) ||
      member.mobile_phone?.includes(searchTerm)
    );
  });

  // STATE 1: The "Explore" Button (Shown before clicking)
  if (!isExplored) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-green-200 rounded-xl bg-green-50/50">
        <UsersIcon className="h-16 w-16 text-green-600 mb-4 opacity-40" />
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Explore List of Members</h2>
        <button
          onClick={() => setIsExplored(true)}
          className="bg-green-700 text-white px-10 py-3 rounded-lg font-bold hover:bg-green-800 transition-all shadow-lg active:scale-95"
        >
          View All Members
        </button>
      </div>
    );
  }

  // STATE 2: The Searchable Table (Shown after clicking)
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Live Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex flex-1 flex-shrink-0">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:border-green-600 focus:ring-green-600"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-green-600" />
        </div>
        <p className="mt-2 text-xs text-gray-500 italic">
          Showing {filteredMembers.length} of {members.length} records
        </p>
      </div>

      <div className="mt-4 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0 shadow-sm border border-gray-200">
            <table className="min-w-full text-gray-900">
              <thead className="rounded-lg text-left text-sm font-semibold text-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-3 py-5 font-medium uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-3 py-5 font-medium uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-3 py-5 font-medium uppercase tracking-wider text-center">Gender</th>
                  <th scope="col" className="px-3 py-5 font-medium uppercase tracking-wider text-center">Nationality</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-green-50/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 flex items-center gap-2">
                      <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {member.title} {member.first_name} {member.surname}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{member.email}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{member.mobile_phone}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-center font-semibold text-blue-600">
                      {member.gender}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-center text-gray-500">
                      {member.nationality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty Search Result */}
            {filteredMembers.length === 0 && (
              <div className="p-10 text-center bg-white">
                <p className="text-gray-500 italic">No members found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close Button to return to the button-only state */}
      <button 
        onClick={() => { setIsExplored(false); setSearchTerm(''); }}
        className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors mx-auto"
      >
        <XMarkIcon className="h-4 w-4" /> Close and Lock Directory
      </button>
    </div>
  );
}