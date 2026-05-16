import AppError from "../utils/app-error.js";
import {
  createTodo,
  findTodoById,
  listTodos,
  updateTodo,
  deleteTodo
} from "../models/todoModel.js";

async function mustBeOwner(todoId, userId) {
  const todo = await findTodoById(todoId);

  // Policy: Return 404 to hide resource existence if not owner or not found
  if (!todo || todo.user_id !== userId) {
    throw new AppError({
      statusCode: 404,
      code: "TODO_NOT_FOUND",
      message: "Todo not found"
    });
  }

  return todo;
}

export async function create(userId, body) {
  const payload = {
    user_id: userId,
    title: body.title,
    description: body.description ?? null,
    status: body.status ?? "PENDING",
    due_date: body.due_date ?? null
  };

  const [todo] = await createTodo(payload);
  return todo;
}

export async function list(userId, query) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const { items, totalItems } = await listTodos({
    userId,
    status: query.status,
    limit,
    offset
  });

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    meta: { page, limit, totalItems, totalPages }
  };
}

export async function detail(userId, todoId) {
  const todo = await mustBeOwner(todoId, userId);
  return todo;
}

export async function patch(userId, todoId, body) {
  await mustBeOwner(todoId, userId);

  const patchData = {};
  if (body.title !== undefined) patchData.title = body.title;
  if (body.description !== undefined) patchData.description = body.description;
  if (body.status !== undefined) patchData.status = body.status;
  if (body.due_date !== undefined) patchData.due_date = body.due_date;

  const [todo] = await updateTodo(todoId, patchData);
  return todo;
}

export async function remove(userId, todoId) {
  await mustBeOwner(todoId, userId);
  await deleteTodo(todoId);
  return null;
}
