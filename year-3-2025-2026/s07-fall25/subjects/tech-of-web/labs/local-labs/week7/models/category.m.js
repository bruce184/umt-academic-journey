import { readData } from "./dbUtil.js";

export default {
    all: async () => {
        const data = await readData();
        const arrNames = [...new Set(data.map((item) => item.category))];
        const categories = arrNames.map((name) => ({ name }));
        return categories;
    }
};
