import grpc from "@grpc/grpc-js";

function toGrpcError(error) {
  if (error.code === "NOT_FOUND") {
    return {
      code: grpc.status.NOT_FOUND,
      message: error.message
    };
  }

  if (error.code === "ALREADY_EXISTS") {
    return {
      code: grpc.status.ALREADY_EXISTS,
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
    message: "Internal enrollment service error"
  };
}

export function createEnrollmentGrpcHandlers(enrollmentService) {
  return {
    async getEnrollment(call, callback) {
      try {
        const enrollment = await enrollmentService.getEnrollment(call.request.id);
        callback(null, { enrollment });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async createEnrollment(call, callback) {
      try {
        const enrollment = await enrollmentService.createEnrollment(call.request);
        callback(null, { enrollment });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async listEnrollments(call, callback) {
      try {
        const result = await enrollmentService.listEnrollments(call.request);
        callback(null, result);
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async listEnrollmentsByStudent(call, callback) {
      try {
        const result = await enrollmentService.listEnrollmentsByStudent(call.request);
        callback(null, result);
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    async listEnrollmentsByCourse(call, callback) {
      try {
        const result = await enrollmentService.listEnrollmentsByCourse(call.request);
        callback(null, result);
      } catch (error) {
        callback(toGrpcError(error));
      }
    }
  };
}
