import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRIORITY_ORDER: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
};

export async function getTasksByList(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { sort = 'manualOrder', order = 'asc', status } = req.query as Record<string, string>;

    const validSorts = ['manualOrder', 'dueDate', 'createdAt', 'title'];
    const sortField = validSorts.includes(sort) ? sort : 'manualOrder';

    const where: Record<string, unknown> = { listId: id };
    if (status) where.status = status.toUpperCase();

    if (sort === 'priority') {
      const tasks = await prisma.task.findMany({ where });
      tasks.sort((a, b) => {
        const aP = PRIORITY_ORDER[a.priority] ?? 0;
        const bP = PRIORITY_ORDER[b.priority] ?? 0;
        return order === 'desc' ? bP - aP : aP - bP;
      });
      res.json(tasks);
    } else {
      const tasks = await prisma.task.findMany({
        where,
        orderBy: { [sortField]: order === 'desc' ? 'desc' : 'asc' },
      });
      res.json(tasks);
    }
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: listId } = req.params;
    const { title, description, priority, dueDate, tags } = req.body;

    const count = await prisma.task.count({ where: { listId } });

    const task = await prisma.task.create({
      data: {
        listId,
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
        manualOrder: count,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, tags, status } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags.join(',') : tags }),
        ...(status !== undefined && { status }),
      },
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function toggleTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUniqueOrThrow({ where: { id } });

    const isCompleted = task.status === 'COMPLETED';
    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: isCompleted ? 'PENDING' : 'COMPLETED',
        completedAt: isCompleted ? null : new Date(),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function reorderTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const { tasks } = req.body as { tasks: { id: string; manualOrder: number }[] };

    await prisma.$transaction(
      tasks.map((t) =>
        prisma.task.update({
          where: { id: t.id },
          data: { manualOrder: t.manualOrder },
        })
      )
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
