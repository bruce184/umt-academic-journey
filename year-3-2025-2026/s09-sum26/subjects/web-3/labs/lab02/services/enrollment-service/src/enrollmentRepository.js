const TABLE_NAME = "enrollments";

function mapEnrollment(row) {
  if (!row) return row;

  return {
    id: String(row.id),
    student_id: String(row.student_id),
    course_id: String(row.course_id),
    status: row.status
  };
}

export function createEnrollmentRepository(db) {
  return {
    async create(enrollment) {
      const [createdEnrollment] = await db(TABLE_NAME)
        .insert(enrollment)
        .returning(["id", "student_id", "course_id", "status"]);

      return mapEnrollment(createdEnrollment);
    },

    async findById(id) {
      const enrollment = await db(TABLE_NAME)
        .select("id", "student_id", "course_id", "status")
        .where({ id })
        .first();

      return mapEnrollment(enrollment);
    },

    async findByStudentAndCourse(studentId, courseId) {
      const enrollment = await db(TABLE_NAME)
        .select("id", "student_id", "course_id", "status")
        .where({
          student_id: studentId,
          course_id: courseId
        })
        .first();

      return mapEnrollment(enrollment);
    },

    async findAll({ limit, offset, studentId, courseId }) {
      const query = db(TABLE_NAME)
        .select("id", "student_id", "course_id", "status")
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset);

      if (studentId) {
        query.where({ student_id: studentId });
      }

      if (courseId) {
        query.where({ course_id: courseId });
      }

      const enrollments = await query;

      return enrollments.map(mapEnrollment);
    },

    async countAll({ studentId, courseId } = {}) {
      const query = db(TABLE_NAME).count({ count: "*" });

      if (studentId) {
        query.where({ student_id: studentId });
      }

      if (courseId) {
        query.where({ course_id: courseId });
      }

      const row = await query.first();
      return Number(row.count);
    }
  };
}
