import { db } from "../db/knex.js";
import { errors } from "../utils/api-error.js";

export const checkUsernameAvailability = async (req, res, next) => {
    const { username } = req.params;

    // Basic validation
    if (!username || username.length < 3 || username.length > 30) {
        return next(errors.validation("Invalid username length"));
    }

    try {
        const user = await db("profiles")
            .whereRaw("LOWER(username) = ?", [username.toLowerCase()])
            .first();

        return res.ok({ available: !user });
    } catch (e) {
        return next(e);
    }
};
