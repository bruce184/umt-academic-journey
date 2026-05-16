// src/middlewares/auth.js
// Authentication & authorization middlewares for OCMS.
// - checkAuthentication: for web routes (redirects to /login if not logged in)
// - apiCheckAuthentication: for API routes (returns 401 JSON if not logged in)
// - checkRole: ensures the logged-in user is accessing the correct role namespace
//              (e.g. /student, /lecturer, /department-head, /admin)

import { sendError } from "../controllers/response-util.js";

// Dev bypass is only enabled when running in development AND the
// environment flag ALLOW_DEV_AUTH_BYPASS is explicitly set to "true".
// This avoids accidentally allowing open access when NODE_ENV is set
// but the developer did not intend to bypass auth.
const isDev = (process.env.NODE_ENV || "development") === "development" && String(process.env.ALLOW_DEV_AUTH_BYPASS || "false") === "true";

/**
 * Helper: build a minimal user object from session
 * - Ưu tiên req.session.user (chuẩn mới)
 * - Fallback req.session.userId / req.session.userRole (chuẩn cũ)
 */
function buildUserFromSession(session) {
  if (!session) return null;

  if (session.user) {
    const { id, role } = session.user;
    if (id || role) {
      return {
        id: id ?? session.userId ?? null,
        role: role ?? session.userRole ?? null,
      };
    }
  }

  if (session.userId || session.userRole) {
    return {
      id: session.userId ?? null,
      role: session.userRole ?? null,
    };
  }

  return null;
}

/**
 * Web auth guard.
 * - Assumes login sets:
 *   + req.session.user (object)  [chuẩn mới]
 *   + req.session.userId / req.session.userRole [compat]
 * - If not logged in: redirect to /login (trừ khi isDev === true).
 */
export function checkAuthentication(req, res, next) {
  try {
    const user = buildUserFromSession(req.session);

    // Logged in → attach req.user và cho qua
    if (user && (user.id || user.role)) {
      if (!req.user) {
        req.user = user;
      }
      return next();
    }

    // In development you may want to bypass auth for quick UI checks.
    // Comment this block out nếu muốn strict auth kể cả trong dev.
    if (isDev) {
      return next();
    }

    // Not authenticated → redirect to login page
    return res.redirect("/login");
  } catch (err) {
    console.error("[auth] checkAuthentication error:", err);
    return res.redirect("/login");
  }
}

/**
 * API auth guard.
 * - Same idea as checkAuthentication, but returns JSON instead of redirect.
 */
export function apiCheckAuthentication(req, res, next) {
  try {
    const user = buildUserFromSession(req.session);

    if (user && (user.id || user.role)) {
      if (!req.user) {
        req.user = user;
      }
      return next();
    }

    if (isDev) {
      return next();
    }

    return sendError(res, 401, "NOT_AUTHENTICATED", "Not authenticated");
  } catch (err) {
    console.error("[auth] apiCheckAuthentication error:", err);
    return sendError(res, 500, "AUTH_ERROR", "Internal authentication error");
  }
}

/**
 * Role guard for web routes.
 * - Expects session to contain something như:
 *   - req.session.user.role  (chuẩn mới)
 *   - hoặc req.session.userRole (compat)
 * - Compares normalized session role with the first segment of baseUrl:
 *   /student          -> "student"
 *   /lecturer         -> "lecturer"
 *   /department-head  -> "department-head"
 *
 * Mounting pattern in app.js:
 *   const webCheck = [checkAuthentication, checkRole];
 *   app.use("/student", webCheck, studentR);
 */
export function checkRole(req, res, next) {
  try {
    let userRole = null;

    if (req.session) {
      if (req.session.user && req.session.user.role) {
        userRole = String(req.session.user.role);
      } else if (req.session.userRole) {
        userRole = String(req.session.userRole);
      }
    }

    // If we cannot determine the role:
    if (!userRole) {
      // In development, allow through so you can still test layouts.
      if (isDev) {
        return next();
      }

      // In non-dev environments, treat as not logged in.
      return res.redirect("/login");
    }

    // Normalize role from session: "Department Head" -> "department-head"
    const normalizedRole = userRole.toLowerCase().trim().replace(/\s+/g, "-");

    // Current route namespace: "/student" -> "student"
    const baseSegment = req.baseUrl.replace(/^\//, "").toLowerCase();

    // If route has no base segment (e.g. "/"), just continue
    if (!baseSegment) {
      return next();
    }

    // Role matches the route namespace → allow
    if (normalizedRole === baseSegment) {
      return next();
    }

    // Role mismatch:
    // For web routes, redirect to the correct base namespace for this role.
    return res.redirect(`/${normalizedRole}`);
  } catch (err) {
    console.error("[auth] checkRole error:", err);

    // Fallback: if something goes wrong, be safe and send user to login.
    return res.redirect("/login");
  }
}
