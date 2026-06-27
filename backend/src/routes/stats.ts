import { Router } from 'express';
import { getGlobal, getByList } from '../controllers/stats.controller';

export const statsRouter = Router();

statsRouter.get('/', getGlobal);
statsRouter.get('/lists/:id', getByList);
