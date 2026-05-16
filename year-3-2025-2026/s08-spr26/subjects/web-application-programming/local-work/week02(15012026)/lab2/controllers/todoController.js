import {
  createTodo,
  listTodos,
  getTodoById,
  patchTodo,
  deleteTodo
} from "../services/todoService.js";

export function create(req, res, next) {
  try {
    const todo = createTodo({ userId: req.user.id, ...req.body });
    res.created(todo);
  } catch (err) {
    next(err);
  }
}

export function list(req, res, next) {
  try {
    const status = req.validatedQuery?.status;
    const items = listTodos({ userId: req.user.id, status });
    res.ok(items, { count: items.length });
  } catch (err) {
    next(err);
  }
}

export function detail(req, res, next) {
  try {
    const todo = getTodoById({ userId: req.user.id, todoId: req.params.id });
    res.ok(todo);
  } catch (err) {
    next(err);
  }
}

export function patch(req, res, next) {
  try {
    const todo = patchTodo({ userId: req.user.id, todoId: req.params.id, patch: req.body });
    res.ok(todo);
  } catch (err) {
    next(err);
  }
}

export function remove(req, res, next) {
  try {
    deleteTodo({ userId: req.user.id, todoId: req.params.id });
    res.noContent();
  } catch (err) {
    next(err);
  }
}
