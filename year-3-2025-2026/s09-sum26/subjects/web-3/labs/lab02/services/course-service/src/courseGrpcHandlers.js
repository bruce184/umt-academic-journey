import grpc from "@grpc/grpc-js";

function toGrpcError(error) {
  if (error.code === "NOT_FOUND") {
    return {
      code: grpc.status.NOT_FOUND,
      message: error.message
    };
  }

  if (error.code === "INVALID_ARGUMENT") {
    return {
      code: grpc.status.INVALID_ARGUMENT,
      message: error.message
    };
  }

  return {
    code: grpc.status.INTERNAL,
    message: "Internal course service error"
  };
}

export function createCourseGrpcHandlers(courseService) {
  return {
    async getCourse(call, callback) {
      try {
        const course = await courseService.getCourse(call.request.id);
        callback(null, { course });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async createCourse(call, callback) {
      try {
        const course = await courseService.createCourse(call.request);
        callback(null, { course });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async listCourses(call, callback) {
      try {
        const result = await courseService.listCourses(call.request);
        callback(null, result);
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async batchGetCourses(call, callback) {
      try {
        const courses = await courseService.batchGetCourses(call.request.ids);
        callback(null, { courses });
      } catch (error) {
        callback(toGrpcError(error));
      }
    }
  };
}
