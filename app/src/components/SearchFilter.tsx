'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

interface SearchFilterProps {
  placeholder?: string;
}

export default function SearchFilter({ placeholder = 'Buscar...' }: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get('query') || '');

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set('query', term);
      params.set('page', '1');
    } else {
      params.delete('query');
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex-1 relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 border-2 border-[#6B00BF] text-sm text-[#6B00BF] font-bold placeholder-[#6B00BF] focus:outline-none focus:border-[#6B00BF] focus:ring-2 focus:ring-[#6B00BF]"
      />
      <svg
        className="absolute left-3 top-2.5 w-5 h-5 text-[#6B00BF]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}