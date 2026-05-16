export function health(req, res) {
  res.ok({ status: "ok", time: new Date().toISOString() });
}
