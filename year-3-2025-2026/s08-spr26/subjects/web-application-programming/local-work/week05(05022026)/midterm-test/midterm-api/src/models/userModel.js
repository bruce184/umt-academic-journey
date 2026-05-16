import db from "../db/db.js";

export const findByEmail = (email) => db("users").where({ email }).first();

export const createUser = (payload) =>
  db("users").insert(payload).returning(["id", "name", "email"]);

export const findById = (id) => db("users").where({ id }).first();
