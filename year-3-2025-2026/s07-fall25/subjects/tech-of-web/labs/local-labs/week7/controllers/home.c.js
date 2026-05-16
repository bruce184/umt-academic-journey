// controllers/home.c.js
import categoryM from "../models/category.m.js";
import productM from "../models/product.m.js";

const PAGE_SIZE = 6;

// Hàm dùng chung để lấy data paging
async function buildPagingData(pageNumber) {
    const { items, totalPages, page } = await productM.page(pageNumber, PAGE_SIZE);
    const categories = await categoryM.all();

    const paging = {
        page,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page > 1 ? page - 1 : 1,
        nextPage: page < totalPages ? page + 1 : totalPages
    };

    return { products: items, categories, paging };
}

// Dùng cho "/" – hiển thị trang 1 (server-side paging)
export const getAllProductsAndCategories = async (_req, res) => {
    try {
        const { products, categories, paging } = await buildPagingData(1);
        res.render("product/productsWithPaging", { products, categories, paging });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Dùng cho "/:page" – server-side paging theo số trang
export const getProductsByPage = async (req, res) => {
    try {
        const page = parseInt(req.params.page, 10) || 1;
        const { products, categories, paging } = await buildPagingData(page);
        res.render("product/productsWithPaging", { products, categories, paging });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Expose server-side paging under /server
export const getAllProductsServer = async (_req, res) => {
    try {
        const { products, categories, paging } = await buildPagingData(1);
        res.render("product/productsWithPaging", { products, categories, paging });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Render trang demo AJAX tại "/ajax"
export const showAjaxPaging = async (_req, res) => {
    try {
        const { products, categories, paging } = await buildPagingData(1);
        res.render("product/productsAjaxPaging", { products, categories, paging });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Trả JSON cho AJAX: "/ajax/products/:page"
export const getProductsPageJson = async (req, res) => {
    try {
        const page = parseInt(req.params.page, 10) || 1;
        const { products, paging } = await buildPagingData(page);
        res.json({ products, paging });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// Client-side pagination: send all products and let browser paginate
export const showClientPaging = async (_req, res) => {
    try {
        const products = await productM.all();
        const categories = await categoryM.all();
        const productsJson = JSON.stringify(products);
        res.render("product/productsClientPaging", { products, categories, productsJson });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
