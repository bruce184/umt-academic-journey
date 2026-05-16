/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('profiles').del();

  const users = await knex('users').select('id', 'username');
  const userByName = users.reduce((acc, user) => {
    acc[user.username] = user.id;
    return acc;
  }, {});

  const profiles = [
    {
      username: 'admin1',
      display_name: 'System Admin',
      bio: 'Maintains the retro board game platform and keeps events running smoothly.',
      location: 'Control Room',
      favorite_game: 'Caro 5',
    },
    {
      username: 'user1',
      display_name: 'Pixel Captain',
      bio: 'Competitive player who loves tactical board games and collecting achievements.',
      location: 'Sai Gon',
      favorite_game: 'Tic-Tac-Toe',
    },
    {
      username: 'user2',
      display_name: 'Grid Runner',
      bio: 'Fast learner, always searching for new opponents in the hub.',
      location: 'Da Nang',
      favorite_game: 'Snake',
    },
    {
      username: 'user3',
      display_name: 'Memory Spark',
      bio: 'Enjoys pattern games and polished scoreboards.',
      location: 'Hue',
      favorite_game: 'Memory',
    },
    {
      username: 'user4',
      display_name: 'Arcade Bloom',
      bio: 'Likes colorful puzzles, rankings, and sharing tips with friends.',
      location: 'Ha Noi',
      favorite_game: 'Match-3',
    },
    {
      username: 'user5',
      display_name: 'Board Crafter',
      bio: 'Sketches ideas for new board layouts and testing flows.',
      location: 'Can Tho',
      favorite_game: 'Free Draw',
    },
  ];

  const rows = profiles
    .filter((profile) => userByName[profile.username])
    .map((profile) => ({
      user_id: userByName[profile.username],
      display_name: profile.display_name,
      bio: profile.bio,
      location: profile.location,
      favorite_game: profile.favorite_game,
    }));

  if (rows.length > 0) {
    await knex('profiles').insert(rows);
  }
};
