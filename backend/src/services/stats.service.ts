import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getGlobalStats() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, completed, pending, inProgress, dueSoon, overdue] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({ where: { status: 'PENDING' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({
      where: {
        status: { not: 'COMPLETED' },
        dueDate: { gte: now, lte: sevenDaysFromNow },
      },
    }),
    prisma.task.count({
      where: {
        status: { not: 'COMPLETED' },
        dueDate: { lt: now },
      },
    }),
  ]);

  const lists = await prisma.taskList.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
  });

  const byList = lists.map((list) => ({
    id: list.id,
    name: list.name,
    color: list.color,
    total: list._count.tasks,
    completed: list.tasks.filter((t) => t.status === 'COMPLETED').length,
    pending: list.tasks.filter((t) => t.status !== 'COMPLETED').length,
  }));

  const byPriority = await prisma.task.groupBy({
    by: ['priority'],
    _count: true,
  });

  const recentCompleted = await prisma.task.findMany({
    where: { status: 'COMPLETED', completedAt: { gte: sevenDaysAgo } },
    select: { completedAt: true },
  });

  const activityMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    activityMap[d.toISOString().split('T')[0]] = 0;
  }
  for (const task of recentCompleted) {
    if (task.completedAt) {
      const day = task.completedAt.toISOString().split('T')[0];
      if (day in activityMap) activityMap[day]++;
    }
  }
  const activity = Object.entries(activityMap).map(([date, count]) => ({ date, count }));

  return {
    total,
    completed,
    pending,
    inProgress,
    dueSoon,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byList,
    byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count })),
    activity,
  };
}

export async function getListStats(listId: string) {
  const tasks = await prisma.task.findMany({
    where: { listId },
    select: { status: true, priority: true },
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return {
    total,
    completed,
    pending,
    inProgress,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
