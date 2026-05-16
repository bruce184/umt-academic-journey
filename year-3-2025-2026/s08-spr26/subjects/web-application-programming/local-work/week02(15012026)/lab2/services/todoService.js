// Logic todos (CRUD + filter) + check ownership

import crypto from "crypto";
import { db } from "../models/db.js";
import { ApiError } from "../utils/apiError.js";

function makeId() {
  return crypto.randomUUID();
}

export function createTodo({ userId, title, description }) {
  const now = new Date().toISOString();

  const todo = {
    id: makeId(),
    userId,
    title,
    description: description ?? "",
    status: "PENDING",
    createdAt: now,
    updatedAt: now
  };

  db.todos.push(todo);
  return todo;
}

export function listTodos({ userId, status }) {
  let items = db.todos.filter(t => t.userId === userId);
  if (status) items = items.filter(t => t.status === status);
  return items;
}

export function getTodoById({ userId, todoId }) {
  const todo = db.todos.find(t => t.id === todoId);
  if (!todo) {
    throw new ApiError({ status: 404, code: "NOT_FOUND", message: "Todo not found", details: { todoId } });
  }
  if (todo.userId !== userId) {
    throw new ApiError({ status: 403, code: "FORBIDDEN", message: "Not allowed", details: null });
  }
  return todo;
}

export function patchTodo({ userId, todoId, patch }) {
  const todo = db.todos.find(t => t.id === todoId);
  if (!todo) {
    throw new ApiError({ status: 404, code: "NOT_FOUND", message: "Todo not found", details: { todoId } });
  }
  if (todo.userId !== userId) {
    throw new ApiError({ status: 403, code: "FORBIDDEN", message: "Not allowed", details: null });
  }

  // Update từng phần
  if (patch.title !== undefined) todo.title = patch.title;
  if (patch.description !== undefined) todo.description = patch.description;
  if (patch.status !== undefined) todo.status = patch.status;

  todo.updatedAt = new Date().toISOString();
  return todo;
}

export function deleteTodo({ userId, todoId }) {
  const idx = db.todos.findIndex(t => t.id === todoId);
  if (idx === -1) {
    throw new ApiError({ status: 404, code: "NOT_FOUND", message: "Todo not found", details: { todoId } });
  }
  if (db.todos[idx].userId !== userId) {
    throw new ApiError({ status: 403, code: "FORBIDDEN", message: "Not allowed", details: null });
  }

  db.todos.splice(idx, 1);
  return;
}
