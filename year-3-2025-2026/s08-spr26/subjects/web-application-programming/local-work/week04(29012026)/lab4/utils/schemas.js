import { z } from 'zod';

export const todoSchemas = {
  create: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000).optional(),
    status: z.enum(['PENDING', 'DONE']).optional(),
    due_date: z.string().datetime().optional(),
  }),
  
  update: z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['PENDING', 'DONE']).optional(),
    due_date: z.string().datetime().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),

  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['PENDING', 'DONE']).optional(),
    sort: z.string().optional(),
    q: z.string().max(100).optional(),
    fields: z.string().optional(),
  }),
  
  paramsId: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export const userSchemas = {
  signup: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};
