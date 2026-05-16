const SESSION_OFFSETS = [0, 1, 2];

const USER_SKILL = {
    admin1: 88,
    user1: 94,
    user2: 86,
    user3: 82,
    user4: 79,
    user5: 72,
};

const FAVORITE_GAME_BONUS = {
    admin1: 'Caro 5',
    user1: 'Tic-Tac-Toe',
    user2: 'Snake',
    user3: 'Memory',
    user4: 'Match-3',
    user5: 'Free Draw',
};

const GAME_REVIEW_COPY = {
    'Tic-Tac-Toe': 'The 3x3 board is quick to read and the CPU pace makes it easy to demo.',
    'Caro 5': 'The larger board opens strong tactical lines and works well for showcasing saves.',
    'Caro 4': 'This shorter Caro mode feels faster and is good for quick rematches.',
    Snake: 'Movement is responsive and the score loop is clear for spectators.',
    'Match-3': 'The swap rules are readable and combos give immediate feedback on the matrix.',
    Memory: 'The timer pressure fits the matching loop and rewards careful attention.',
    'Free Draw': 'Palette mode makes the drawing workflow obvious during presentation.',
};

const at = (dayOffset, hourOffset, minuteOffset) =>
    new Date(Date.UTC(2026, 2, 10 + dayOffset, 8 + hourOffset, minuteOffset, 0));

const buildSession = ({ game, username, userId, gameIndex, sessionIndex }) => {
    const skill = USER_SKILL[username] || 70;
    const favoriteBonus = FAVORITE_GAME_BONUS[username] === game.name ? 28 : 0;

    let score = 0;
    let duration = 0;

    if (game.score_type === 'wins') {
        score = 80 + skill + favoriteBonus + sessionIndex * 12;
        duration = 35 + (gameIndex * 5) + sessionIndex * 8;
    } else if (game.score_type === 'score') {
        score = 220 + skill * 7 + favoriteBonus + gameIndex * 18 + sessionIndex * 16;
        duration = 70 + gameIndex * 6 + sessionIndex * 10;
    } else if (game.score_type === 'time') {
        score = 900 - sessionIndex * 35;
        duration = Math.max(45, 185 - skill - favoriteBonus + gameIndex * 4 + sessionIndex * 7);
    } else {
        score = 0;
        duration = 40 + gameIndex * 5 + sessionIndex * 6;
    }

    return {
        game_id: game.id,
        user_id: userId,
        score,
        duration,
        played_at: at(gameIndex, sessionIndex * 2, gameIndex * 7 + sessionIndex * 9),
    };
};

const buildRating = ({ game, username, userId, gameIndex }) => {
    const favoriteBonus = FAVORITE_GAME_BONUS[username] === game.name ? 1 : 0;
    const rating = Math.min(5, Math.max(3, 3 + ((gameIndex + username.length + favoriteBonus) % 3)));

    return {
        user_id: userId,
        game_id: game.id,
        rating,
        comment: `${GAME_REVIEW_COPY[game.name]} ${username} rated it ${rating}/5 in the seeded demo data.`,
        created_at: at(gameIndex + 3, username.length, gameIndex * 5),
        updated_at: at(gameIndex + 3, username.length, gameIndex * 5),
    };
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex('ratings').del();
    await knex('game_sessions').del();

    const users = await knex('users').select('id', 'username');
    const games = await knex('games').select('id', 'name', 'score_type');

    if (users.length === 0 || games.length === 0) {
        console.warn('Skipping seeds: No users or games found.');
        return;
    }

    const sessions = [];
    const ratings = [];

    games.forEach((game, gameIndex) => {
        users.forEach(({ id: userId, username }) => {
            SESSION_OFFSETS.forEach((sessionIndex) => {
                sessions.push(
                    buildSession({
                        game,
                        username,
                        userId,
                        gameIndex,
                        sessionIndex,
                    })
                );
            });

            ratings.push(
                buildRating({
                    game,
                    username,
                    userId,
                    gameIndex,
                })
            );
        });
    });

    if (sessions.length > 0) {
        await knex('game_sessions').insert(sessions);
    }

    if (ratings.length > 0) {
        await knex('ratings').insert(ratings);
    }
};
