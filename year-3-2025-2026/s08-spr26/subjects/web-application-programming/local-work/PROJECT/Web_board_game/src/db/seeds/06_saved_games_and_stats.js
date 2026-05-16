const findGameId = (games, gameName) => games.find((game) => game.name === gameName)?.id;

const fixedDeck = [
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 0, 1, 2],
    [3, 4, 5, 6, 7, 8],
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 0, 1, 2],
    [3, 4, 5, 6, 7, 8],
];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    await knex('saved_games').del();
    await knex('user_stats').del();

    const users = await knex('users').select('id', 'username');
    const games = await knex('games').select('id', 'name');
    const userByName = users.reduce((acc, user) => {
        acc[user.username] = user.id;
        return acc;
    }, {});

    const statsRows = [
        { username: 'user1', tictactoe_wins: 12, caro_wins: 7, memory_highscore: 940 },
        { username: 'user2', tictactoe_wins: 6, caro_wins: 9, memory_highscore: 810 },
        { username: 'user3', tictactoe_wins: 5, caro_wins: 4, memory_highscore: 980 },
        { username: 'user4', tictactoe_wins: 4, caro_wins: 5, memory_highscore: 760 },
        { username: 'user5', tictactoe_wins: 3, caro_wins: 2, memory_highscore: 700 },
    ]
        .filter((row) => userByName[row.username])
        .map((row) => ({
            user_id: userByName[row.username],
            tictactoe_wins: row.tictactoe_wins,
            caro_wins: row.caro_wins,
            memory_highscore: row.memory_highscore,
            created_at: new Date('2026-03-20T08:00:00Z'),
            updated_at: new Date('2026-03-20T08:00:00Z'),
        }));

    const savedGames = [
        {
            username: 'user1',
            gameName: 'Tic-Tac-Toe',
            state: {
                board: ['X', 'O', null, null, 'X', null, 'O', null, null],
                cursorIndex: 5,
                playerSide: 'X',
                isPlayerTurn: true,
                elapsedSeconds: 22,
            },
        },
        {
            username: 'user2',
            gameName: 'Snake',
            state: {
                snake: [
                    { row: 10, col: 10 },
                    { row: 10, col: 9 },
                    { row: 10, col: 8 },
                    { row: 10, col: 7 },
                ],
                food: { row: 6, col: 13 },
                direction: 'RIGHT',
                queuedDirection: 'RIGHT',
                elapsedSeconds: 34,
                score: 30,
                isRunning: true,
            },
        },
        {
            username: 'user3',
            gameName: 'Memory',
            state: {
                deck: fixedDeck,
                revealed: ['0-0', '0-1'],
                matched: ['2-2', '4-4'],
                cursor: { row: 1, col: 2 },
                moves: 7,
                elapsedSeconds: 41,
            },
        },
        {
            username: 'user4',
            gameName: 'Free Draw',
            state: {
                pixels: Array.from({ length: 16 }, (_, row) =>
                    Array.from({ length: 16 }, (_, col) =>
                        row === col || row + col === 15 ? '#38bdf8' : null
                    )
                ),
                cursor: { row: 8, col: 8 },
                mode: 'canvas',
                paletteCursor: 4,
                currentColorIndex: 4,
            },
        },
    ]
        .filter((row) => userByName[row.username] && findGameId(games, row.gameName))
        .map((row, index) => ({
            user_id: userByName[row.username],
            game_id: findGameId(games, row.gameName),
            game_state: row.state,
            created_at: new Date(Date.UTC(2026, 2, 21, 8 + index, 0, 0)),
            updated_at: new Date(Date.UTC(2026, 2, 21, 8 + index, 0, 0)),
        }));

    if (statsRows.length > 0) {
        await knex('user_stats').insert(statsRows);
    }

    if (savedGames.length > 0) {
        await knex('saved_games').insert(savedGames);
    }
};
