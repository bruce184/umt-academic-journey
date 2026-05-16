import { successResponse, errorResponse } from "../utils/response.js";

export default function responseFormatter() {
  return (req, res, next) => {
    const metaBase = { requestId: req.requestId };

    res.ok = (data, meta = {}) => successResponse(res, data, 200, { ...metaBase, ...meta });
    res.created = (data, meta = {}) => successResponse(res, data, 201, { ...metaBase, ...meta });
    res.noContent = (meta = {}) => successResponse(res, null, 204, { ...metaBase, ...meta });
    res.list = (items, meta = {}) => successResponse(res, items, 200, { ...metaBase, ...meta });

    res.fail = (err, statusCode = 500) => errorResponse(res, err, statusCode, metaBase);

    next();
  };
}
