export async function up(knex) {
  // 1) instructors 
  await knex.schema.createTable('instructors', (t) => {
    t.increments('instructor_id').primary(); // SERIAL PK
    t.string('name').notNullable();
    t.integer('total_students').notNullable().defaultTo(0);
    t.text('bio');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 2) courses (cần FK instructor_id)
  await knex.schema.createTable('courses', (t) => {
    t.increments('course_id').primary(); // SERIAL PK
    t.string('title').notNullable();
    t.text('description');
    t.string('image_url');

    t.integer('instructor_id')
      .notNullable()
      .references('instructor_id')
      .inTable('instructors')
      .onDelete('RESTRICT');

    t.decimal('rating', 3, 2).defaultTo(0);
    t.integer('total_reviews').defaultTo(0);

    t.decimal('total_hours', 6, 2).defaultTo(0);
    t.integer('total_lectures').defaultTo(0);

    t.string('level');
    t.decimal('current_price', 10, 2).defaultTo(0);
    t.decimal('original_price', 10, 2).defaultTo(0);

    t.boolean('is_bestseller').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index(['instructor_id']);
  });
}

export async function down(knex) {
  // drop ngược thứ tự để tránh lỗi FK
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('instructors');
}
