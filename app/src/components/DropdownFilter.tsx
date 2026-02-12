'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function DropdownFilter({ 
  paramName,
  placeholder,
  options,
  defaultValue
}: { 
  paramName: string;
  placeholder: string;
  options: string[];
  defaultValue: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="min-w-[200px] w-auto flex-shrink-0 px-4 py-2 border-2 border-[#6B00BF] text-sm font-bold bg-[#6B00BF] text-white whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#6B00BF]"
      defaultValue={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="" className="bg-white text-[#6B00BF] font-bold">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option} className="bg-white text-[#6B00BF] font-bold">{option}</option>
      ))}
    </select>
  );
}
