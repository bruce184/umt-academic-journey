import { z } from 'zod';

// helper: "" / null / undefined -> undefined, còn lại -> Number(v)
const requiredNumber = (label, min = 0) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({
        required_error: `${label} is required`,
        invalid_type_error: `${label} must be a number`,
      })
      .finite(`${label} must be a number`)
      .min(min, `${label} must be >= ${min}`)
  );

const optionalNumber = (label, min = 0, max = undefined) => {
  let s = z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
      z
        .number({ invalid_type_error: `${label} must be a number` })
        .finite(`${label} must be a number`)
        .min(min, `${label} must be >= ${min}`)
    )
    .optional();

  if (max !== undefined) {
    s = s.refine((v) => v === undefined || v <= max, {
      message: `${label} must be <= ${max}`,
    });
  }
  return s;
};

const optionalInt = (label, min = 0) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .finite(`${label} must be a number`)
      .int(`${label} must be an integer`)
      .min(min, `${label} must be >= ${min}`)
  ).optional();

export const createCourseSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 chars`,'),
    description: z.string().optional().or(z.literal('')),
    image_url: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),

    instructor_id: z.coerce.number().int().positive('Instructor is required'),

    rating: optionalNumber('Rating', 0, 5),
    total_reviews: optionalInt('Total reviews', 0),

    total_hours: optionalNumber('Total hours', 0),
    total_lectures: optionalInt('Total lectures', 0),

    level: z.string().optional().or(z.literal('')),

    current_price: requiredNumber('Current price', 0),
    original_price: requiredNumber('Original price', 0),

    is_bestseller: z
      .preprocess((v) => v === 'true' || v === 'on' || v === true, z.boolean())
      .optional()
      .default(false),
  })
  .refine((data) => data.original_price >= data.current_price, {
    path: ['original_price'],
    message: 'Original price must be >= current price',
  });
