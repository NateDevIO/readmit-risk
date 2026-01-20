// components/KPICard.tsx

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export default function KPICard({ title, value, subtitle, icon, trend }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      )}
      {trend && (
        <div className="mt-2 flex items-center">
          <span
            className={`text-sm font-medium ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.positive ? '+' : '-'} {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-sm text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
