import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarClock,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useGlobalStats } from '../../hooks/useStats';
import MetricCard from './MetricCard';
import CompletionRing from './CompletionRing';
import ActivityChart from './ActivityChart';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f97316',
  URGENT: '#ef4444',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export default function StatsPanel() {
  const { data: stats, isLoading } = useGlobalStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const priorityData = stats.byPriority.map((p) => ({
    name: PRIORITY_LABELS[p.priority] ?? p.priority,
    value: p.count,
    color: PRIORITY_COLORS[p.priority] ?? '#6b7280',
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 items-start">
        <MetricCard
          title="Total tareas"
          value={stats.total}
          icon={<ListTodo size={20} />}
          color="#6366f1"
        />
        <MetricCard
          title="Completadas"
          value={stats.completed}
          icon={<CheckCircle2 size={20} />}
          color="#22c55e"
        />
        <MetricCard
          title="Pendientes"
          value={stats.pending}
          icon={<Clock size={20} />}
          color="#f97316"
        />
        <MetricCard
          title="En progreso"
          value={stats.inProgress}
          icon={<TrendingUp size={20} />}
          color="#3b82f6"
        />
        <MetricCard
          title="Vencen pronto"
          value={stats.dueSoon}
          subtitle="próximos 7 días"
          icon={<CalendarClock size={20} />}
          color="#eab308"
        />
        <MetricCard
          title="Atrasadas"
          value={stats.overdue}
          icon={<AlertCircle size={20} />}
          color="#ef4444"
          highlight={stats.overdue > 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CompletionRing
          completed={stats.completed}
          total={stats.total}
          rate={stats.completionRate}
        />

        <ActivityChart activity={stats.activity} />

        {priorityData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              Tareas por prioridad
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={55} dataKey="value" strokeWidth={0}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} tareas`]} />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {stats.byList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Progreso por lista
          </p>
          <div className="space-y-3">
            {stats.byList.map((list) => (
              <div key={list.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{list.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {list.completed}/{list.total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: list.total > 0 ? `${Math.round((list.completed / list.total) * 100)}%` : '0%',
                      backgroundColor: list.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
