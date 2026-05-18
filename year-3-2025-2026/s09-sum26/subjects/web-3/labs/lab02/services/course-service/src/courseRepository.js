const TABLE_NAME = "courses";

function mapCourse(row) {
  if (!row) return row;

  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    credits: row.credits
  };
}

export function createCourseRepository(db) {
  return {
    async create(course) {
      const [createdCourse] = await db(TABLE_NAME)
        .insert(course)
        .returning(["id", "title", "description", "credits"]);

      return mapCourse(createdCourse);
    },

    async findById(id) {
      const course = await db(TABLE_NAME)
        .select("id", "title", "description", "credits")
        .where({ id })
        .first();

      return mapCourse(course);
    },

    async findAll({ limit, offset }) {
      const courses = await db(TABLE_NAME)
        .select("id", "title", "description", "credits")
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset);

      return courses.map(mapCourse);
    },

    async countAll() {
      const row = await db(TABLE_NAME).count({ count: "*" }).first();
      return Number(row.count);
    },

    async findByIds(ids) {
      if (!ids || ids.length === 0) return [];

      const courses = await db(TABLE_NAME)
        .select("id", "title", "description", "credits")
        .whereIn("id", ids);

      return courses.map(mapCourse);
    }
  };
}
