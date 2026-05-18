const ENROLLMENT_STATUS_ACTIVE = "ACTIVE";

function normalizePagination(limit, offset) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  return {
    limit: safeLimit,
    offset: safeOffset
  };
}

function buildPageInfo({ total, limit, offset }) {
  return {
    total,
    limit,
    offset,
    has_next_page: offset + limit < total,
    has_previous_page: offset > 0
  };
}

export function createEnrollmentService(enrollmentRepository) {
  async function listWithFilter({ limit, offset, studentId, courseId }) {
    const pagination = normalizePagination(limit, offset);
    const filter = {
      studentId,
      courseId
    };

    const [enrollments, total] = await Promise.all([
      enrollmentRepository.findAll({
        ...pagination,
        ...filter
      }),
      enrollmentRepository.countAll(filter)
    ]);

    return {
      enrollments,
      page_info: buildPageInfo({
        total,
        limit: pagination.limit,
        offset: pagination.offset
      })
    };
  }

  return {
    async getEnrollment(id) {
      const enrollment = await enrollmentRepository.findById(id);

      if (!enrollment) {
        const error = new Error("Enrollment not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      return enrollment;
    },

    async createEnrollment({ student_id: studentId, course_id: courseId }) {
      if (!studentId || !courseId) {
        const error = new Error("Student id and course id are required");
        error.code = "INVALID_ARGUMENT";
        throw error;
      }

      const existing = await enrollmentRepository.findByStudentAndCourse(
        studentId,
        courseId
      );

      if (existing) {
        const error = new Error("Student is already enrolled in this course");
        error.code = "ALREADY_EXISTS";
        throw error;
      }

      return enrollmentRepository.create({
        student_id: studentId,
        course_id: courseId,
        status: ENROLLMENT_STATUS_ACTIVE
      });
    },

    async listEnrollments({ limit, offset }) {
      return listWithFilter({ limit, offset });
    },

    async listEnrollmentsByStudent({ student_id: studentId, limit, offset }) {
      if (!studentId) {
        const error = new Error("Student id is required");
        error.code = "INVALID_ARGUMENT";
        throw error;
      }

      return listWithFilter({ limit, offset, studentId });
    },

    async listEnrollmentsByCourse({ course_id: courseId, limit, offset }) {
      if (!courseId) {
        const error = new Error("Course id is required");
        error.code = "INVALID_ARGUMENT";
        throw error;
      }

      return listWithFilter({ limit, offset, courseId });
    }
  };
}
