import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  activity: { date: string; count: number }[];
}

export default function ActivityChart({ activity }: Props) {
  const data = activity.map((d) => ({
    day: format(parseISO(d.date), 'EEE', { locale: es }),
    count: d.count,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
        Tareas completadas — últimos 7 días
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            width={20}
          />
          <Tooltip
            formatter={(v) => [`${v} tareas`, 'Completadas']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
