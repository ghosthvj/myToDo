import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params as Record<string, string>;
    const items = await prisma.checklistItem.findMany({
      where: { listId },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params as Record<string, string>;
    const { text } = req.body;
    const count = await prisma.checklistItem.count({ where: { listId } });
    const item = await prisma.checklistItem.create({
      data: { listId, text, sortOrder: count },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { itemId } = req.params as Record<string, string>;
    const { text, done } = req.body;
    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(text !== undefined && { text }),
        ...(done !== undefined && { done }),
      },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { itemId } = req.params as Record<string, string>;
    await prisma.checklistItem.delete({ where: { id: itemId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
