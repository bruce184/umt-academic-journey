import knex from "knex";
import knexConfig from "../../knexfile.js";

// Tạo knex instance để phase sau dùng query DB
const db = knex(knexConfig.development);

export default db;