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

export function createCourseService(courseRepository) {
  return {
    async getCourse(id) {
      const course = await courseRepository.findById(id);

      if (!course) {
        const error = new Error("Course not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      return course;
    },

    async createCourse({ title, description = "", credits }) {
      const safeCredits = Number(credits);

      if (!title || !Number.isInteger(safeCredits) || safeCredits <= 0) {
        const error = new Error("Title and positive credits are required");
        error.code = "INVALID_ARGUMENT";
        throw error;
      }

      return courseRepository.create({
        title,
        description,
        credits: safeCredits
      });
    },

    async listCourses({ limit, offset }) {
      const pagination = normalizePagination(limit, offset);

      const [courses, total] = await Promise.all([
        courseRepository.findAll(pagination),
        courseRepository.countAll()
      ]);

      return {
        courses,
        page_info: buildPageInfo({
          total,
          limit: pagination.limit,
          offset: pagination.offset
        })
      };
    },

    async batchGetCourses(ids) {
      return courseRepository.findByIds(ids);
    }
  };
}
