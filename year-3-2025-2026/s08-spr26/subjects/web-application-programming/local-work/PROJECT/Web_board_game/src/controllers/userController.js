const db = require('../db/db');

exports.getProfile = async (req, res) => {
    res.json({
        status: 'success',
        data: { user: req.user }
    });
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await db('users').select('id', 'username', 'email', 'role', 'created_at');
        res.json(users);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await db('user_stats').where({ user_id: userId }).first();
        if (!stats) {
            return res.json({ tictactoe_wins: 0, caro_wins: 0, memory_highscore: 0 });
        }
        res.json({
            tictactoe_wins: stats.tictactoe_wins || 0,
            caro_wins: stats.caro_wins || 0,
            memory_highscore: stats.memory_highscore || 0
        });
    } catch (error) {
        console.error('Database error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

exports.updateUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { game_id, stat_type, value } = req.body;
        
        let updateQuery = '';
        const bindings = [userId, value || 1, value || 1]; 
        
        if (game_id === 'TICTACTOE' && stat_type === 'win') {
            updateQuery = `
                INSERT INTO user_stats (user_id, tictactoe_wins)
                VALUES (?, ?)
                ON CONFLICT (user_id) 
                DO UPDATE SET tictactoe_wins = user_stats.tictactoe_wins + ?
                RETURNING *;
            `;
        } else if (game_id === 'CARO' && stat_type === 'win') {
            updateQuery = `
                INSERT INTO user_stats (user_id, caro_wins)
                VALUES (?, ?)
                ON CONFLICT (user_id) 
                DO UPDATE SET caro_wins = user_stats.caro_wins + ?
                RETURNING *;
            `;
        } else if (game_id === 'MEMORY' && stat_type === 'highscore') {
            updateQuery = `
                INSERT INTO user_stats (user_id, memory_highscore)
                VALUES (?, ?)
                ON CONFLICT (user_id) 
                DO UPDATE SET memory_highscore = GREATEST(user_stats.memory_highscore, ?)
                RETURNING *;
            `;
        } else {
            return res.status(400).json({ error: 'Invalid update parameters' });
        }
        
        const result = await db.raw(updateQuery, bindings);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Database error updating stats:', error);
        res.status(500).json({ error: 'Failed to update user stats' });
    }
};

// Di chuyển save/load game ra gameController và ranking ra rankingController
