import db from './db.js';

export function getAllInstructors() {
  return db('instructors')
    .select('instructor_id', 'name')
    .orderBy('name', 'asc');
}
