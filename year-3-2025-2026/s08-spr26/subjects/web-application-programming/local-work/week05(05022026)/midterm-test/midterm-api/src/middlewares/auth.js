import jwt from "jsonwebtoken";
import AppError from "../utils/app-error.js";
import { findById } from "../models/userModel.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return next(
      new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing token"
      })
    );
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findById(payload.id);

    if (!user)
      return next(
        new AppError({
          statusCode: 401,
          code: "UNAUTHORIZED",
          message: "User not found"
        })
      );

    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    return next(
      new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Invalid token"
      })
    );
  }
}
