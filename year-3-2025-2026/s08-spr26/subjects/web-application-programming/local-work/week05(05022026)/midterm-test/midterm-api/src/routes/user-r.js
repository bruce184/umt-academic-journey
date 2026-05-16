import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { signup, login } from "../controllers/userController.js";
import { z } from "zod";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/signup", validate(signupSchema, "body"), signup);
router.post("/login", validate(loginSchema, "body"), login);

export default router;
