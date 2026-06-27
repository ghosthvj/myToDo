import { Request, Response, NextFunction } from 'express';
import { getGlobalStats, getListStats } from '../services/stats.service';

export async function getGlobal(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getGlobalStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getByList(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as Record<string, string>;
    const stats = await getListStats(id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
