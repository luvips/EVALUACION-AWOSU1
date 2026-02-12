'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface StatusFilterProps {
  options: string[];
  label?: string;
}

export default function StatusFilter({ options, label = 'Estado' }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentStatus = searchParams.get('status') || '';

  const handleChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (status && status !== 'todos') {
      params.set('status', status);
      params.set('page', '1');
    } else {
      params.delete('status');
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div>
      <select
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        className="px-4 py-2 border-2 border-[#6B00BF] text-sm font-bold bg-[#6B00BF] text-white focus:outline-none focus:ring-2 focus:ring-[#6B00BF]"
      >
        <option value="" className="bg-white text-[#6B00BF] font-bold">Todos</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-[#6B00BF] font-bold">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}