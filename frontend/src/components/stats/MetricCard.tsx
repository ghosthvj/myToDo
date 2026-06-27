interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  highlight?: boolean;
}

export default function MetricCard({ title, value, subtitle, icon, color = '#6366f1', highlight }: Props) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm ${
        highlight
          ? 'border-red-200 dark:border-red-900'
          : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
