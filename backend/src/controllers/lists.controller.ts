import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getLists(req: Request, res: Response, next: NextFunction) {
  try {
    const lists = await prisma.taskList.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          select: { id: true },
        },
      },
    });
    res.json(lists);
  } catch (err) {
    next(err);
  }
}

export async function createList(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, color, icon } = req.body;
    const count = await prisma.taskList.count();
    const list = await prisma.taskList.create({
      data: { name, color: color || '#6366f1', icon, sortOrder: count },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
}

export async function updateList(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, color, icon, sortOrder } = req.body;
    const list = await prisma.taskList.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function deleteList(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.taskList.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
