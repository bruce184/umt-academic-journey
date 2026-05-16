import * as todoService from '../services/todo-s.js';

export const createTodo = async (req, res, next) => {
  try {
    const todo = await todoService.createTodo(req.user.id, req.body);
    // Sanitize user_id from response
    const { user_id, ...rest } = todo;
    res.created(rest);
  } catch (err) {
    next(err);
  }
};

export const getTodo = async (req, res, next) => {
  try {
    const todo = await todoService.getTodo(req.user.id, req.params.id);
    const { user_id, ...rest } = todo;
    res.ok(rest);
  } catch (err) {
    next(err);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    const todo = await todoService.updateTodo(req.user.id, req.params.id, req.body);
    const { user_id, ...rest } = todo;
    res.ok(rest);
  } catch (err) {
    next(err);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    await todoService.deleteTodo(req.user.id, req.params.id);
    res.noContent();
  } catch (err) {
    next(err);
  }
};

export const listTodos = async (req, res, next) => {
  try {
    const { items, meta } = await todoService.listTodos(req.user.id, req.query);
    res.list(items, meta);
  } catch (err) {
    next(err);
  }
};
