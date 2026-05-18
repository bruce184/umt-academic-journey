import "dotenv/config";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { grpc } from "./grpcClient.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function toGraphQLError(error, fallbackMessage = "Internal server error") {
  if (error.code === grpc.status.NOT_FOUND) {
    return new GraphQLError(error.details || "Resource not found", {
      extensions: {
        code: "NOT_FOUND"
      }
    });
  }

  if (error.code === grpc.status.INVALID_ARGUMENT) {
    return new GraphQLError(error.details || "Invalid argument", {
      extensions: {
        code: "BAD_USER_INPUT"
      }
    });
  }

  if (error.code === grpc.status.ALREADY_EXISTS) {
    return new GraphQLError(error.details || "Resource already exists", {
      extensions: {
        code: "ALREADY_EXISTS"
      }
    });
  }

  if (error.code === grpc.status.UNAVAILABLE) {
    return new GraphQLError("A backend service is unavailable", {
      extensions: {
        code: "SERVICE_UNAVAILABLE"
      }
    });
  }

  if (error.code === grpc.status.DEADLINE_EXCEEDED) {
    return new GraphQLError("A backend service timed out", {
      extensions: {
        code: "SERVICE_TIMEOUT"
      }
    });
  }

  return new GraphQLError(fallbackMessage, {
    extensions: {
      code: "INTERNAL_SERVER_ERROR"
    }
  });
}

