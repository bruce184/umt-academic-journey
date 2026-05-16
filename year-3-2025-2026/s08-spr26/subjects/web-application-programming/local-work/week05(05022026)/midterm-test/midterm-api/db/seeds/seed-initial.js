import bcrypt from "bcryptjs";

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("todos").del();
  await knex("users").del();

  const password_hash = await bcrypt.hash("123456", 10);

  const [user] = await knex("users")
    .insert({ name: "Demo", email: "demo@gmail.com", password_hash })
    .returning(["id"]);

  await knex("todos").insert([
    { user_id: user.id, title: "Learn Express", status: "PENDING" },
    { user_id: user.id, title: "Write swagger-jsdoc", status: "DONE" }
  ]);
}
