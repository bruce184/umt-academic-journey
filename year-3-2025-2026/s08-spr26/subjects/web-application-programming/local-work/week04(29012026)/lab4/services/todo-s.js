import Todo from '../models/todo.js';
import { AppError } from '../utils/app-error.js';
import db from '../db/db.js';

export const createTodo = async (userId, data) => {
  return Todo.create({ ...data, user_id: userId });
};

export const getTodo = async (userId, id) => {
  const todo = await Todo.findOwnedById(userId, id);
  if (!todo) {
    throw new AppError('Todo not found', 404);
  }
  return todo;
};

export const updateTodo = async (userId, id, patch) => {
  // First check existence
  await getTodo(userId, id);
  return Todo.updateOwnedById(userId, id, patch);
};

export const deleteTodo = async (userId, id) => {
  // First check existence
  await getTodo(userId, id);
  await Todo.deleteOwnedById(userId, id);
};

export const listTodos = async (userId, query) => {
  const { page, limit, status, sort, q, fields } = query;
  const offset = (page - 1) * limit;

  let queryBuilder = Todo.baseOwnedQuery(userId);

  // Filtering
  if (status) {
    queryBuilder.where({ status });
  }

  // Searching
  if (q) {
    queryBuilder.where((builder) => {
      builder.whereILike('title', `%${q}%`)
             .orWhereILike('description', `%${q}%`);
    });
  }

  // Cloning for count before sorting/pagination
  // Knex clone() is useful here
  const countResult = await queryBuilder.clone().count('* as count').first();
  const total = parseInt(countResult.count);

  // Sorting
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach((field) => {
      const direction = field.startsWith('-') ? 'desc' : 'asc';
      const cleanField = field.replace('-', '');
      // Whitelist sort fields to prevent injection or errors
      const allowedSorts = ['title', 'created_at', 'updated_at', 'status'];
      if (allowedSorts.includes(cleanField)) {
        queryBuilder.orderBy(cleanField, direction);
      }
    });
  } else {
    // Default sort
    queryBuilder.orderBy('created_at', 'desc');
  }

  // Field Selection
  if (fields) {
    const selectedFields = fields.split(',');
    // Whitelist fields
    const allowedFields = ['id', 'title', 'description', 'status', 'created_at', 'updated_at'];
    const validFields = selectedFields.filter(f => allowedFields.includes(f));
    if (validFields.length > 0) {
      queryBuilder.select(validFields);
    } else {
        queryBuilder.select('*'); // Fallback if no valid fields
    }
  } else {
    queryBuilder.select('*');
  }

  // Pagination
  queryBuilder.limit(limit).offset(offset);

  const todos = await queryBuilder;

  // Cleanup: ensure user_id is not exposed if * was selected (though it's selecting * from defined schema in migration user_id is there)
  // We can strip it out manually or rely on 'fields' not including it if specified.
  // The instructions say "do not expose user_id". 
  const sanitizedTodos = todos.map(t => {
      const { user_id, ...rest } = t;
      return rest;
  });

  return {
    items: sanitizedTodos,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: sanitizedTodos.length,
    },
  };
};
