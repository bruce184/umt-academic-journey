// middlewares/auth.js
// Verify JWT cho routes cần đăng nhập

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_ISSUER = "todo-week2";

export function requireAuth(req, _res, next) {
  const auth = req.header("authorization") || "";
  const [type, token] = auth.split(" ");

  if (type !== "Bearer" || !token) {
    return next(
      new ApiError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Missing or invalid Authorization header",
        details: { hint: "Use: Authorization: Bearer <token>" },
      })
    );
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (_err) {
    return next(
      new ApiError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
        details: null,
      })
    );
  }
}

// Alias để khớp naming theo hướng dẫn thầy
export const protect = requireAuth;
