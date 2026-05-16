import db from '../models/db.js';
import { getAllInstructors } from '../models/instructorModel.js';
import { getCoursesPage } from '../models/courseModel.js';

export async function renderCourseList(req, res, next) {
  try {
    const instructorId = req.query.instructor_id ? Number(req.query.instructor_id) : null;
    const page = req.query.page ? Number(req.query.page) : 1;

    const [instructors, { courses, pagination }] = await Promise.all([
      getAllInstructors(),
      getCoursesPage({ instructorId, page, limit: 6 }),
    ]);

    const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);

    res.render('courses/index', {
      instructors,
      courses,
      pagination,
      pages,
      selectedInstructorId: instructorId || '',
    });
  } catch (err) {
    next(err);
  }
}

export async function renderCreateCourse(req, res, next) {
  try {
    const instructors = await getAllInstructors();
    res.render('courses/create', { instructors, errors: [], values: {} });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    const data = req.body;

    await db('courses').insert({
      title: data.title,
      description: data.description || null,
      image_url: data.image_url || null,
      instructor_id: data.instructor_id,

      rating: data.rating ?? 0,
      total_reviews: data.total_reviews ?? 0,
      total_hours: data.total_hours ?? 0,
      total_lectures: data.total_lectures ?? 0,

      level: data.level || null,
      current_price: data.current_price,
      original_price: data.original_price,

      is_bestseller: data.is_bestseller ?? false,
    });

    return res.redirect('/courses');
  } catch (err) {
    next(err);
  }
}
