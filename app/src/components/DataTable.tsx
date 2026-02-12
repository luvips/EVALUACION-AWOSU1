interface DataTableProps {
  title: string;
  columns: string[];
  data: any[];
}

export default function DataTable({ title, columns, data }: DataTableProps) {
  const periodColumnIndex = columns.findIndex((col) => col.toLowerCase().includes('período') || col.toLowerCase().includes('periodo'));

  return (
    <div className="p-0 bg-white w-full">
      <h2 className="text-lg font-bold text-[#6B00BF] mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#6B00BF]">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`border border-[#6B00BF] px-3 py-3 text-left text-white text-sm font-semibold ${
                    i === periodColumnIndex ? 'min-w-[110px] whitespace-normal break-words leading-tight' : 'whitespace-nowrap'
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 border-b border-gray-200">
                {Object.values(row).map((value: any, j) => (
                  <td
                    key={j}
                    className={`border border-[#6B00BF] px-3 py-2 text-gray-800 text-sm ${
                      j === periodColumnIndex ? 'min-w-[110px] whitespace-normal break-words leading-tight' : 'whitespace-nowrap'
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}