import productM from "../models/product.m.js";
import categoryM from "../models/category.m.js";
// Controller to get all products
export const getAllProducts = async (_req, res) => {
    try {
        const products = await productM.all();
        res.render("product/products", { products });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// Controller to get a product by ID
export const getProductById = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await productM.one(productId);
        const categories = await categoryM.all();
        if (product) {
            res.render("product/productDetail", { product, categories });
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
