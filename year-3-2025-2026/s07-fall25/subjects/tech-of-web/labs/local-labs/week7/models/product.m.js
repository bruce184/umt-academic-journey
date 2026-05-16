// models/product.m.js
import * as db from "./dbUtil.js";

const DEFAULT_PAGE_SIZE = 6;

export default {
    all: async () => {
        return await db.getAll();
    },

    one: async (id) => {
        const products = await db.getAll();
        const pid = Number(id);
        return products.find((product) => product.id === pid);
    },

    add: async (newProduct) => {
        // Use dbUtil.add to generate an id and persist correctly
        return await db.add(newProduct);
    },

    allOfCategory: async (category) => {
        const products = await db.getAll();
        return products.filter((product) => product.category === category);
    },

    // Lấy sản phẩm có phân trang
    // trả về: { items, total, totalPages, page, limit }
    page: async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
        const products = await db.getAll();
        const total = products.length;
        const pageSize = Number(limit) || DEFAULT_PAGE_SIZE;

        let currentPage = Number(page) || 1;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * pageSize;
        const items = products.slice(start, start + pageSize);

        return {
            items,
            total,
            totalPages,
            page: currentPage,
            limit: pageSize
        };
    }
};
