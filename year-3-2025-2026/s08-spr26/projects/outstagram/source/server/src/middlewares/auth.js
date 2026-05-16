import { supabaseAnon } from "../../lib/supabase.js";
import { errors } from "../utils/api-error.js";
import { db as knex } from "../db/knex.js";
import { SystemConfigService } from "../services/system-config.service.js";

const ADMIN_ROLES = new Set(["moderator", "admin", "super_admin"]);

export async function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || "";
        if (!auth.startsWith("Bearer ")) {
            return next(errors.authMissingToken());
        }

        const token = auth.slice(7).trim();
        if (!token) {
            return next(errors.authMissingToken());
        }

        const { data, error } = await supabaseAnon.auth.getUser(token);
        if (error) {
            const msg = String(error.message || "");
            if (msg.toLowerCase().includes("expired")) {
                return next(errors.authExpiredToken());
            }
            return next(errors.authInvalidToken());
        }
        if (!data?.user) {
            return next(errors.authUserNotFound());
        }

        req.user = data.user;
        req.userId = data.user.id;

        const isMaintenanceMode = await SystemConfigService.getValue("maintenance_mode", false);
        if (isMaintenanceMode) {
            const profile = await knex("profiles")
                .select("role")
                .where({ user_id: data.user.id })
                .first();

            req.userRole = profile?.role ?? null;

            if (!ADMIN_ROLES.has(req.userRole)) {
                return next(errors.forbidden("Platform is currently in maintenance mode. Please try again later."));
            }
        }

        next();
    } catch (e) {
        return next(errors.internal("Internal server error during authentication"));
    }
}
