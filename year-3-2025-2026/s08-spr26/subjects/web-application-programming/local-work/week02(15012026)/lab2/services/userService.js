// Logic users (signup/login) với in-memory store

import crypto from "crypto";
import { db } from "../models/db.js";
import { ApiError } from "../utils/apiError.js";

// Password "đơn giản"
function makeId() {
  return crypto.randomUUID();
}

export function createUser({ email, password }) {
  const exists = db.users.find(u => u.email === email);
  if (exists) {
    throw new ApiError({
      status: 409,
      code: "CONFLICT",
      message: "Email already exists",
      details: { email }
    });
  }

  const user = {
    id: makeId(),
    email,
    password,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);

  // Không trả password ra ngoài
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export function verifyLogin({ email, password }) {
  const user = db.users.find(u => u.email === email);

  // Trả 401 chung để tránh leak “email tồn tại hay không”
  if (!user || user.password !== password) {
    throw new ApiError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
      details: null
    });
  }

  return { id: user.id, email: user.email };
}