function mapPageInfo(pageInfo) {
  return {
    total: pageInfo.total,
    limit: pageInfo.limit,
    offset: pageInfo.offset,
    hasNextPage: pageInfo.has_next_page,
    hasPreviousPage: pageInfo.has_previous_page
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sortByInputIds(items, ids) {
  const map = new Map(items.map((item) => [item.id, item]));

  return ids
    .map((id) => map.get(id))
    .filter(Boolean);
}

function enrollmentStudentId(enrollment) {
  return enrollment.student_id || enrollment.studentId;
}

function enrollmentCourseId(enrollment) {
  return enrollment.course_id || enrollment.courseId;
}

export const resolvers = {
  Query: {
    async student(_, { id }, ctx) {
      try {
        const response = await ctx.grpc.student.call("getStudent", {
          id
        });

        return response.student;
      } catch (error) {
        if (error.code === grpc.status.NOT_FOUND) {
          return null;
        }

        throw toGraphQLError(error, "Cannot load student");
      }
    },

    async me(_, args, ctx) {
      if (!ctx.currentStudentId) {
        return null;
      }

      try {
        const response = await ctx.grpc.student.call("getStudent", {
          id: ctx.currentStudentId
        });

        return response.student;
      } catch (error) {
        return null;
      }
    },

    async students(_, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.student.call("listStudents", {
          limit,
          offset
        });

        return response.students;
      } catch (error) {
        throw toGraphQLError(error, "Cannot load students");
      }
    },

    async studentsPage(_, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.student.call("listStudents", {
          limit,
          offset
        });

        return {
          items: response.students,
          pageInfo: mapPageInfo(response.page_info)
        };
      } catch (error) {
        throw toGraphQLError(error, "Cannot load students page");
      }
    },

    async course(_, { id }, ctx) {
      try {
        const response = await ctx.grpc.course.call("getCourse", {
          id
        });

        return response.course;
      } catch (error) {
        if (error.code === grpc.status.NOT_FOUND) {
          return null;
        }

        throw toGraphQLError(error, "Cannot load course");
      }
    },

    async courses(_, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.course.call("listCourses", {
          limit,
          offset
        });

        return response.courses;
      } catch (error) {
        throw toGraphQLError(error, "Cannot load courses");
      }
    },

    async coursesPage(_, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.course.call("listCourses", {
          limit,
          offset
        });

        return {
          items: response.courses,
          pageInfo: mapPageInfo(response.page_info)
        };
      } catch (error) {
        throw toGraphQLError(error, "Cannot load courses page");
      }
    },

    async enrollment(_, { id }, ctx) {
      try {
        const response = await ctx.grpc.enrollment.call("getEnrollment", {
          id
        });

        return response.enrollment;
      } catch (error) {
        if (error.code === grpc.status.NOT_FOUND) {
          return null;
        }

        throw toGraphQLError(error, "Cannot load enrollment");
      }
    },

    async enrollments(_, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.enrollment.call("listEnrollments", {
          limit,
          offset
        });

        return response.enrollments;
      } catch (error) {
        throw toGraphQLError(error, "Cannot load enrollments");
      }
    },

    async enrollmentsPage(_, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.enrollment.call("listEnrollments", {
          limit,
          offset
        });

        return {
          items: response.enrollments,
          pageInfo: mapPageInfo(response.page_info)
        };
      } catch (error) {
        throw toGraphQLError(error, "Cannot load enrollments page");
      }
    },

    async enrollmentsByStudent(_, { studentId, limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.enrollment.call("listEnrollmentsByStudent", {
          student_id: studentId,
          limit,
          offset
        });

        return response.enrollments;
      } catch (error) {
        throw toGraphQLError(error, "Cannot load student enrollments");
      }
    },

    async enrollmentsByCourse(_, { courseId, limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.enrollment.call("listEnrollmentsByCourse", {
          course_id: courseId,
          limit,
          offset
        });

        return response.enrollments;
      } catch (error) {
        throw toGraphQLError(error, "Cannot load course enrollments");
      }
    }
  },

  Mutation: {
    async login(_, { email, password }, ctx) {
      try {
        const response = await ctx.grpc.student.call("authenticateStudent", {
          email,
          password
        });

        if (!response.success || !response.student) {
          throw new GraphQLError("Invalid email or password", {
            extensions: {
              code: "UNAUTHENTICATED"
            }
          });
        }

        const token = jwt.sign(
          {
            sub: response.student.id,
            email: response.student.email
          },
          JWT_SECRET,
          {
            expiresIn: "2h"
          }
        );

        return {
          token,
          student: response.student
        };
      } catch (error) {
        console.log("resolvers-login-error:", error);
        if (error instanceof GraphQLError) {
          throw error;
        }

        throw toGraphQLError(error, "Cannot login");
      }
    },

    async createStudent(_, { input }, ctx) {
      try {
        const response = await ctx.grpc.student.call("createStudent", input);

        return response.student;
      } catch (error) {
        throw toGraphQLError(error, "Cannot create student");
      }
    },

    async createCourse(_, { input }, ctx) {
      try {
        const response = await ctx.grpc.course.call("createCourse", {
          title: input.title,
          description: input.description || "",
          credits: input.credits
        });

        return response.course;
      } catch (error) {
        throw toGraphQLError(error, "Cannot create course");
      }
    },

    async enrollStudent(_, { input }, ctx) {
      try {
        await ctx.grpc.student.call("getStudent", {
          id: input.studentId
        });
        await ctx.grpc.course.call("getCourse", {
          id: input.courseId
        });

        const response = await ctx.grpc.enrollment.call("createEnrollment", {
          student_id: input.studentId,
          course_id: input.courseId
        });

        return response.enrollment;
      } catch (error) {
        throw toGraphQLError(error, "Cannot enroll student");
      }
    }
  },

  Student: {
    id(parent) {
      return parent.id;
    },

    async enrollments(parent, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.enrollment.call("listEnrollmentsByStudent", {
          student_id: parent.id,
          limit,
          offset
        });

        return response.enrollments;
      } catch (error) {
        throw toGraphQLError(error, "Cannot load student enrollments");
      }
    },

    async courses(parent, { limit = 20, offset = 0 }, ctx) {
      try {
        const enrollmentResponse = await ctx.grpc.enrollment.call(
          "listEnrollmentsByStudent",
          {
            student_id: parent.id,
            limit,
            offset
          }
        );
        const courseIds = unique(enrollmentResponse.enrollments.map(enrollmentCourseId));

        if (courseIds.length === 0) {
          return [];
        }

        const courseResponse = await ctx.grpc.course.call("batchGetCourses", {
          ids: courseIds
        });

        return sortByInputIds(courseResponse.courses, courseIds);
      } catch (error) {
        throw toGraphQLError(error, "Cannot load student courses");
      }
    }
  },

  Course: {
    async enrollments(parent, { limit = 20, offset = 0 }, ctx) {
      try {
        const response = await ctx.grpc.enrollment.call("listEnrollmentsByCourse", {
          course_id: parent.id,
          limit,
          offset
        });

        return response.enrollments;
      } catch (error) {
        throw toGraphQLError(error, "Cannot load course enrollments");
      }
    },

    async students(parent, { limit = 20, offset = 0 }, ctx) {
      try {
        const enrollmentResponse = await ctx.grpc.enrollment.call(
          "listEnrollmentsByCourse",
          {
            course_id: parent.id,
            limit,
            offset
          }
        );
        const studentIds = unique(enrollmentResponse.enrollments.map(enrollmentStudentId));

        if (studentIds.length === 0) {
          return [];
        }

        const studentResponse = await ctx.grpc.student.call("batchGetStudents", {
          ids: studentIds
        });

        return sortByInputIds(studentResponse.students, studentIds);
      } catch (error) {
        throw toGraphQLError(error, "Cannot load course students");
      }
    }
  },

  Enrollment: {
    studentId(parent) {
      return enrollmentStudentId(parent);
    },

    courseId(parent) {
      return enrollmentCourseId(parent);
    },

    async student(parent, args, ctx) {
      try {
        const response = await ctx.grpc.student.call("getStudent", {
          id: enrollmentStudentId(parent)
        });

        return response.student;
      } catch (error) {
        return null;
      }
    },

    async course(parent, args, ctx) {
      try {
        const response = await ctx.grpc.course.call("getCourse", {
          id: enrollmentCourseId(parent)
        });

        return response.course;
      } catch (error) {
        return null;
      }
    }
  }
};

export { unique, sortByInputIds };
