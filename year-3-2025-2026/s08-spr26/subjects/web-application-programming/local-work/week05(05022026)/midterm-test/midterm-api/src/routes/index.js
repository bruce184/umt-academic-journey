import { Router } from "express";
// Placeholder imports
import userRouter from "./user-r.js";
import todoRouter from "./todo-r.js";

const router = Router();

router.get("/health", (req, res) => res.ok({ status: "ok" }));

router.use("/users", userRouter);
router.use("/todos", todoRouter);

export default router;
