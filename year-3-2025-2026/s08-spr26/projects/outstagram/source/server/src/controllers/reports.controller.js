import { db } from "../db/knex.js";
import { errors } from "../utils/api-error.js";

export async function reportProblem(req, res, next) {
    const reporterId = req.userId;
    const { description, category = "bug", page = "" } = req.body;

    if (!description || !String(description).trim()) {
        return next(errors.validation("Description is required"));
    }

    try {
        const reason = `[${category}] ${String(description).trim().slice(0, 1000)}${page ? ` | page: ${page}` : ""}`;

        const [report] = await db("public.reports")
            .insert({
                reporter_id: reporterId,
                target_type: "problem",
                target_id: reporterId || "app",
                reason,
                status: "pending",
            })
            .returning("*");

        return res.ok({ report }, { status: 201 });
    } catch (e) {
        console.error("Report problem error:", e);
        return next(errors.internal("Unable to submit problem report"));
    }
}
