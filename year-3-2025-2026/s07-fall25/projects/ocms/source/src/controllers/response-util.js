// Utility helpers to standardize API responses for controllers
export function sendOk(res, data, status = 200) {
  // Normalize array payloads into an object with `items` to match FE expectations
  // FE code often expects one of: { ok:true, data: { items: [...] } }, { items: [...] }, or plain array
  try {
    if (Array.isArray(data)) {
      return res.status(status).json({ ok: true, data: { items: data } });
    }
  } catch {
    // fallback to default behavior on unexpected errors
  }

  return res.status(status).json({ ok: true, data });
}

export function sendCreated(res, data) {
  return sendOk(res, data, 201);
}

export function sendError(res, status = 500, code = "SERVER_ERROR", message = "Server error") {
  return res.status(status).json({ ok: false, error: { code, message } });
}

export default {
  sendOk,
  sendCreated,
  sendError,
};
