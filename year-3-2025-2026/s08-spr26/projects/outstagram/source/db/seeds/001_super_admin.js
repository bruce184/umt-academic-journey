/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Find a user to make super_admin
  let adminUser = await knex('profiles').where({ username: 'bruce' }).first();

  if (!adminUser) {
    adminUser = await knex('profiles').first();
  }

  if (adminUser) {
    await knex('profiles')
      .where({ user_id: adminUser.user_id })
      .update({ role: 'super_admin' });

    console.log(`Seeded Super Admin: ${adminUser.username || adminUser.display_name} (${adminUser.user_id})`);
  } else {
    console.log("No profiles found to seed super_admin.");
  }
}
