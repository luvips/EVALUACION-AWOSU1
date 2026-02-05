interface PaginationButtonsProps {
  page: number;
  totalPages: number;
  limit: number;
}

export default function PaginationButtons({ page, totalPages, limit }: PaginationButtonsProps) {
  return (
    <div className="flex gap-2 mt-6 justify-center items-center">
      {page > 1 && (
        <a href={`?page=${page - 1}&limit=${limit}`} className="px-3 py-1 border border-[#6B00BF] text-[#6B00BF] text-sm rounded hover:bg-[#6B00BF] hover:text-white">
          ← Atrás
        </a>
      )}
      <span className="px-3 py-1 text-sm text-gray-700">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <a href={`?page=${page + 1}&limit=${limit}`} className="px-3 py-1 border border-[#6B00BF] text-[#6B00BF] text-sm rounded hover:bg-[#6B00BF] hover:text-white">
          Siguiente →
        </a>
      )}
    </div>
  );
}