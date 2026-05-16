// src/middlewares/db-user-context.js
import db from "../models/db.js";

export const attachDbUserContext = async (req, res, next) => {
  try {
    // Support both session shapes: req.session.user.id (preferred) and req.session.userId (compat)
    const userId = req?.session?.user?.id ?? req?.session?.userId ?? null;
    if (userId) {
      await db.raw("SELECT set_config('app.current_user_id', ?, true)", [String(userId)]);
    }
  } catch (err) {
    console.error("[attachDbUserContext]", err);
  }
  next();
};
