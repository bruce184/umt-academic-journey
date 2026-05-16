import * as todoService from "../services/todoService.js";

export async function create(req, res, next) {
  try {
    const todo = await todoService.create(req.user.id, req.body);
    return res.created(todo);
  } catch (err) {
    return next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { items, meta } = await todoService.list(req.user.id, req.query);
    return res.list(items, meta);
  } catch (err) {
    return next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const todo = await todoService.detail(req.user.id, Number(req.params.id));
    return res.ok(todo);
  } catch (err) {
    return next(err);
  }
}

export async function patch(req, res, next) {
  try {
    const todo = await todoService.patch(req.user.id, Number(req.params.id), req.body);
    return res.ok(todo);
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await todoService.remove(req.user.id, Number(req.params.id));
    return res.noContent();
  } catch (err) {
    return next(err);
  }
}
