// Correlation ID giúp trace request-endpoint khi debug

import crypto from "crypto";

export function correlationId(req, res, next) {
  const incoming = req.header("x-correlation-id");
  const traceId = incoming && incoming.trim() ? incoming.trim() : crypto.randomUUID();

  req.traceId = traceId;
  res.setHeader("x-correlation-id", traceId);

  next();
}
