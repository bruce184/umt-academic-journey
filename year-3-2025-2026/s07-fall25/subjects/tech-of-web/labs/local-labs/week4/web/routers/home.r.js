import express from "express";
import { getAllProductsAndCategories } from "../controllers/home.c.js";
const router = express.Router();
router.get("/", getAllProductsAndCategories);
export default router;
