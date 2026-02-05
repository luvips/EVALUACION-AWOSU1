'use client';

import { useSearchParams } from 'next/navigation';

interface PaginationButtonsProps {
  page: number;
  totalPages: number;
  limit: number;
}

export default function PaginationButtons({ page, totalPages, limit }: PaginationButtonsProps) {
  const searchParams = useSearchParams();

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    params.set('limit', String(limit));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex gap-2 mt-6 justify-center items-center">
      {page > 1 && (
        <a href={buildHref(page - 1)} className="px-3 py-1 border border-[#6B00BF] text-[#6B00BF] text-sm rounded hover:bg-[#6B00BF] hover:text-white">
          ← Atrás
        </a>
      )}
      <span className="px-3 py-1 text-sm text-gray-700">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <a href={buildHref(page + 1)} className="px-3 py-1 border border-[#6B00BF] text-[#6B00BF] text-sm rounded hover:bg-[#6B00BF] hover:text-white">
          Siguiente →
        </a>
      )}
    </div>
  );
}