import { Router } from "express";
import { signup, login } from "../controllers/userController.js";
import { validateBody } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimit.js";

// --- Validators ---
function signupValidator(body) {
  const errors = [];
  const cleaned = {};

  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  if (!email || !email.includes("@")) errors.push({ field: "email", message: "Email is required and must be valid" });
  if (!password || password.length < 6) errors.push({ field: "password", message: "Password must be at least 6 chars" });

  cleaned.email = email;
  cleaned.password = password;

  return { ok: errors.length === 0, errors, cleaned };
}

function loginValidator(body) {
  const errors = [];
  const cleaned = {};

  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  if (!email) errors.push({ field: "email", message: "Email is required" });
  if (!password) errors.push({ field: "password", message: "Password is required" });

  cleaned.email = email;
  cleaned.password = password;

  return { ok: errors.length === 0, errors, cleaned };
}

const router = Router();

router.post("/api/v1/users/signup", validateBody(signupValidator), signup);
router.post("/api/v1/users/login", authLimiter, validateBody(loginValidator), login);

export default router;
