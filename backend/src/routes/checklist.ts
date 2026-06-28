import { Router } from 'express';
import { getItems, createItem, updateItem, deleteItem } from '../controllers/checklist.controller';

export const checklistRouter = Router({ mergeParams: true });

checklistRouter.get('/', getItems);
checklistRouter.post('/', createItem);
checklistRouter.patch('/:itemId', updateItem);
checklistRouter.delete('/:itemId', deleteItem);
