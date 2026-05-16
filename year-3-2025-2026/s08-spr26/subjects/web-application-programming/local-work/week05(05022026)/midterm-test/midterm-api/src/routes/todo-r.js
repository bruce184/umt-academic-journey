import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { create, list, detail, patch, remove } from "../controllers/todoController.js";
import { z } from "zod";

const router = Router();
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const createTodoSchema = z.object({
  title: z.string().min(1).transform((s) => s.trim()),
  description: z.string().nullable().optional(),
  status: z.enum(["PENDING", "DONE"]).optional(),
  due_date: z.string().regex(dateRegex, "due_date must be YYYY-MM-DD").optional()
});

const patchTodoSchema = z.object({
  title: z.string().min(1).transform((s) => s.trim()).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["PENDING", "DONE"]).optional(),
  due_date: z.string().regex(dateRegex, "due_date must be YYYY-MM-DD").optional()
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "DONE"]).optional()
});

const idParamSchema = z.object({
  id: z.coerce.number().int().min(1)
});

// All todos routes require authentication
router.use(requireAuth);

router.post("/", validate(createTodoSchema, "body"), create);
router.get("/", validate(listQuerySchema, "query"), list);
router.get("/:id", validate(idParamSchema, "params"), detail);
router.patch("/:id", validate(idParamSchema, "params"), validate(patchTodoSchema, "body"), patch);
router.delete("/:id", validate(idParamSchema, "params"), remove);

export default router;
