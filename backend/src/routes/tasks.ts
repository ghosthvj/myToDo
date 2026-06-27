import { Router } from 'express';
import { updateTask, deleteTask, toggleTask, reorderTasks } from '../controllers/tasks.controller';

export const tasksRouter = Router();

tasksRouter.post('/reorder', reorderTasks);
tasksRouter.patch('/:id', updateTask);
tasksRouter.delete('/:id', deleteTask);
tasksRouter.patch('/:id/toggle', toggleTask);
