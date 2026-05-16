import express from 'express';
import { renderCourseList, renderCreateCourse, createCourse } from '../controllers/courseController.js';
import { validate } from '../middlewares/validate.js';
import { createCourseSchema } from '../validators/courseSchema.js';

const router = express.Router();

router.get('/', renderCourseList);
router.get('/create', renderCreateCourse);

router.post('/', validate(createCourseSchema), createCourse);

export default router;
