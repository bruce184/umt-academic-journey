export async function seed(knex) {
  // theo thứ tự tránh FK
  await knex('courses').del();
  await knex('instructors').del();

  // 1) insert instructors
  await knex('instructors').insert([
    { name: 'Angela Yu', total_students: 1200000, bio: 'Full-stack instructor.' },
    { name: 'Maximilian Schwarzmüller', total_students: 980000, bio: 'JavaScript & React expert.' },
    { name: 'Jose Portilla', total_students: 650000, bio: 'Data science & Python.' },
  ]);

  // 2) lấy lại id theo name
  const instructors = await knex('instructors')
    .select('instructor_id', 'name');

  const idOf = (name) => instructors.find(x => x.name === name)?.instructor_id;

  // 3) insert courses
  await knex('courses').insert([
    {
      title: 'The Complete Web Development Bootcamp',
      description: 'HTML, CSS, JS, Node, DB...',
      image_url: 'https://picsum.photos/seed/web/600/350',
      instructor_id: idOf('Angela Yu'),
      rating: 4.7,
      total_reviews: 350000,
      total_hours: 55.5,
      total_lectures: 400,
      level: 'All Levels',
      current_price: 12.99,
      original_price: 84.99,
      is_bestseller: true,
    },
    {
      title: 'React - The Complete Guide',
      description: 'React fundamentals to advanced.',
      image_url: 'https://picsum.photos/seed/react/600/350',
      instructor_id: idOf('Maximilian Schwarzmüller'),
      rating: 4.6,
      total_reviews: 210000,
      total_hours: 48.0,
      total_lectures: 520,
      level: 'All Levels',
      current_price: 14.99,
      original_price: 89.99,
      is_bestseller: true,
    },
    {
      title: 'Python for Data Science',
      description: 'NumPy, Pandas, ML basics.',
      image_url: 'https://picsum.photos/seed/python/600/350',
      instructor_id: idOf('Jose Portilla'),
      rating: 4.5,
      total_reviews: 120000,
      total_hours: 22.0,
      total_lectures: 180,
      level: 'Beginner',
      current_price: 11.99,
      original_price: 69.99,
      is_bestseller: false,
    },
  ]);
}
