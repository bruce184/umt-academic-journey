import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { create, list, detail, patch, remove } from "../controllers/todoController.js";

// --- Validators ---
function createTodoValidator(body) {
  const errors = [];
  const cleaned = {};

  const title = String(body?.title ?? "").trim();
  const description = body?.description === undefined ? "" : String(body.description);

  if (!title) errors.push({ field: "title", message: "Title is required" });

  cleaned.title = title;
  cleaned.description = description;

  return { ok: errors.length === 0, errors, cleaned };
}

function listQueryValidator(q) {
  const errors = [];
  const cleaned = {};

  const status = q?.status === undefined ? undefined : String(q.status).trim().toUpperCase();

  if (status !== undefined && status !== "PENDING" && status !== "DONE") {
    errors.push({ field: "status", message: "status must be PENDING or DONE" });
  }

  cleaned.status = status;
  return { ok: errors.length === 0, errors, cleaned };
}

function patchTodoValidator(body) {
  const errors = [];
  const cleaned = {};

  const hasTitle = body?.title !== undefined;
  const hasDescription = body?.description !== undefined;
  const hasStatus = body?.status !== undefined;

  if (!hasTitle && !hasDescription && !hasStatus) {
    errors.push({ field: "_", message: "At least one of title/description/status is required" });
    return { ok: false, errors, cleaned };
  }

  if (hasTitle) {
    const title = String(body.title).trim();
    if (!title) errors.push({ field: "title", message: "title cannot be empty" });
    cleaned.title = title;
  }

  if (hasDescription) {
    cleaned.description = String(body.description);
  }

  if (hasStatus) {
    const status = String(body.status).trim().toUpperCase();
    if (status !== "PENDING" && status !== "DONE") {
      errors.push({ field: "status", message: "status must be PENDING or DONE" });
    }
    cleaned.status = status;
  }

  return { ok: errors.length === 0, errors, cleaned };
}

const router = Router();

// app.js đã mount: /api/v1/todos
router.use(requireAuth);

// CRUD
router.post("/", validateBody(createTodoValidator), create);
router.get("/", validateQuery(listQueryValidator), list);
router.get("/:id", detail);
router.patch("/:id", validateBody(patchTodoValidator), patch);
router.delete("/:id", remove);

export default router;
