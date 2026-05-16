import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../utils/app-error.js";
import { findByEmail, createUser } from "../models/userModel.js";

export async function signup({ name, email, password }) {
  const exists = await findByEmail(email);
  if (exists)
    throw new AppError({
      statusCode: 409,
      code: "EMAIL_EXISTS",
      message: "Email already exists"
    });

  const password_hash = await bcrypt.hash(password, 10);
  const [user] = await createUser({ name, email, password_hash });

  return user;
}

export async function login({ email, password }) {
  const user = await findByEmail(email);
  if (!user)
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password"
    });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok)
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password"
    });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  return { token };
}
