import { Router } from "express";
import { searchPosts, searchUsers } from "../controllers/search.controller.js";

const router = Router();

router.get("/users", searchUsers);
router.get("/users/:query", searchUsers);
router.get("/posts", searchPosts);
router.get("/posts/:query", searchPosts);

export default router;
