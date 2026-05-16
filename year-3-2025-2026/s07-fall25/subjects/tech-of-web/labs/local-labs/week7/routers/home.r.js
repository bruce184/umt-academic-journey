// routers/home.r.js
import express from "express";
import {
    getAllProductsAndCategories,
    getProductsByPage,
    showAjaxPaging,
    getProductsPageJson,
    getAllProductsServer,
    showClientPaging
} from "../controllers/home.c.js";

const router = express.Router();

// Trang chủ -> trang 1 (server-side paging)
router.get("/", getAllProductsAndCategories);

// AJAX paging demo page
router.get("/ajax", showAjaxPaging);

// API JSON cho AJAX paging
router.get("/ajax/products/:page", getProductsPageJson);

// Server-side prefixed routes
router.get("/server", getAllProductsServer);
router.get("/server/:page", getProductsByPage);

// Client-side pagination (load all then paginate in browser)
router.get("/client", showClientPaging);

// Server-side paging cho /1, /2, ...
router.get("/:page", getProductsByPage);

export default router;
