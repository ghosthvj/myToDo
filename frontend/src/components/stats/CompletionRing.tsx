import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  completed: number;
  total: number;
  rate: number;
}

export default function CompletionRing({ completed, total, rate }: Props) {
  const remaining = total - completed;
  const data = total === 0
    ? [{ name: 'Sin tareas', value: 1 }]
    : [
        { name: 'Completadas', value: completed },
        { name: 'Pendientes', value: remaining },
      ];

  const COLORS = total === 0 ? ['#e5e7eb'] : ['#6366f1', '#e5e7eb'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
        Completitud global
      </p>
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} tareas`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{rate}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completed} completadas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {remaining} pendientes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
