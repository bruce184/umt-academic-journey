import express from "express";
import { getAllProductsOfCategory } from "../controllers/category.c.js";

const router = express.Router();
router.get("/:category", getAllProductsOfCategory);

export default router;
