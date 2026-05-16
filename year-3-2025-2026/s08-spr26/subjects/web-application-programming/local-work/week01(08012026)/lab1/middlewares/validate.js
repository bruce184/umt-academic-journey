import { getAllInstructors } from '../models/instructorModel.js';

export function validate(schema) {
  return async (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      }));

      // cần instructors để render lại dropdown
      const instructors = await getAllInstructors();

      return res.status(400).render('courses/create', {
        instructors,
        errors,
        values: req.body,
      });
    }

    req.body = result.data;
    next();
  };
}
