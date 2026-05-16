// In-memory "database" (mảng) 

export const db = {
  users: [], // { id, email, password, createdAt }
  todos: []  // { id, userId, title, description, status, createdAt, updatedAt }
};
