interface KPI {
  label: string;
  value: string | number;
  subtitle?: string;
}

interface KPICardProps {
  kpis: KPI[];
}

export default function KPICard({ kpis }: KPICardProps) {
  return (
    <div className="border border-[#6B00BF] p-2 mb-4 inline-flex gap-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="flex flex-col">
          <p className="text-[8px] text-[#6B00BF] font-bold uppercase">{kpi.label}</p>
          <p className="text-sm font-bold text-[#6B00BF]">
            {kpi.value}
          </p>
          {kpi.subtitle && (
            <p className="text-[10px] text-gray-600">{kpi.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
