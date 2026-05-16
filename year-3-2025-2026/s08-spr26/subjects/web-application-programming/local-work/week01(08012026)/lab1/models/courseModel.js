import db from './db.js';

export async function getCoursesPage({ instructorId, page = 1, limit = 6 }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 6));
  const offset = (safePage - 1) * safeLimit;

  const base = db('courses')
    .join('instructors', 'courses.instructor_id', 'instructors.instructor_id');

  if (instructorId) base.where('courses.instructor_id', Number(instructorId));

  const countRow = await base.clone().count('* as total').first();
  const total = Number(countRow?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  const finalPage = Math.min(safePage, totalPages);
  const finalOffset = (finalPage - 1) * safeLimit;

  const courses = await base
    .clone()
    .select('courses.*', 'instructors.name as instructor_name')
    .orderBy('courses.created_at', 'desc')
    .limit(safeLimit)
    .offset(finalOffset);

  return {
    courses,
    pagination: {
      total,
      page: finalPage,
      limit: safeLimit,
      totalPages,
      hasPrev: finalPage > 1,
      hasNext: finalPage < totalPages,
    },
  };
}
