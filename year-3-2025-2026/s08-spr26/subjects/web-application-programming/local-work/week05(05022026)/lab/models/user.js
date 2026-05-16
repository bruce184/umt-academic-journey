import db from '../db/db.js';

class User {
  async all() {
    return db('users').select('*');
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }

  async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  async create(userData) {
    const [user] = await db('users').insert(userData).returning('*');
    return user;
  }
}

export default new User();
