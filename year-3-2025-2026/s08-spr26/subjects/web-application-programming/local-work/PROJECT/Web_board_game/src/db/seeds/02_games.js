/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    await knex('games').del();
    await knex('games').insert([
        {
            name: 'Tic-Tac-Toe', description: 'Simple 3x3 grid game.', min_players: 1, max_players: 2,
            instructions: 'Move the cursor with the d-pad, press Enter to place a symbol, and complete three in a row before the computer does.', board_size: 3, default_timer: 30, score_type: 'wins'
        },
        {
            name: 'Caro 5', description: 'Classic Caro game with 5-in-a-row to win.', min_players: 1, max_players: 2,
            instructions: 'Choose a side, move across the board with the d-pad, and connect five stones before the computer blocks you.', board_size: 12, default_timer: 60, score_type: 'wins'
        },
        {
            name: 'Caro 4', description: 'Caro game with 4-in-a-row to win.', min_players: 1, max_players: 2,
            instructions: 'This faster Caro mode only needs four stones in a row. Move, place, and pressure the computer early.', board_size: 12, default_timer: 60, score_type: 'wins'
        },
        {
            name: 'Snake', description: 'Classic Snake game.', min_players: 1, max_players: 1,
            instructions: 'Use the d-pad to steer, collect food, avoid collisions, and press Enter to pause or resume.', board_size: 20, default_timer: 90, score_type: 'score'
        },
        {
            name: 'Match-3', description: 'Match 3 similar blocks.', min_players: 1, max_players: 1,
            instructions: 'Select a tile, choose an adjacent tile to swap, and build lines of three or more before the timer expires.', board_size: 8, default_timer: 120, score_type: 'score'
        },
        {
            name: 'Memory', description: 'Card matching game.', min_players: 1, max_players: 1,
            instructions: 'Reveal cards with Enter, remember their colors, and clear the board before time runs out.', board_size: 6, default_timer: 180, score_type: 'time'
        },
        {
            name: 'Free Draw', description: 'Draw on the matrix.', min_players: 1, max_players: 1,
            instructions: 'Move around the canvas, hop into palette mode from the top row, pick a color, and paint or erase pixels.', board_size: 16, default_timer: 0, score_type: 'none'
        }
    ]);
};
