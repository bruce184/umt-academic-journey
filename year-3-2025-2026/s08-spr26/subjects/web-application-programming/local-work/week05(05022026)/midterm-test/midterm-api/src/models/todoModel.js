import db from "../db/db.js";

export const createTodo = (payload) =>
  db("todos")
    .insert(payload)
    .returning(["id", "user_id", "title", "description", "status", "due_date", "created_at", "updated_at"]);

export const findTodoById = (id) => db("todos").where({ id }).first();

export async function listTodos({ userId, status, limit, offset }) {
  const base = db("todos").where({ user_id: userId });

  if (status) base.andWhere({ status });

  const [countRow] = await base.clone().count({ total: "*" });

  const items = await base
    .clone()
    .orderBy("id", "desc")
    .limit(limit)
    .offset(offset);

  return { items, totalItems: Number(countRow?.total || 0) };
}

export const updateTodo = (id, patch) =>
  db("todos")
    .where({ id })
    .update({ ...patch, updated_at: db.fn.now() })
    .returning(["id", "user_id", "title", "description", "status", "due_date", "created_at", "updated_at"]);

export const deleteTodo = (id) => db("todos").where({ id }).del();
