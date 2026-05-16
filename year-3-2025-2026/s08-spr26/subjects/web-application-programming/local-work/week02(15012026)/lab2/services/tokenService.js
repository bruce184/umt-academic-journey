// Tạo JWT

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_ISSUER = "todo-week2";
const JWT_EXPIRES_IN = "2h";

export function signAccessToken({ userId, email }) {
  // sub = subject (user id)
  return jwt.sign(
    { email },
    JWT_SECRET,
    { issuer: JWT_ISSUER, subject: userId, expiresIn: JWT_EXPIRES_IN }
  );
}
