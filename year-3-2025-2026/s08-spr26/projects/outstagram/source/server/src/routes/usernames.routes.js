import { Router } from "express";
import { checkUsernameAvailability } from "../controllers/usernames.controller.js";

const router = Router();

router.get("/:username/available", checkUsernameAvailability);

export default router;
