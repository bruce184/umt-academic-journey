import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { reportProblem } from "../controllers/reports.controller.js";

const router = Router();

router.post("/problem", requireAuth, reportProblem);

export default router;
