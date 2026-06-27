import { Router } from 'express';
import { getLists, createList, updateList, deleteList } from '../controllers/lists.controller';
import { getTasksByList, createTask } from '../controllers/tasks.controller';

export const listsRouter = Router();

listsRouter.get('/', getLists);
listsRouter.post('/', createList);
listsRouter.patch('/:id', updateList);
listsRouter.delete('/:id', deleteList);
listsRouter.get('/:id/tasks', getTasksByList);
listsRouter.post('/:id/tasks', createTask);
