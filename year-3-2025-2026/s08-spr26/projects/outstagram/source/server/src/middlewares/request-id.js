import { randomUUID } from "crypto";

export const requestId = (req, res, next) => {
    const headerId = req.headers["x-request-id"];
    const id = typeof headerId === "string" && headerId.trim() ? headerId.trim() : randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
};
