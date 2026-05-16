import db from '../db/db.js';

class Todo {
  baseOwnedQuery(userId) {
    return db('todos').where({ user_id: userId });
  }

  async findOwnedById(userId, id) {
    return this.baseOwnedQuery(userId).where({ id }).first();
  }

  async create(todoData) {
    const [todo] = await db('todos').insert(todoData).returning('*');
    return todo;
  }

  async updateOwnedById(userId, id, patch) {
    const [updatedTodo] = await this.baseOwnedQuery(userId)
      .where({ id })
      .update({ ...patch, updated_at: db.fn.now() })
      .returning('*');
    return updatedTodo;
  }

  async deleteOwnedById(userId, id) {
    const deletedCount = await this.baseOwnedQuery(userId).where({ id }).del();
    return deletedCount > 0;
  }
}

export default new Todo();
