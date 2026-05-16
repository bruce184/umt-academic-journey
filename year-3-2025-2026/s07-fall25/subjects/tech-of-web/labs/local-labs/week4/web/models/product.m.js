import { readData, writeData } from "./dbUtil.js";

export default {
    all: async () => {
        return await readData();
    },

    one: async (id) => {
        const products = await readData();
        const pid = Number(id);
        return products.find((product) => product.id === pid);
    },

    add: async (newProduct) => {
        const data = await readData();
        data.push(newProduct);
        await writeData(data);
    },

    allOfCategory: async (category) => {
        const products = await readData();
        // fixed: ensure filter returns matching items
        return products.filter((product) => product.category === category);
    }
};
