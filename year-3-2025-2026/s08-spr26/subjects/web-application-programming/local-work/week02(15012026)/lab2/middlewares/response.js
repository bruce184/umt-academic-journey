// Thêm helper res.ok / res.created / res.noContent / res.list / res.error để response đồng nhất

export function responseHelpers(req, res, next) {
  const withMeta = (meta = {}) => ({ traceId: req.traceId, ...meta });

  res.ok = (data, meta = {}) => {
    return res.status(200).json({ data, meta: withMeta(meta) });
  };

  res.created = (data, meta = {}) => {
    return res.status(201).json({ data, meta: withMeta(meta) });
  };

  // Dành cho list
  res.list = (items, meta = {}) => {
    return res.status(200).json({ data: items, meta: withMeta(meta) });
  };

  res.noContent = () => {
    return res.status(204).send();
  };

  /**
   * res.error(err, statusCode?)
   * - Nếu err là object { message, code, details, statusCode } -> errorHandler sẽ map
   * - Nếu err là string -> wrap thành object
   */
  res.error = (err, statusCode = 500) => {
    if (typeof err === "string") {
      return next({ statusCode, message: err });
    }

    // Nếu chỉ truyền {message: "..."} thì dùng statusCode param
    const normalized = {
      statusCode: err?.statusCode ?? statusCode,
      code: err?.code,
      message: err?.message ?? "Internal Server Error",
      details: err?.details ?? null,
    };

    return next(normalized);
  };

  next();
}
