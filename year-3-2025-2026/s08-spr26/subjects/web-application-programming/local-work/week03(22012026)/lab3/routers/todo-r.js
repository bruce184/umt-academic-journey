import express from 'express';
import { protect } from '../middlewares/auth-mw.js';
import { validate } from '../middlewares/validate-mw.js';
import * as todoController from '../controllers/todo-c.js';
import { todoSchemas } from '../utils/schemas.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  validate(todoSchemas.create, 'body'),
  todoController.createTodo
);

router.get(
  '/',
  validate(todoSchemas.query, 'query'),
  todoController.listTodos
);

router.get(
  '/:id',
  validate(todoSchemas.paramsId, 'params'),
  todoController.getTodo
);

router.patch(
  '/:id',
  validate(todoSchemas.paramsId, 'params'),
  validate(todoSchemas.update, 'body'),
  todoController.updateTodo
);

router.delete(
  '/:id',
  validate(todoSchemas.paramsId, 'params'),
  todoController.deleteTodo
);

export default router;
