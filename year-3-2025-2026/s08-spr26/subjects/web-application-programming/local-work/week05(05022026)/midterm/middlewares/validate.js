import AppError from "../utils/app-error.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source];


    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message
      }));


      return next(
        new AppError({
          statusCode: 422,
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details
        })
      );
    }

    req[source] = result.data;
    next();
  };
}
