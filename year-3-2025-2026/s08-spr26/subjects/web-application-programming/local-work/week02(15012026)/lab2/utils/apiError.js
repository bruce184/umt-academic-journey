// Chuẩn hoá lỗi để errorHandler map ra status + schema error

export class ApiError extends Error {
  constructor({ status = 500, code = "INTERNAL_ERROR", message = "Server error", details = null }) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}